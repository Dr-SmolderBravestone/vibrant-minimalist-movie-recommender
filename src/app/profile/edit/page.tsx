"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Film, Loader2, Save, ArrowLeft, User, MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

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

const GENRE_OPTIONS = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi",
  "Thriller", "Western", "Musical", "War", "Historical", "Biography"
];

export default function EditProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    avatarUrl: "",
    location: "",
    favoriteGenres: [] as string[]
  });

  useEffect(() => {
    if (!sessionLoading && !session?.user) {
      router.push("/login?redirect=/profile/edit");
    } else if (session?.user) {
      fetchProfile();
    }
  }, [session, sessionLoading, router]);

  const fetchProfile = async () => {
    setLoading(true);
    const token = localStorage.getItem("bearer_token");
    
    try {
      const res = await fetch(`/api/user-profiles?user_id=${session?.user?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          bio: data.bio || "",
          avatarUrl: data.avatarUrl || "",
          location: data.location || "",
          favoriteGenres: data.favoriteGenres ? JSON.parse(data.favoriteGenres) : []
        });
      } else if (res.status === 404) {
        // Profile doesn't exist yet, will create on save
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem("bearer_token");
    
    try {
      const payload = {
        bio: formData.bio.trim() || null,
        avatarUrl: formData.avatarUrl.trim() || null,
        location: formData.location.trim() || null,
        favoriteGenres: formData.favoriteGenres.length > 0 
          ? JSON.stringify(formData.favoriteGenres) 
          : null
      };

      let response;
      
      if (profile) {
        // Update existing profile
        response = await fetch(`/api/user-profiles?id=${profile.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new profile
        response = await fetch("/api/user-profiles", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        toast.success("Profile updated successfully!");
        router.push("/profile");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

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
              
              <Link href="/profile">
                <Button variant="ghost" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Profile
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Edit Form */}
        <section className="pt-12 pb-20 px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
              <p className="text-muted-foreground">
                Update your profile information and preferences
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bio */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">About You</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    placeholder="Tell us about yourself and your love for movies..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.bio.length} characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Avatar URL (Optional)</label>
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a URL to your profile picture
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Location</h3>
                </div>

                <div className="space-y-2">
                  <Input
                    placeholder="Los Angeles, CA"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-background border-border/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Where are you based?
                  </p>
                </div>
              </div>

              {/* Favorite Genres */}
              <div className="bg-card/50 border border-border/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Favorite Genres</h3>
                </div>

                <p className="text-sm text-muted-foreground">
                  Select your favorite movie genres (click to toggle)
                </p>

                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <Badge
                      key={genre}
                      variant={formData.favoriteGenres.includes(genre) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">
                  {formData.favoriteGenres.length} genres selected
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}