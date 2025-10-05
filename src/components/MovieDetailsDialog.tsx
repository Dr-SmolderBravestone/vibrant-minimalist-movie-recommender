"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Calendar, Clock, Users, Video, Loader2, X, Heart, Bookmark, ExternalLink, Play, Tv } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkAndAwardAchievements } from "@/lib/achievements";

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Crew {
  id: number;
  name: string;
  job: string;
  profile_path: string | null;
}

interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  genres: { id: number; name: string }[];
  credits: {
    cast: Cast[];
    crew: Crew[];
  };
  production_companies: { id: number; name: string; logo_path: string | null }[];
}

interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

interface WatchProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

interface MovieDetailsDialogProps {
  movieId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MovieDetailsDialog({ movieId, open, onOpenChange }: MovieDetailsDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [watchProviders, setWatchProviders] = useState<WatchProviders | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);

  useEffect(() => {
    if (movieId && open) {
      fetchMovieDetails();
      fetchWatchProviders();
      if (session?.user) {
        checkFavoriteStatus();
        checkWatchLaterStatus();
      }
    }
  }, [movieId, open, session]);

  const fetchMovieDetails = async () => {
    if (!movieId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/movies/${movieId}`);
      const data = await response.json();
      setDetails(data);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWatchProviders = async () => {
    if (!movieId) return;
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
      );
      const data = await response.json();
      // Get US providers (you can make this dynamic based on user location)
      setWatchProviders(data.results?.US || null);
    } catch (error) {
      console.error("Error fetching watch providers:", error);
    }
  };

  const checkFavoriteStatus = async () => {
    if (!movieId || !session?.user) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/favorites", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const favorites = await response.json();
        setIsFavorite(favorites.some((fav: any) => fav.movieId === movieId));
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const checkWatchLaterStatus = async () => {
    if (!movieId || !session?.user) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/watch-later", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const watchLater = await response.json();
        setIsWatchLater(watchLater.some((item: any) => item.movieId === movieId));
      }
    } catch (error) {
      console.error("Error checking watch later status:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast.error("Please login to add favorites");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!details) return;
    
    setFavoriteLoading(true);
    const token = localStorage.getItem("bearer_token");

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${movieId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          toast.success("Removed from favorites");
        } else {
          toast.error("Failed to remove from favorites");
        }
      } else {
        // Add to favorites
        const response = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            movieId: details.id,
            movieTitle: details.title,
            moviePoster: details.poster_path
          })
        });

        if (response.ok) {
          setIsFavorite(true);
          toast.success("Added to favorites");
          
          // Check and award achievements
          if (token && session?.user?.id) {
            await checkAndAwardAchievements(session.user.id, token);
          }
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("An error occurred");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const toggleWatchLater = async () => {
    if (!session?.user) {
      toast.error("Please login to add to watch later");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!details) return;
    
    setWatchLaterLoading(true);
    const token = localStorage.getItem("bearer_token");

    try {
      if (isWatchLater) {
        // Remove from watch later
        const response = await fetch(`/api/watch-later/${movieId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsWatchLater(false);
          toast.success("Removed from watch later");
        } else {
          toast.error("Failed to remove from watch later");
        }
      } else {
        // Add to watch later
        const response = await fetch("/api/watch-later", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            movieId: details.id,
            movieTitle: details.title,
            moviePoster: details.poster_path
          })
        });

        if (response.ok) {
          setIsWatchLater(true);
          toast.success("Added to watch later");
          
          // Check and award achievements
          if (token && session?.user?.id) {
            await checkAndAwardAchievements(session.user.id, token);
          }
        } else {
          const error = await response.json();
          toast.error(error.error || "Failed to add to watch later");
        }
      }
    } catch (error) {
      console.error("Error toggling watch later:", error);
      toast.error("An error occurred");
    } finally {
      setWatchLaterLoading(false);
    }
  };

  const handleWatchNow = () => {
    if (!details) return;
    if (watchProviders?.link) {
      window.open(watchProviders.link, "_blank");
    } else {
      const searchQuery = encodeURIComponent(`watch ${details.title} ${new Date(details.release_date).getFullYear()} online`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
    }
  };

  const getProviderImageUrl = (path: string) => {
    return `https://image.tmdb.org/t/p/original${path}`;
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-movie.jpg";
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const getDirectors = () => {
    if (!details?.credits?.crew) return [];
    return details.credits.crew.filter((person) => person.job === "Director");
  };

  const getProducers = () => {
    if (!details?.credits?.crew) return [];
    return details.credits.crew.filter((person) => person.job === "Producer");
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-card border-border/50">
        {loading ? (
          <div className="flex items-center justify-center h-[500px]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : details ? (
          <ScrollArea className="max-h-[90vh]">
            {/* Backdrop Image */}
            <div className="relative h-[300px] w-full">
              <Image
                src={getImageUrl(details.backdrop_path || details.poster_path)}
                alt={details.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title and Rating */}
              <div className="space-y-2">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold text-foreground">
                    {details.title}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold text-foreground">
                      {details.vote_average.toFixed(1)}
                    </span>
                  </div>
                  
                  {details.release_date && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(details.release_date).getFullYear()}
                      </span>
                    </div>
                  )}
                  
                  {details.runtime && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatRuntime(details.runtime)}</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {details.genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary" className="rounded-full">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Streaming Availability Section */}
              {watchProviders && (watchProviders.flatrate || watchProviders.rent || watchProviders.buy) && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Tv className="w-5 h-5 text-accent" />
                    <h3 className="text-lg font-semibold text-foreground">Available On</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {watchProviders.flatrate && watchProviders.flatrate.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Stream</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.flatrate.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="relative group"
                              title={provider.provider_name}
                            >
                              <img
                                src={getProviderImageUrl(provider.logo_path)}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg border-2 border-border/50 hover:border-accent transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {watchProviders.rent && watchProviders.rent.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Rent</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.rent.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="relative group"
                              title={provider.provider_name}
                            >
                              <img
                                src={getProviderImageUrl(provider.logo_path)}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg border-2 border-border/50 hover:border-primary transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {watchProviders.buy && watchProviders.buy.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Buy</p>
                        <div className="flex flex-wrap gap-3">
                          {watchProviders.buy.map((provider) => (
                            <div
                              key={provider.provider_id}
                              className="relative group"
                              title={provider.provider_name}
                            >
                              <img
                                src={getProviderImageUrl(provider.logo_path)}
                                alt={provider.provider_name}
                                className="w-12 h-12 rounded-lg border-2 border-border/50 hover:border-primary transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {watchProviders.link && (
                    <p className="text-xs text-muted-foreground mt-4">
                      Data provided by JustWatch • Availability for US region
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleWatchNow}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Play className="w-4 h-4" />
                  {watchProviders?.link ? "View on JustWatch" : "Search Streaming"}
                  <ExternalLink className="w-3 h-3" />
                </Button>

                <Button
                  onClick={toggleFavorite}
                  variant={isFavorite ? "default" : "outline"}
                  className={isFavorite ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                  disabled={favoriteLoading}
                >
                  {favoriteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                  )}
                  {isFavorite ? "Favorited" : "Add to Favorites"}
                </Button>

                <Button
                  onClick={toggleWatchLater}
                  variant={isWatchLater ? "default" : "outline"}
                  className={isWatchLater ? "bg-accent hover:bg-accent/90" : ""}
                  disabled={watchLaterLoading}
                >
                  {watchLaterLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bookmark className={`w-4 h-4 ${isWatchLater ? "fill-current" : ""}`} />
                  )}
                  {isWatchLater ? "Saved" : "Watch Later"}
                </Button>
              </div>

              {/* Overview */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" />
                  Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {details.overview || "No overview available."}
                </p>
              </div>

              {/* Directors */}
              {getDirectors().length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Director{getDirectors().length > 1 ? "s" : ""}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {getDirectors().map((director) => (
                      <div
                        key={director.id}
                        className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {director.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Producers */}
              {getProducers().length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Producers</h3>
                  <div className="flex flex-wrap gap-2">
                    {getProducers().slice(0, 5).map((producer) => (
                      <Badge key={producer.id} variant="outline" className="text-xs">
                        {producer.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {details.credits?.cast && details.credits.cast.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-foreground">Top Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {details.credits.cast.slice(0, 8).map((actor) => (
                      <div
                        key={actor.id}
                        className="space-y-2 bg-secondary/30 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="relative h-32 w-full rounded-md overflow-hidden bg-muted">
                          {actor.profile_path ? (
                            <Image
                              src={getImageUrl(actor.profile_path)}
                              alt={actor.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Users className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {actor.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {actor.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Companies */}
              {details.production_companies && details.production_companies.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Production Companies
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {details.production_companies.map((company) => (
                      <span key={company.id} className="text-sm text-muted-foreground">
                        {company.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}