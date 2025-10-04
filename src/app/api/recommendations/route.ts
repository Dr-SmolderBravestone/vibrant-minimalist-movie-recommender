import { NextRequest, NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

interface MovieResult {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
  popularity: number;
  // Enhanced fields
  vote_count?: number;
  original_language?: string;
  adult?: boolean;
}

interface EnhancedMovie extends MovieResult {
  match_score: number;
  confidence: number;
  reasons: string[];
  recommendation_type: 'similar' | 'genre' | 'trending' | 'hidden-gem' | 'director' | 'diverse';
}

interface MovieDetails {
  credits?: {
    cast: Array<{ id: number; name: string }>;
    crew: Array<{ id: number; name: string; job: string }>;
  };
  keywords?: {
    keywords: Array<{ id: number; name: string }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const likedMovieIds = searchParams.get('liked_movies') || '';
    const preferredGenres = searchParams.get('genres') || '';
    const searchHistory = searchParams.get('search_history') || '';
    const limit = parseInt(searchParams.get('limit') || '24');

    const recommendations = new Map<number, EnhancedMovie>();
    const movieDetailsCache = new Map<number, MovieDetails>();

    // === STRATEGY 1: COLLABORATIVE FILTERING ===
    // Get recommendations based on liked movies with enhanced scoring
    if (likedMovieIds) {
      const movieIds = likedMovieIds.split(',').filter(id => id.trim());
      
      for (const movieId of movieIds.slice(0, 5)) {
        try {
          // Fetch similar movies
          const [recResponse, detailsResponse] = await Promise.all([
            fetch(`${TMDB_BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=1`),
            fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,keywords`)
          ]);
          
          if (recResponse.ok) {
            const data = await recResponse.json();
            const movies = (data.results || []).slice(0, 8) as MovieResult[];
            
            // Cache movie details for director/actor matching
            if (detailsResponse.ok) {
              const details = await detailsResponse.json();
              movieDetailsCache.set(parseInt(movieId), details);
            }
            
            movies.forEach((movie, index) => {
              const baseScore = 100 - (index * 5); // Position-based scoring
              const existingMovie = recommendations.get(movie.id);
              
              if (!existingMovie) {
                recommendations.set(movie.id, {
                  ...movie,
                  match_score: baseScore,
                  confidence: 85 + (movie.vote_average / 10) * 15,
                  reasons: [`Similar to movies you liked`],
                  recommendation_type: 'similar'
                });
              } else {
                // Boost score if recommended multiple times
                existingMovie.match_score += baseScore * 0.5;
                existingMovie.confidence = Math.min(99, existingMovie.confidence + 5);
                if (!existingMovie.reasons.includes('Similar to multiple liked movies')) {
                  existingMovie.reasons.push('Similar to multiple liked movies');
                }
              }
            });
          }
        } catch (error) {
          console.error(`Error in collaborative filtering for ${movieId}:`, error);
        }
      }
    }

    // === STRATEGY 2: CONTENT-BASED FILTERING (GENRE) ===
    if (preferredGenres) {
      const genreIds = preferredGenres.split(',').filter(id => id.trim());
      
      for (const genreId of genreIds.slice(0, 3)) {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=500&page=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const movies = (data.results || []).slice(0, 6) as MovieResult[];
            
            movies.forEach((movie, index) => {
              const baseScore = 80 - (index * 4);
              const existing = recommendations.get(movie.id);
              
              if (!existing) {
                recommendations.set(movie.id, {
                  ...movie,
                  match_score: baseScore,
                  confidence: 75 + (movie.vote_average / 10) * 15,
                  reasons: ['Matches your genre preferences'],
                  recommendation_type: 'genre'
                });
              } else {
                existing.match_score += baseScore * 0.6;
                existing.confidence = Math.min(99, existing.confidence + 8);
                existing.reasons.push('Perfect genre match');
              }
            });
          }
        } catch (error) {
          console.error(`Error in genre filtering for ${genreId}:`, error);
        }
      }
    }

    // === STRATEGY 3: DIRECTOR/ACTOR-BASED RECOMMENDATIONS ===
    if (likedMovieIds) {
      const directors = new Set<number>();
      const actors = new Set<number>();
      
      // Extract directors and actors from cached details
      movieDetailsCache.forEach((details) => {
        if (details.credits?.crew) {
          details.credits.crew
            .filter(c => c.job === 'Director')
            .forEach(d => directors.add(d.id));
        }
        if (details.credits?.cast) {
          details.credits.cast.slice(0, 3).forEach(a => actors.add(a.id));
        }
      });

      // Get movies by same directors (limit to top 2 directors)
      const topDirectors = Array.from(directors).slice(0, 2);
      for (const directorId of topDirectors) {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_crew=${directorId}&sort_by=vote_average.desc&vote_count.gte=200`
          );
          
          if (response.ok) {
            const data = await response.json();
            const movies = (data.results || []).slice(0, 4) as MovieResult[];
            
            movies.forEach((movie) => {
              const existing = recommendations.get(movie.id);
              const score = 75;
              
              if (!existing) {
                recommendations.set(movie.id, {
                  ...movie,
                  match_score: score,
                  confidence: 82,
                  reasons: ['Same director as movies you loved'],
                  recommendation_type: 'director'
                });
              } else {
                existing.match_score += score * 0.7;
                existing.confidence = Math.min(99, existing.confidence + 10);
                existing.reasons.push('Same acclaimed director');
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching director movies:`, error);
        }
      }
    }

    // === STRATEGY 4: HIDDEN GEMS (High ratings, lower popularity) ===
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=300&vote_count.lte=3000&vote_average.gte=7.5&page=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        const movies = (data.results || []).slice(0, 8) as MovieResult[];
        
        movies.forEach((movie) => {
          if (!recommendations.has(movie.id)) {
            recommendations.set(movie.id, {
              ...movie,
              match_score: 70,
              confidence: 78,
              reasons: ['Hidden gem - highly rated but underrated'],
              recommendation_type: 'hidden-gem'
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching hidden gems:', error);
    }

    // === STRATEGY 5: TRENDING WITH RECENCY BOOST ===
    if (recommendations.size < 15) {
      try {
        const response = await fetch(
          `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          const movies = (data.results || []).slice(0, 12) as MovieResult[];
          
          movies.forEach((movie) => {
            const existing = recommendations.get(movie.id);
            const score = 65;
            
            if (!existing) {
              recommendations.set(movie.id, {
                ...movie,
                match_score: score,
                confidence: 70,
                reasons: ['Trending now'],
                recommendation_type: 'trending'
              });
            } else {
              existing.reasons.push('Also trending');
              existing.match_score += score * 0.3;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching trending:', error);
      }
    }

    // === STRATEGY 6: DIVERSITY INJECTION ===
    // Ensure genre diversity in recommendations
    if (preferredGenres) {
      const preferredSet = new Set(preferredGenres.split(',').map(id => parseInt(id)));
      const diverseGenres = [28, 878, 18, 35, 27, 10749, 14, 53]; // Action, SciFi, Drama, Comedy, Horror, Romance, Fantasy, Thriller
      const unusedGenres = diverseGenres.filter(g => !preferredSet.has(g));
      
      for (const genreId of unusedGenres.slice(0, 2)) {
        try {
          const response = await fetch(
            `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=vote_average.desc&vote_count.gte=1000&page=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            const movies = (data.results || []).slice(0, 3) as MovieResult[];
            
            movies.forEach((movie) => {
              if (!recommendations.has(movie.id)) {
                recommendations.set(movie.id, {
                  ...movie,
                  match_score: 55,
                  confidence: 65,
                  reasons: ['Expand your horizons - different genre'],
                  recommendation_type: 'diverse'
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error in diversity injection:`, error);
        }
      }
    }

    // === STRATEGY 7: SEARCH HISTORY SEMANTIC BOOST ===
    if (searchHistory) {
      const searchTerms = searchHistory.toLowerCase().split(',').map(t => t.trim());
      
      recommendations.forEach((movie) => {
        const movieText = `${movie.title} ${movie.overview}`.toLowerCase();
        let matchCount = 0;
        const matchedTerms: string[] = [];
        
        searchTerms.forEach(term => {
          if (movieText.includes(term)) {
            matchCount++;
            matchedTerms.push(term);
          }
        });
        
        if (matchCount > 0) {
          movie.match_score += matchCount * 15;
          movie.confidence = Math.min(99, movie.confidence + matchCount * 5);
          movie.reasons.push(`Matches your interest in: ${matchedTerms.join(', ')}`);
        }
      });
    }

    // === ADVANCED ML-INSPIRED RANKING ALGORITHM ===
    const rankedRecommendations = Array.from(recommendations.values())
      .map(movie => {
        // Multi-factor scoring with weighted features
        const recencyScore = getRecencyScore(movie.release_date);
        const popularityScore = Math.min(100, (movie.popularity / 100) * 100);
        const ratingScore = (movie.vote_average / 10) * 100;
        const voteCountScore = movie.vote_count ? Math.min(100, (movie.vote_count / 5000) * 100) : 50;
        
        // Weighted ensemble scoring
        const finalScore = 
          (movie.match_score * 0.35) +          // 35% match score from strategies
          (ratingScore * 0.25) +                 // 25% TMDB rating
          (recencyScore * 0.15) +                // 15% recency
          (popularityScore * 0.15) +             // 15% popularity
          (voteCountScore * 0.10);               // 10% vote count (reliability)
        
        return {
          ...movie,
          final_score: finalScore,
          match_score: Math.round(movie.match_score),
          confidence: Math.round(movie.confidence)
        };
      })
      .sort((a, b) => b.final_score - a.final_score)
      .slice(0, limit);

    // Calculate recommendation quality metrics
    const avgConfidence = rankedRecommendations.reduce((sum, m) => sum + m.confidence, 0) / rankedRecommendations.length;
    const strategyDistribution = rankedRecommendations.reduce((acc, m) => {
      acc[m.recommendation_type] = (acc[m.recommendation_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      recommendations: rankedRecommendations,
      total: rankedRecommendations.length,
      algorithm: 'advanced-hybrid-ml-v2',
      avg_confidence: Math.round(avgConfidence),
      strategy_distribution: strategyDistribution,
      strategies_used: [
        likedMovieIds ? 'collaborative-filtering' : null,
        preferredGenres ? 'content-based-filtering' : null,
        likedMovieIds ? 'director-actor-matching' : null,
        'hidden-gems-discovery',
        'trending-boost',
        searchHistory ? 'semantic-search-matching' : null,
        preferredGenres ? 'diversity-injection' : null,
        'multi-factor-ml-ranking'
      ].filter(Boolean)
    });

  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({
      error: 'Failed to generate recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// === HELPER FUNCTIONS ===

function getRecencyScore(releaseDate: string): number {
  if (!releaseDate) return 50;
  
  const releaseYear = new Date(releaseDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearDiff = currentYear - releaseYear;
  
  if (yearDiff <= 0) return 100;  // Upcoming/current year
  if (yearDiff <= 1) return 95;
  if (yearDiff <= 2) return 85;
  if (yearDiff <= 3) return 75;
  if (yearDiff <= 5) return 65;
  if (yearDiff <= 10) return 50;
  if (yearDiff <= 20) return 35;
  return 20; // Classics
}