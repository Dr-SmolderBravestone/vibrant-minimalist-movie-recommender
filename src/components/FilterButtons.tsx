"use client";

import { Button } from "@/components/ui/button";

interface Genre {
  id: number;
  name: string;
}

interface FilterButtonsProps {
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  genres: Genre[];
}

export default function FilterButtons({
  selectedGenre,
  onGenreChange,
  genres
}: FilterButtonsProps) {
  // Get top genres for display
  const popularGenres = genres.slice(0, 8);

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        onClick={() => onGenreChange("All")}
        variant={selectedGenre === "All" ? "default" : "outline"}
        className={`rounded-full px-6 transition-all duration-300 ${
        selectedGenre === "All" ?
        "bg-primary text-primary-foreground shadow-lg shadow-primary/25" :
        "bg-card border-border/50 hover:border-primary/50 hover:bg-primary/5"}`
        }>

        All
      </Button>
      {popularGenres.map((genre) =>
      <Button
        key={genre.id}
        onClick={() => onGenreChange(genre.id.toString())}
        variant={selectedGenre === genre.id.toString() ? "default" : "outline"}
        className={`rounded-full px-6 transition-all duration-300 !flex !text-white ${
        selectedGenre === genre.id.toString() ?
        "bg-primary text-primary-foreground shadow-lg shadow-primary/25" :
        "bg-card border-border/50 hover:border-primary/50 hover:bg-primary/5"}`
        }>

          {genre.name}
        </Button>
      )}
    </div>);

}