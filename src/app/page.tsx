"use client";

import { useState, useEffect } from "react";
import { Film, Sparkles, Loader2, MessageSquare, LogIn, UserCircle, LogOut } from "lucide-react";
import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import FilterButtons from "@/components/FilterButtons";
import MovieDetailsDialog from "@/components/MovieDetailsDialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Genre {
  id: number;
  name: string;
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  poster_path: string;
  overview: string;
}

export default function Home() {
  const { data: session, isPending: sessionLoading, refetch } = useSession();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMovies, setTotalMovies] = useState(0);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch genres on mount
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

  // Fetch movies when search or genre changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("query", searchQuery);
        if (selectedGenre !== "All") params.append("genre", selectedGenre);

        const response = await fetch(`/api/movies?${params.toString()}`);
        const data = await response.json();

        setMovies(data.results || []);
        setTotalMovies(data.total_results || 0);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchMovies();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedGenre]);

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDialogOpen(true);
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
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

  const avgRating = movies.length > 0 ?
  (movies.reduce((sum, m) => sum + m.vote_average, 0) / movies.length).toFixed(1) :
  "8.5";

  return (
    <div className="min-h-screen bg-background dark">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        {/* Navigation */}
        <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                <Film className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  MovieHub
                </span>
              </Link>
              
              <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto">
                <Link href="/">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs sm:text-sm">
                    <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Browse</span>
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs sm:text-sm">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline !bg-transparent !text-[#d61111] !font-bold">Reviews</span>
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">AI Recommendations</span>
                    <span className="md:hidden">AI</span>
                  </Button>
                </Link>
                
                {/* Auth Buttons */}
                {sessionLoading ?
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /> :
                session?.user ?
                <>
                    <Link href="/profile">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs sm:text-sm">
                        <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline truncate max-w-[80px]">{session.user.name}</span>
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-1.5 text-xs sm:text-sm">
                      <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Logout</span>
                    </Button>
                  </> :

                <>
                    <Link href="/login">
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs sm:text-sm">
                        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Login</span>
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 text-xs sm:text-sm">
                        <UserCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Sign Up</span>
                      </Button>
                    </Link>
                  </>
                }
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Film className="w-12 h-12 sm:w-16 sm:h-16 text-primary relative" />
              </div>
            </div>
            
            {/* Title */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                  Discover Movies
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-light px-4">
                Explore thousands of movies powered by TMDB
              </p>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 sm:gap-12 pt-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {loading ? <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto" /> : totalMovies.toLocaleString()}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Movies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent">{avgRating}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">TMDB Powered</div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by title, genre, or keyword..." />

            <FilterButtons
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              genres={genres} />

          </div>
        </section>

        {/* Results Info */}
        <section className="pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-center text-sm sm:text-base text-muted-foreground">
              {loading ?
              <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading movies...
                </span> :
              movies.length === 0 ?
              "No movies found. Try a different search or filter." :

              <>
                  Showing <span className="text-foreground font-semibold">{movies.length}</span>{" "}
                  {movies.length === 1 ? "movie" : "movies"}
                </>
              }
            </p>
          </div>
        </section>

        {/* Movie Grid */}
        <section className="pb-16 sm:pb-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            {loading ?
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div> :
            movies.length > 0 ?
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {movies.map((movie) =>
              <MovieCard
                key={movie.id}
                movieId={movie.id}
                title={movie.title}
                year={movie.release_date ? new Date(movie.release_date).getFullYear() : 0}
                rating={Number(movie.vote_average.toFixed(1))}
                genre={getGenreName(movie.genre_ids)}
                image={getImageUrl(movie.poster_path)}
                description={movie.overview}
                onClick={() => handleMovieClick(movie.id)} />

              )}
              </div> :

            <div className="text-center py-20">
                <Film className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg sm:text-xl text-muted-foreground">No results found</p>
              </div>
            }
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-muted-foreground">
            <p>Built with Next.js • Powered by TMDB</p>
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