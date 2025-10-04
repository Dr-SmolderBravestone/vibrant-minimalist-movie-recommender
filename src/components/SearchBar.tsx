"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search movies...",
}: SearchBarProps) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-12 pr-6 h-14 text-base text-foreground bg-card border-border/50 focus:border-primary/50 rounded-full transition-all duration-300 focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}