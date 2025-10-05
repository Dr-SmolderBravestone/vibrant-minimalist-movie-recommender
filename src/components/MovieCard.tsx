"use client";

import { Star, Heart, Bookmark, Play } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { checkAndAwardAchievements } from "@/lib/achievements";

interface MovieCardProps {
  movieId: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  image: string;
  description: string;
  onClick?: () => void;
}

export default function MovieCard({
  movieId,
  title,
  year,
  rating,
  genre,
  image,
  description,
  onClick,
}: MovieCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [watchLaterLoading, setWatchLaterLoading] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error("Please login to add favorites");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setFavoriteLoading(true);
    const token = localStorage.getItem("bearer_token");

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          movieTitle: title,
          moviePoster: image.includes('tmdb') ? image.split('w500')[1] : null
        })
      });

      if (response.ok) {
        toast.success("Added to favorites ❤️");
        
        // Check and award achievements
        if (token && session?.user?.id) {
          await checkAndAwardAchievements(session.user.id, token);
        }
      } else {
        const error = await response.json();
        if (error.code === "DUPLICATE_FAVORITE") {
          toast.info("Already in favorites");
        } else {
          toast.error(error.error || "Failed to add to favorites");
        }
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      toast.error("An error occurred");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleWatchLater = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!session?.user) {
      toast.error("Please login to add to watch later");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setWatchLaterLoading(true);
    const token = localStorage.getItem("bearer_token");

    try {
      const response = await fetch("/api/watch-later", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          movieId,
          movieTitle: title,
          moviePoster: image.includes('tmdb') ? image.split('w500')[1] : null
        })
      });

      if (response.ok) {
        toast.success("Added to watch later 🔖");
        
        // Check and award achievements
        if (token && session?.user?.id) {
          await checkAndAwardAchievements(session.user.id, token);
        }
      } else {
        const error = await response.json();
        if (error.code === "DUPLICATE_MOVIE") {
          toast.info("Already in watch later");
        } else {
          toast.error(error.error || "Failed to add to watch later");
        }
      }
    } catch (error) {
      console.error("Error adding to watch later:", error);
      toast.error("An error occurred");
    } finally {
      setWatchLaterLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group relative bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative h-[400px] overflow-hidden bg-muted">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-white">{rating}</span>
        </div>

        {/* Quick Action Buttons */}
        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className="p-2.5 bg-black/80 backdrop-blur-sm rounded-full hover:bg-red-500 hover:scale-110 transition-all duration-200 disabled:opacity-50"
            title="Add to Favorites"
          >
            <Heart className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleWatchLater}
            disabled={watchLaterLoading}
            className="p-2.5 bg-black/80 backdrop-blur-sm rounded-full hover:bg-accent hover:scale-110 transition-all duration-200 disabled:opacity-50"
            title="Watch Later"
          >
            <Bookmark className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Click to view details overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-primary/90 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2">
            <Play className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">View Details</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {title}
          </h3>
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {year}
          </span>
        </div>
        
        <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
          {genre}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
      </div>
    </motion.div>
  );
}