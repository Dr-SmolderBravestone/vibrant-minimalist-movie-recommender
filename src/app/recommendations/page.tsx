"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Film, RefreshCw, Settings, MessageSquare, TrendingUp, Award, Zap, Lightbulb, Users, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import MovieDetailsDialog from "@/components/MovieDetailsDialog";

interface Genre {
  id: number;
  name: string;
}

interface EnhancedMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path: string | null;
  overview: string;
  popularity: number;
  match_score: number;
  confidence: number;
  reasons: string[];
  recommendation_type: 'similar' | 'genre' | 'trending' | 'hidden-gem' | 'director' | 'diverse';
}

interface RecommendationsResponse {
  recommendations: EnhancedMovie[];
  total: number;
  algorithm: string;
  avg_confidence: number;
  strategy_distribution: Record<string, number>;
  strategies_used: string[];
}

export default function RecommendationsPage() {
  const [allRecommendations, setAllRecommendations] = useState<EnhancedMovie[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<EnhancedMovie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [preferences, setPreferences] = useState({
    likedMovies: "",
    genres: "",
    searchHistory: ""
  });

  const [stats, setStats] = useState({
    avgConfidence: 0,
    algorithm: '',
    strategyDistribution: {} as Record<string, number>,
    strategiesUsed: [] as string[]
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    // Filter recommendations based on selected filter
    if (selectedFilter === 'all') {
      setFilteredRecommendations(allRecommendations);
    } else {
      setFilteredRecommendations(
        allRecommendations.filter((m) => m.recommendation_type === selectedFilter)
      );
    }
  }, [selectedFilter, allRecommendations]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (preferences.likedMovies) params.append("liked_movies", preferences.likedMovies);
      if (preferences.genres) params.append("genres", preferences.genres);
      if (preferences.searchHistory) params.append("search_history", preferences.searchHistory);
      params.append("limit", "24");

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const data: RecommendationsResponse = await response.json();

      setAllRecommendations(data.recommendations || []);
      setFilteredRecommendations(data.recommendations || []);
      setStats({
        avgConfidence: data.avg_confidence || 0,
        algorithm: data.algorithm || '',
        strategyDistribution: data.strategy_distribution || {},
        strategiesUsed: data.strategies_used || []
      });
    } catch (error) {
      console.error("Error loading recommendations:", error);
      setAllRecommendations([]);
      setFilteredRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getGenreName = (genreIds: number[]) => {
    if (!genreIds.length || !genres.length) return "Movie";
    const genre = genres.find((g) => g.id === genreIds[0]);
    return genre?.name || "Movie";
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-movie.jpg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDialogOpen(true);
  };

  const filterOptions = [
  { id: 'all', label: 'All Recommendations', icon: Sparkles, count: allRecommendations.length },
  { id: 'similar', label: 'Similar to Liked', icon: Users, count: allRecommendations.filter((m) => m.recommendation_type === 'similar').length },
  { id: 'genre', label: 'Genre Matches', icon: Film, count: allRecommendations.filter((m) => m.recommendation_type === 'genre').length },
  { id: 'director', label: 'Same Directors', icon: Award, count: allRecommendations.filter((m) => m.recommendation_type === 'director').length },
  { id: 'hidden-gem', label: 'Hidden Gems', icon: Lightbulb, count: allRecommendations.filter((m) => m.recommendation_type === 'hidden-gem').length },
  { id: 'trending', label: 'Trending', icon: TrendingUp, count: allRecommendations.filter((m) => m.recommendation_type === 'trending').length },
  { id: 'diverse', label: 'Explore New', icon: Zap, count: allRecommendations.filter((m) => m.recommendation_type === 'diverse').length }].
  filter((f) => f.count > 0 || f.id === 'all');

  const strategyLabels: Record<string, string> = {
    "collaborative-filtering": "Similar Movies",
    "content-based-filtering": "Genre Matching",
    "director-actor-matching": "Director/Actor",
    "hidden-gems-discovery": "Hidden Gems",
    "trending-boost": "Trending",
    "semantic-search-matching": "Search Patterns",
    "diversity-injection": "Diversity",
    "multi-factor-ml-ranking": "ML Ranking"
  };

  return (
    <div className="min-h-screen bg-background dark">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative">
        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-xl font-bold">
                <Film className="w-6 h-6 text-primary" />
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  MovieHub
                </span>
              </Link>
              
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" className="gap-2">
                    <Film className="w-4 h-4" />
                    Browse
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button variant="ghost" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Reviews
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Sparkles className="w-4 h-4" />
                    AI Recommendations
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-20 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <Sparkles className="w-12 h-12 text-primary relative" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    AI-Powered Recommendations
                  </span>
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {stats.algorithm &&
                  <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-3 h-3" />
                      Powered by {stats.algorithm}
                    </span>
                  }
                </p>
              </div>
            </div>

            {/* Stats Bar */}
            {!loading && allRecommendations.length > 0 &&
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{allRecommendations.length}</div>
                  <div className="text-xs text-muted-foreground">Movies Found</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">{stats.avgConfidence}%</div>
                  <div className="text-xs text-muted-foreground">Avg Confidence</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{stats.strategiesUsed.length}</div>
                  <div className="text-xs text-muted-foreground">AI Strategies</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-accent">{Object.keys(stats.strategyDistribution).length}</div>
                  <div className="text-xs text-muted-foreground">Recommendation Types</div>
                </div>
              </div>
            }

            {/* AI Strategies Used */}
            {stats.strategiesUsed.length > 0 &&
            <div className="mt-6">
                <p className="text-xs text-muted-foreground mb-2">Active AI Strategies:</p>
                <div className="flex flex-wrap gap-2">
                  {stats.strategiesUsed.map((strategy) =>
                <Badge
                  key={strategy}
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 text-xs">

                      <Sparkles className="w-3 h-3 mr-1" />
                      {strategyLabels[strategy] || strategy}
                    </Badge>
                )}
                </div>
              </div>
            }
          </div>
        </section>

        {/* Controls */}
        <section className="pb-8 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowPreferences(!showPreferences)}
                variant="outline"
                className="border-border/50">

                <Settings className="w-4 h-4 mr-2" />
                {showPreferences ? "Hide" : "Customize"}
              </Button>
              <Button
                onClick={loadRecommendations}
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground">

                {loading ?
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </> :

                <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </>
                }
              </Button>
            </div>
          </div>
        </section>

        {/* Preferences Panel */}
        {showPreferences &&
        <section className="pb-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Personalize Your Recommendations</h3>
                  <Badge variant="secondary" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    Advanced AI
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Liked Movie IDs
                      <span className="text-muted-foreground font-normal ml-1">(comma-separated)</span>
                    </label>
                    <Input
                    placeholder="e.g., 27205,155,157336"
                    value={preferences.likedMovies}
                    onChange={(e) =>
                    setPreferences({ ...preferences, likedMovies: e.target.value })
                    }
                    className="bg-background border-border/50" />

                    <p className="text-xs text-muted-foreground">
                      Try: 27205 (Inception), 155 (Dark Knight), 19995 (Avatar)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Preferred Genre IDs
                      <span className="text-muted-foreground font-normal ml-1">(comma-separated)</span>
                    </label>
                    <Input
                    placeholder="e.g., 28,12,878"
                    value={preferences.genres}
                    onChange={(e) =>
                    setPreferences({ ...preferences, genres: e.target.value })
                    }
                    className="bg-background border-border/50 md:!text-slate-400" />

                    <p className="text-xs text-muted-foreground">
                      Try: 28 (Action), 878 (Sci-Fi), 12 (Adventure)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Search History
                      <span className="text-muted-foreground font-normal ml-1">(keywords)</span>
                    </label>
                    <Input
                    placeholder="e.g., space,adventure,thriller"
                    value={preferences.searchHistory}
                    onChange={(e) =>
                    setPreferences({ ...preferences, searchHistory: e.target.value })
                    }
                    className="bg-background border-border/50 md:!text-slate-400" />

                    <p className="text-xs text-muted-foreground">
                      Keywords that interest you
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                  onClick={loadRecommendations}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground">

                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recommendations
                  </Button>
                </div>
              </div>
            </div>
          </section>
        }

        {/* Filter Tabs */}
        {!loading && allRecommendations.length > 0 &&
        <section className="pb-8 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filterOptions.map((option) => {
                const Icon = option.icon;
                const isActive = selectedFilter === option.id;

                return (
                  <Button
                    key={option.id}
                    onClick={() => setSelectedFilter(option.id)}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={`flex-shrink-0 gap-2 ${
                    isActive ?
                    "bg-primary text-primary-foreground" :
                    "border-border/50 hover:border-primary/50"}`
                    }>

                      <Icon className="w-4 h-4" />
                      {option.label}
                      <Badge
                      variant="secondary"
                      className={`ml-1 ${
                      isActive ?
                      "bg-primary-foreground/20 text-primary-foreground" :
                      "bg-muted"}`
                      }>

                        {option.count}
                      </Badge>
                    </Button>);

              })}
              </div>
            </div>
          </section>
        }

        {/* Movie Grid */}
        <section className="pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            {loading ?
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your preferences with AI...</p>
              </div> :
            filteredRecommendations.length > 0 ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecommendations.map((movie) =>
              <div key={movie.id} className="group relative">
                    <MovieCard
                  movieId={movie.id}
                  title={movie.title}
                  year={movie.release_date ? new Date(movie.release_date).getFullYear() : 0}
                  rating={Number(movie.vote_average.toFixed(1))}
                  genre={getGenreName(movie.genre_ids)}
                  image={getImageUrl(movie.poster_path)}
                  description={movie.overview}
                  onClick={() => handleMovieClick(movie.id)} />

                    
                    {/* Enhanced Info Overlay */}
                    <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2 pointer-events-none z-10">
                      <Badge
                    variant="secondary"
                    className="bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs">

                        {movie.match_score}% Match
                      </Badge>
                      <Badge
                    variant="secondary"
                    className="bg-accent/90 text-accent-foreground backdrop-blur-sm text-xs">

                        {movie.confidence}% Sure
                      </Badge>
                    </div>
                    
                    {/* Reasons Tooltip on Hover */}
                    {movie.reasons.length > 0 &&
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="space-y-1">
                          {movie.reasons.slice(0, 2).map((reason, idx) =>
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-white">
                              <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{reason}</span>
                            </div>
                    )}
                        </div>
                      </div>
                }
                  </div>
              )}
              </div> :

            <div className="text-center py-20">
                <Sparkles className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-xl text-muted-foreground mb-2">No recommendations yet</p>
                <p className="text-sm text-muted-foreground">
                  Customize your preferences to get AI-powered suggestions
                </p>
              </div>
            }
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
            <p>Built with Next.js • Powered by TMDB • Advanced AI Recommendations</p>
          </div>
        </footer>
      </div>

      {/* Movie Details Dialog */}
      <MovieDetailsDialog
        movieId={selectedMovieId}
        open={dialogOpen}
        onOpenChange={setDialogOpen} />

    </div>);

}