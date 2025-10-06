"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Database, Users, MessageSquare, Heart, Star, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Profile {
  id: number;
  userId: string;
  bio: string | null;
  location: string | null;
  createdAt: string;
}

interface Review {
  id: number;
  userId: string;
  movieId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Favorite {
  id: number;
  userId: string;
  movieId: string;
  createdAt: string;
}

export default function DatabaseViewerPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/admin/database");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchAllData();
    }
  }, [session]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Fetch users - note: you'll need to create this endpoint or use existing auth data
      // For now, we'll show the current user
      setUsers([
        {
          id: session?.user?.id || "",
          name: session?.user?.name || "",
          email: session?.user?.email || "",
          createdAt: new Date().toISOString(),
        },
      ]);

      // Fetch profiles
      const profilesRes = await fetch("/api/user-profiles", { headers });
      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setProfiles(Array.isArray(profilesData) ? profilesData : [profilesData]);
      }

      // Fetch reviews
      const reviewsRes = await fetch("/api/reviews", { headers });
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }

      // Fetch favorites
      const favoritesRes = await fetch("/api/favorites", { headers });
      if (favoritesRes.ok) {
        const favoritesData = await favoritesRes.json();
        setFavorites(favoritesData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Database Viewer</h1>
            </div>
            <p className="text-muted-foreground">
              View all backend database tables and records
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={fetchAllData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reviews.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Database Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Database Tables</CardTitle>
            <CardDescription>
              View all records in each database table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="favorites">Favorites</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No users found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b">
                            <td className="p-2 font-mono text-xs">{user.id.slice(0, 8)}...</td>
                            <td className="p-2">{user.name}</td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{new Date(user.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="profiles" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : profiles.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No profiles found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">User ID</th>
                          <th className="text-left p-2">Bio</th>
                          <th className="text-left p-2">Location</th>
                          <th className="text-left p-2">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profiles.map((profile) => (
                          <tr key={profile.id} className="border-b">
                            <td className="p-2">{profile.id}</td>
                            <td className="p-2 font-mono text-xs">{profile.userId.slice(0, 8)}...</td>
                            <td className="p-2 max-w-xs truncate">{profile.bio || "-"}</td>
                            <td className="p-2">{profile.location || "-"}</td>
                            <td className="p-2">{new Date(profile.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No reviews found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">User ID</th>
                          <th className="text-left p-2">Movie ID</th>
                          <th className="text-left p-2">Rating</th>
                          <th className="text-left p-2">Comment</th>
                          <th className="text-left p-2">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reviews.map((review) => (
                          <tr key={review.id} className="border-b">
                            <td className="p-2">{review.id}</td>
                            <td className="p-2 font-mono text-xs">{review.userId.slice(0, 8)}...</td>
                            <td className="p-2">{review.movieId}</td>
                            <td className="p-2">
                              <span className="font-semibold text-primary">{review.rating}/5</span>
                            </td>
                            <td className="p-2 max-w-xs truncate">{review.comment}</td>
                            <td className="p-2">{new Date(review.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : favorites.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No favorites found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left p-2">ID</th>
                          <th className="text-left p-2">User ID</th>
                          <th className="text-left p-2">Movie ID</th>
                          <th className="text-left p-2">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {favorites.map((favorite) => (
                          <tr key={favorite.id} className="border-b">
                            <td className="p-2">{favorite.id}</td>
                            <td className="p-2 font-mono text-xs">{favorite.userId.slice(0, 8)}...</td>
                            <td className="p-2">{favorite.movieId}</td>
                            <td className="p-2">{new Date(favorite.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle className="text-lg">💡 Better Database Access Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="font-semibold mb-1">1. Drizzle Studio (Recommended)</p>
              <p className="text-sm text-muted-foreground mb-2">
                Run <code className="bg-muted px-2 py-1 rounded">npm run db:studio</code> to open a visual database browser
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">2. Turso Web Dashboard</p>
              <p className="text-sm text-muted-foreground mb-2">
                Visit <a href="https://turso.tech/app" target="_blank" rel="noopener noreferrer" className="text-primary underline">turso.tech/app</a> to access your database online
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">3. This Page</p>
              <p className="text-sm text-muted-foreground">
                Access anytime at <code className="bg-muted px-2 py-1 rounded">/admin/database</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}