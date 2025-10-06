"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Film, Loader2, Heart, Bookmark, Award, Users,
  UserPlus, UserMinus, Edit, MapPin, Calendar, Star,
  History, TrendingUp, Settings, LogOut, MessageSquare } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Link from "next/link";
import MovieCard from "@/components/MovieCard";
import MovieDetailsDialog from "@/components/MovieDetailsDialog";

interface UserProfile {
  id: number;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  favoriteGenres: string | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Movie {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePoster: string | null;
  createdAt?: string;
  watchedAt?: string;
}

interface Achievement {
  id: number;
  userId: string;
  achievementId: number;
  earnedAt: string;
  achievement: {
    id: number;
    name: string;
    description: string;
    icon: string;
    badgeColor: string;
    requirement: string;
  };
}

interface Review {
  id: number;
  movieTitle: string;
  moviePoster: string | null;
  rating: number;
  reviewText: string | null;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [watchLater, setWatchLater] = useState<Movie[]>([]);
  const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 });

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/profile");
    } else if (session?.user) {
      fetchAllData();
    }
  }, [session, sessionLoading, router]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem("bearer_token");

    try {
      await Promise.all([
      fetchProfile(token),
      fetchFavorites(token),
      fetchWatchLater(token),
      fetchWatchHistory(token),
      fetchAchievements(token),
      fetchReviews(token),
      fetchFollowStats(token)]
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (token: string | null) => {
    try {
      const res = await fetch(`/api/user-profiles?user_id=${session?.user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchFavorites = async (token: string | null) => {
    try {
      const res = await fetch("/api/favorites", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchWatchLater = async (token: string | null) => {
    try {
      const res = await fetch("/api/watch-later", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchLater(data);
      }
    } catch (error) {
      console.error("Error fetching watch later:", error);
    }
  };

  const fetchWatchHistory = async (token: string | null) => {
    try {
      const res = await fetch("/api/watch-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setWatchHistory(data);
      }
    } catch (error) {
      console.error("Error fetching watch history:", error);
    }
  };

  const fetchAchievements = async (token: string | null) => {
    try {
      const res = await fetch("/api/user-achievements", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const fetchReviews = async (token: string | null) => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        const userReviews = data.filter((r: any) => r.userId === session?.user?.id);
        setReviews(userReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const fetchFollowStats = async (token: string | null) => {
    try {
      const res = await fetch("/api/user-follows", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFollowStats({
          followers: data.followerCount || 0,
          following: data.followingCount || 0
        });
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-movie.jpg";
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w500${path}`;
  };

  const handleMovieClick = (movieId: number) => {
    setSelectedMovieId(movieId);
    setDialogOpen(true);
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>);

  }

  if (!session?.user) {
    return null;
  }

  const favoriteGenres = profile?.favoriteGenres ? JSON.parse(profile.favoriteGenres) : [];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Gradient Background */}
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
                <Link href="/profile">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Users className="w-4 h-4" />
                    Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Profile Header */}
        <section className="pt-12 pb-8 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/50 border border-border/50 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-primary-foreground">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-3xl font-bold !text-white">{session.user.name}</h1>
                    <p className="text-muted-foreground">{session.user.email}</p>
                  </div>

                  {profile?.bio &&
                  <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                  }

                  <div className="flex flex-wrap gap-4">
                    {profile?.location &&
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {profile.location}
                      </div>
                    }
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      Joined {new Date(session.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </div>
                  </div>

                  {favoriteGenres.length > 0 &&
                  <div className="flex flex-wrap gap-2">
                      {favoriteGenres.map((genre: string, idx: number) =>
                    <Badge key={idx} variant="secondary">
                          {genre}
                        </Badge>
                    )}
                    </div>
                  }
                </div>

                {/* Stats */}
                <div className="flex md:flex-col gap-4 md:gap-2">
                  <Button variant="outline" className="flex-1 md:flex-none" asChild>
                    <Link href="/profile/edit" className="!text-white">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-border/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{reviews.length}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{favorites.length}</div>
                  <div className="text-xs text-muted-foreground">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{watchHistory.length}</div>
                  <div className="text-xs text-muted-foreground">Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{followStats.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{followStats.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="px-6 pb-20">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="favorites">
                  Favorites ({favorites.length})
                </TabsTrigger>
                <TabsTrigger value="watchlist">
                  Watch Later ({watchLater.length})
                </TabsTrigger>
                <TabsTrigger value="history">
                  History ({watchHistory.length})
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  Achievements ({achievements.length})
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-8">
                {/* Achievements Preview */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold !text-white">Recent Achievements</h3>
                    </div>
                    <Button variant="ghost" onClick={() => setActiveTab("achievements")}>
                      View All
                    </Button>
                  </div>
                  
                  {achievements.length === 0 ?
                  <p className="text-center text-muted-foreground py-8">
                      No achievements yet. Start reviewing movies to earn badges!
                    </p> :

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {achievements.slice(0, 4).map((achievement) =>
                    <div
                      key={achievement.id}
                      className="bg-background/50 border border-border/50 rounded-lg p-4 text-center">

                          <div
                        className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: achievement.achievement.badgeColor }}>

                            <Award className="w-6 h-6" />
                          </div>
                          <h4 className="font-semibold text-sm">{achievement.achievement.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.achievement.description}
                          </p>
                        </div>
                    )}
                    </div>
                  }
                </div>

                {/* Recent Reviews */}
                <div className="bg-card/50 border border-border/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      <h3 className="text-xl font-semibold !text-white">Recent Reviews</h3>
                    </div>
                  </div>
                  
                  {reviews.length === 0 ?
                  <p className="text-center text-muted-foreground py-8">
                      No reviews yet. Share your thoughts on movies you've watched!
                    </p> :

                  <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) =>
                    <div
                      key={review.id}
                      className="bg-background/50 border border-border/50 rounded-lg p-4">

                          <div className="flex items-start gap-4">
                            <img
                          src={getImageUrl(review.moviePoster)}
                          alt={review.movieTitle}
                          className="w-16 h-24 object-cover rounded" />

                            <div className="flex-1">
                              <h4 className="font-semibold">{review.movieTitle}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 10 }).map((_, i) =>
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                i < review.rating ?
                                'fill-primary text-primary' :
                                'text-muted-foreground/30'}`
                                } />

                              )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {review.rating}/10
                                </span>
                              </div>
                              {review.reviewText &&
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {review.reviewText}
                                </p>
                          }
                            </div>
                          </div>
                        </div>
                    )}
                    </div>
                  }
                </div>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites">
                {favorites.length === 0 ?
                <div className="text-center py-20">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground">No favorites yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start adding movies to your favorites!
                    </p>
                  </div> :

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {favorites.map((movie) =>
                  <div
                    key={movie.id}
                    onClick={() => handleMovieClick(movie.movieId)}
                    className="cursor-pointer">

                        <img
                      src={getImageUrl(movie.moviePoster)}
                      alt={movie.movieTitle}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-border/50 hover:border-primary/50 transition-colors" />

                        <h4 className="font-semibold mt-2 line-clamp-1">{movie.movieTitle}</h4>
                      </div>
                  )}
                  </div>
                }
              </TabsContent>

              {/* Watch Later Tab */}
              <TabsContent value="watchlist">
                {watchLater.length === 0 ?
                <div className="text-center py-20">
                    <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground">No movies in watch later</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Save movies to watch them later!
                    </p>
                  </div> :

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchLater.map((movie) =>
                  <div
                    key={movie.id}
                    onClick={() => handleMovieClick(movie.movieId)}
                    className="cursor-pointer">

                        <img
                      src={getImageUrl(movie.moviePoster)}
                      alt={movie.movieTitle}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-border/50 hover:border-primary/50 transition-colors" />

                        <h4 className="font-semibold mt-2 line-clamp-1">{movie.movieTitle}</h4>
                      </div>
                  )}
                  </div>
                }
              </TabsContent>

              {/* Watch History Tab */}
              <TabsContent value="history">
                {watchHistory.length === 0 ?
                <div className="text-center py-20">
                    <History className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground">No watch history</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your watched movies will appear here
                    </p>
                  </div> :

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {watchHistory.map((movie) =>
                  <div
                    key={movie.id}
                    onClick={() => handleMovieClick(movie.movieId)}
                    className="cursor-pointer">

                        <img
                      src={getImageUrl(movie.moviePoster)}
                      alt={movie.movieTitle}
                      className="w-full aspect-[2/3] object-cover rounded-lg border border-border/50 hover:border-primary/50 transition-colors" />

                        <h4 className="font-semibold mt-2 line-clamp-1">{movie.movieTitle}</h4>
                        <p className="text-xs text-muted-foreground">
                          Watched {new Date(movie.watchedAt || movie.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                  )}
                  </div>
                }
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                {achievements.length === 0 ?
                <div className="text-center py-20">
                    <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-xl text-muted-foreground">No achievements yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Complete challenges to earn badges!
                    </p>
                  </div> :

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map((achievement) =>
                  <div
                    key={achievement.id}
                    className="bg-card/50 border border-border/50 rounded-xl p-6">

                        <div className="flex items-start gap-4">
                          <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ backgroundColor: achievement.achievement.badgeColor }}>

                            <Award className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{achievement.achievement.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {achievement.achievement.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {achievement.achievement.requirement}
                            </Badge>
                          </div>
                        </div>
                      </div>
                  )}
                  </div>
                }
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 py-8 px-6">
          <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
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