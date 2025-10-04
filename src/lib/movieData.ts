export interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string;
  image: string;
  description: string;
  keywords: string[];
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    keywords: ["space", "time", "science", "exploration", "drama"],
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    genre: "Action",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800&q=80",
    description: "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest tests.",
    keywords: ["superhero", "action", "thriller", "crime", "batman"],
  },
  {
    id: 3,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    description: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task.",
    keywords: ["dreams", "mind", "thriller", "science", "heist"],
  },
  {
    id: 4,
    title: "The Shawshank Redemption",
    year: 1994,
    rating: 9.3,
    genre: "Drama",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    description: "Two imprisoned men bond over years, finding solace and eventual redemption through acts of decency.",
    keywords: ["prison", "hope", "friendship", "drama", "redemption"],
  },
  {
    id: 5,
    title: "Pulp Fiction",
    year: 1994,
    rating: 8.9,
    genre: "Crime",
    image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=800&q=80",
    description: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine in four tales of violence.",
    keywords: ["crime", "violence", "dark", "comedy", "thriller"],
  },
  {
    id: 6,
    title: "The Matrix",
    year: 1999,
    rating: 8.7,
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80",
    description: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
    keywords: ["technology", "simulation", "action", "philosophy", "ai"],
  },
  {
    id: 7,
    title: "Forrest Gump",
    year: 1994,
    rating: 8.8,
    genre: "Drama",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80",
    description: "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man.",
    keywords: ["life", "journey", "history", "love", "inspiration"],
  },
  {
    id: 8,
    title: "Fight Club",
    year: 1999,
    rating: 8.8,
    genre: "Drama",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80",
    description: "An insomniac office worker and a soap salesman build a global organization to help vent male aggression.",
    keywords: ["psychology", "violence", "society", "thriller", "dark"],
  },
  {
    id: 9,
    title: "The Godfather",
    year: 1972,
    rating: 9.2,
    genre: "Crime",
    image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=800&q=80",
    description: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son.",
    keywords: ["mafia", "family", "power", "crime", "classic"],
  },
  {
    id: 10,
    title: "Goodfellas",
    year: 1990,
    rating: 8.7,
    genre: "Crime",
    image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife and partners.",
    keywords: ["mafia", "biography", "crime", "violence", "drama"],
  },
  {
    id: 11,
    title: "Blade Runner 2049",
    year: 2017,
    rating: 8.0,
    genre: "Sci-Fi",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    description: "A young blade runner's discovery of a secret leads him to track down former blade runner Rick Deckard.",
    keywords: ["future", "dystopia", "android", "mystery", "visual"],
  },
  {
    id: 12,
    title: "The Prestige",
    year: 2006,
    rating: 8.5,
    genre: "Mystery",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion.",
    keywords: ["magic", "rivalry", "mystery", "twist", "obsession"],
  },
];

export function searchMovies(query: string, moviesList: Movie[] = movies): Movie[] {
  if (!query.trim()) return moviesList;
  
  const lowerQuery = query.toLowerCase();
  return moviesList.filter(
    (movie) =>
      movie.title.toLowerCase().includes(lowerQuery) ||
      movie.genre.toLowerCase().includes(lowerQuery) ||
      movie.description.toLowerCase().includes(lowerQuery) ||
      movie.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
  );
}

export function getRecommendedMovies(currentMovie: Movie, count: number = 3): Movie[] {
  // Simple recommendation based on genre and rating
  return movies
    .filter((movie) => movie.id !== currentMovie.id)
    .filter((movie) => movie.genre === currentMovie.genre || movie.rating >= 8.5)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, count);
}