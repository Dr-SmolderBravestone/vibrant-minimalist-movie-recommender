"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare, Loader2, Send, Film, Sparkles, Search, Filter, TrendingUp, Award, Users, BarChart3, Calendar, LogIn, Share2, Facebook, Twitter, MessageCircle, Instagram, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkAndAwardAchievements } from "@/lib/achievements";

interface Review {
  id: number;
  movieId: number;
  movieTitle: string;
  moviePoster: string | null;
  userName: string;
  rating: number;
  reviewText: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  avgRating: number;
  distribution: Record<number, number>;
}

export default function ReviewsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const [formData, setFormData] = useState({
    movieTitle: "",
    moviePoster: "",
    rating: "8",
    reviewText: ""
  });

  const [stats, setStats] = useState<Stats>({
    total: 0,
    avgRating: 0,
    distribution: {}
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    // Calculate stats
    if (reviews.length > 0) {
      const total = reviews.length;
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / total;
      const distribution: Record<number, number> = {};

      for (let i = 1; i <= 10; i++) {
        distribution[i] = reviews.filter((r) => r.rating === i).length;
      }

      setStats({ total, avgRating, distribution });
    }
  }, [reviews]);

  useEffect(() => {
    // Filter and sort reviews
    let filtered = [...reviews];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
        r.movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.reviewText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.userName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Rating filter
    if (filterRating !== null) {
      filtered = filtered.filter((r) => r.rating === filterRating);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'highest':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
  }, [reviews, searchQuery, filterRating, sortBy]);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication
    if (!session?.user) {
      toast.error("Please login to submit a review");
      router.push(`/login?redirect=${encodeURIComponent('/reviews')}`);
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem("bearer_token");

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          movieTitle: formData.movieTitle,
          movieId: Math.floor(Math.random() * 1000000),
          moviePoster: formData.moviePoster || null,
          rating: parseInt(formData.rating),
          reviewText: formData.reviewText || null
        })
      });

      if (response.status === 401) {
        toast.error("Session expired. Please login again.");
        router.push(`/login?redirect=${encodeURIComponent('/reviews')}`);
        return;
      }

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setFormData({
          movieTitle: "",
          moviePoster: "",
          rating: "8",
          reviewText: ""
        });
        fetchReviews();

        // Check and award achievements
        if (token && session?.user?.id) {
          await checkAndAwardAchievements(session.user.id, token);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareReview = (review: Review, platform: 'facebook' | 'twitter' | 'reddit' | 'discord' | 'instagram') => {
    if (!review) return;

    const text = `Check out my ${review.rating}/10 review of "${review.movieTitle}"${review.reviewText ? `: ${review.reviewText.slice(0, 100)}...` : ''}`;
    const url = window.location.origin + '/reviews';

    let shareUrl: string | null = null;

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'discord':
        // Copy to clipboard for Discord sharing
        navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
          toast.success('Link copied! Paste it in Discord');
        }).catch(() => {
          toast.error('Failed to copy link');
        });
        return;
      case 'instagram':
        // Instagram doesn't support direct sharing, copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
          toast.success('Review text copied! Share it on Instagram');
        }).catch(() => {
          toast.error('Failed to copy text');
        });
        return;
    }

    if (shareUrl) {
      // Handle iframe compatibility
      const isInIframe = window.self !== window.top;
      if (isInIframe) {
        try {
          window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: shareUrl } }, "*");
        } catch {
          window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/placeholder-movie.jpg";
    if (path.startsWith("http")) return path;
    return `https://image.tmdb.org/t/p/w200${path}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-500";
    if (rating >= 6) return "text-yellow-500";
    return "text-red-500";
  };

  const getDistributionPercentage = (count: number) => {
    if (stats.total === 0) return 0;
    return Math.round(count / stats.total * 100);
  };

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
              
              <div className="flex items-center gap-1.5 sm:gap-3">
                <Link href="/">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs sm:text-sm">
                    <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Browse</span>
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs sm:text-sm">
                    <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Reviews</span>
                  </Button>
                </Link>
                <Link href="/recommendations">
                  <Button size="sm" variant="ghost" className="gap-1.5 text-xs sm:text-sm">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden md:inline">AI Recommendations</span>
                    <span className="md:hidden">AI</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Header */}
        <section className="pt-12 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-primary relative" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Movie Reviews
                  </span>
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="w-3 h-3" />
                    Community insights and ratings
                  </span>
                </p>
              </div>
            </div>

            {/* Stats Dashboard */}
            {!loading && reviews.length > 0 &&
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total Reviews</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-accent">{stats.avgRating.toFixed(1)}/10</div>
                  <div className="text-xs text-muted-foreground">Avg Rating</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    {Math.max(...Object.values(stats.distribution))}
                  </div>
                  <div className="text-xs text-muted-foreground">Most Popular Rating</div>
                </div>
                <div className="bg-card/50 border border-border/50 rounded-lg p-3 sm:p-4">
                  <div className="text-xl sm:text-2xl font-bold text-accent">
                    {Object.values(stats.distribution).filter((v) => v > 0).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Rating Diversity</div>
                </div>
              </div>
            }

            {/* Rating Distribution */}
            {!loading && reviews.length > 0 &&
            <div className="mt-6 bg-card/50 border border-border/50 rounded-xl p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <h3 className="text-base sm:text-lg font-semibold sm:!text-gray-300">Rating Distribution</h3>
                </div>
                <div className="space-y-2">
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.distribution[rating] || 0;
                  const percentage = getDistributionPercentage(count);
                  return (
                    <div key={rating} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-6 sm:w-8 text-xs sm:text-sm font-medium text-muted-foreground">
                          {rating}★
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2 sm:h-3 overflow-hidden">
                          <div
                          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                          style={{ width: `${percentage}%` }} />

                        </div>
                        <div className="w-12 sm:w-16 text-xs sm:text-sm text-muted-foreground text-right">
                          {count} ({percentage}%)
                        </div>
                      </div>);

                })}
                </div>
              </div>
            }
          </div>
        </section>

        {/* Search and Filters */}
        <section className="pb-6 sm:pb-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews, movies, or users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 sm:pl-10 bg-background border-border/50 text-sm" />

                  </div>
                </div>

                {/* Filters Row */}
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto">
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <select
                    value={filterRating || ''}
                    onChange={(e) => setFilterRating(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-background border border-border/50 rounded-lg text-xs sm:text-sm flex-shrink-0 sm:!text-white">

                    <option value="">All Ratings</option>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((r) =>
                    <option key={r} value={r}>{r}★ ({stats.distribution[r] || 0})</option>
                    )}
                  </select>

                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 sm:px-3 py-1.5 sm:py-2 bg-background border border-border/50 rounded-lg text-xs sm:text-sm flex-shrink-0 sm:!text-white">

                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>

                {/* Active Filters */}
                {(searchQuery || filterRating) &&
                <div className="flex items-center gap-2 pt-3 border-t border-border/50 overflow-x-auto">
                    <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Active filters:</span>
                    {searchQuery &&
                  <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
                        Search: "{searchQuery}"
                        <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                  }
                    {filterRating &&
                  <Badge variant="secondary" className="gap-1 text-xs flex-shrink-0">
                        Rating: {filterRating}★
                        <button onClick={() => setFilterRating(null)} className="ml-1 hover:text-destructive">
                          ×
                        </button>
                      </Badge>
                  }
                    <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterRating(null);
                    }}
                    className="ml-auto text-xs">

                      Clear All
                    </Button>
                  </div>
                }
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <h2 className="text-xl sm:text-2xl font-semibold !text-slate-600">Add Review</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Share your movie experience with the community
                    </p>
                  </div>

                  {!session?.user ?
                  <div className="text-center py-6 sm:py-8 space-y-4">
                      <LogIn className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto opacity-50" />
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Please login to submit reviews
                      </p>
                      <Button
                      onClick={() => router.push(`/login?redirect=${encodeURIComponent('/reviews')}`)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">

                        <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        Login to Review
                      </Button>
                    </div> :

                  <>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                        <p className="text-xs sm:text-sm text-primary">
                          Posting as: <span className="font-semibold">{session.user.name}</span>
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium !text-slate-500">Movie Title</label>
                          <Input
                          placeholder="The Matrix"
                          value={formData.movieTitle}
                          onChange={(e) =>
                          setFormData({ ...formData, movieTitle: e.target.value })
                          }
                          required
                          className="bg-background border-border/50 md:!text-slate-400 text-sm" />

                        </div>

                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium !text-slate-500">
                            Poster Path <span className="text-muted-foreground font-normal">(Optional)</span>
                          </label>
                          <Input
                          placeholder="/path/to/poster.jpg"
                          value={formData.moviePoster}
                          onChange={(e) =>
                          setFormData({ ...formData, moviePoster: e.target.value })
                          }
                          className="bg-background border-border/50 md:!text-slate-400 text-sm" />

                          <p className="text-xs text-muted-foreground">
                            TMDB poster path or full URL
                          </p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium !text-slate-500">
                            Rating: {formData.rating}/10
                          </label>
                          <input
                          type="range"
                          min="1"
                          max="10"
                          value={formData.rating}
                          onChange={(e) =>
                          setFormData({ ...formData, rating: e.target.value })
                          }
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />

                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {Array.from({ length: 10 }).map((_, i) =>
                          <Star
                            key={i}
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < parseInt(formData.rating) ?
                            'fill-primary text-primary' :
                            'text-muted-foreground/30'}`
                            } />

                          )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs sm:text-sm font-medium !text-slate-500">
                            Review <span className="text-muted-foreground font-normal">(Optional)</span>
                          </label>
                          <Textarea
                          placeholder="Share your thoughts about this movie... What did you love? What could be better?"
                          value={formData.reviewText}
                          onChange={(e) =>
                          setFormData({ ...formData, reviewText: e.target.value })
                          }
                          rows={5}
                          className="bg-background border-border/50 resize-none text-sm" />

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formData.reviewText.length} characters</span>
                            <span>{formData.reviewText.length > 500 ? '✓ Detailed' : 'Keep writing...'}</span>
                          </div>
                        </div>

                        <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-sm">

                          {submitting ?
                        <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Submitting...
                            </> :

                        <>
                              <Send className="w-4 h-4 mr-2" />
                              Submit Review
                            </>
                        }
                        </Button>
                      </form>
                    </>
                  }
                </div>
              </div>
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Results Count */}
              {!loading && reviews.length > 0 &&
              <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing {filteredReviews.length} of {reviews.length} reviews
                  </p>
                  {filteredReviews.length === 0 && reviews.length > 0 &&
                <Badge variant="secondary" className="text-xs">No matches found</Badge>
                }
                </div>
              }

              {loading ?
              <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div> :
              filteredReviews.length === 0 && reviews.length === 0 ?
              <div className="text-center py-20">
                  <Film className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg sm:text-xl text-muted-foreground mb-2">No reviews yet</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Be the first to share your movie experience!
                  </p>
                </div> :
              filteredReviews.length === 0 ?
              <div className="text-center py-20">
                  <Search className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg sm:text-xl text-muted-foreground mb-2">No matching reviews</p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                    Try adjusting your filters or search terms
                  </p>
                </div> :

              filteredReviews.map((review) =>
              <div
                key={review.id}
                className="bg-card border border-border/50 rounded-xl p-4 sm:p-6 hover:border-primary/30 transition-all duration-300 group">

                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0 mx-auto sm:mx-0">
                        <img
                      src={getImageUrl(review.moviePoster)}
                      alt={review.movieTitle}
                      className="w-20 h-30 sm:w-24 sm:h-36 object-cover rounded-lg border border-border/50 group-hover:border-primary/30 transition-colors" />

                      </div>

                      {/* Review Content */}
                      <div className="flex-1 space-y-2 sm:space-y-3">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold">
                            {review.movieTitle}
                          </h3>
                          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                              <Users className="w-3 h-3" />
                              {review.userName}
                            </div>
                            <span className="text-xs sm:text-sm text-muted-foreground">•</span>
                            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {Array.from({ length: 10 }).map((_, i) =>
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < review.rating ?
                          'fill-primary text-primary' :
                          'text-muted-foreground/30'}`
                          } />

                        )}
                          </div>
                          <Badge
                        variant="secondary"
                        className={`${getRatingColor(review.rating)} font-bold text-xs`}>

                            {review.rating}/10
                          </Badge>
                        </div>

                        {/* Review Text */}
                        {review.reviewText &&
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            {review.reviewText}
                          </p>
                    }

                        {/* Review Meta with Share Buttons */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {review.reviewText ? `${review.reviewText.length} chars` : 'No text'}
                            </Badge>
                            {review.rating >= 8 &&
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                Highly Recommended
                              </Badge>
                        }
                          </div>
                          
                          {/* Enhanced Share Buttons */}
                          <div className="flex items-center gap-1 overflow-x-auto">
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-blue-500/10 hover:text-blue-500 flex-shrink-0"
                          onClick={() => handleShareReview(review, 'facebook')}
                          title="Share on Facebook">

                              <Facebook className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-sky-500/10 hover:text-sky-500 flex-shrink-0"
                          onClick={() => handleShareReview(review, 'twitter')}
                          title="Share on X/Twitter">

                              <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-orange-500/10 hover:text-orange-500 flex-shrink-0"
                          onClick={() => handleShareReview(review, 'reddit')}
                          title="Share on Reddit">

                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-indigo-500/10 hover:text-indigo-500 flex-shrink-0"
                          onClick={() => handleShareReview(review, 'discord')}
                          title="Share on Discord">

                              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-pink-500/10 hover:text-pink-500 flex-shrink-0"
                          onClick={() => handleShareReview(review, 'instagram')}
                          title="Copy for Instagram">

                              <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 sm:h-8 sm:px-2 hover:bg-primary/10 hover:text-primary flex-shrink-0"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/reviews').then(() => {
                              toast.success('Link copied to clipboard!');
                            }).catch(() => {
                              toast.error('Failed to copy link');
                            });
                          }}
                          title="Copy Link">

                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 py-6 sm:py-8 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-muted-foreground">
            <p>Built with Next.js • Powered by TMDB • Community Reviews</p>
          </div>
        </footer>
      </div>
    </div>);

}