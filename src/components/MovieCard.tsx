"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface MovieCardProps {
  title: string;
  year: number;
  rating: number;
  genre: string;
  image: string;
  description: string;
}

export default function MovieCard({
  title,
  year,
  rating,
  genre,
  image,
  description,
}: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
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