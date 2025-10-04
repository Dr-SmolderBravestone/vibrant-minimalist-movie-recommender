import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const reviews = sqliteTable('reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  movieId: integer('movie_id').notNull(),
  movieTitle: text('movie_title').notNull(),
  moviePoster: text('movie_poster'),
  userName: text('user_name').notNull(),
  rating: integer('rating').notNull(),
  reviewText: text('review_text'),
  createdAt: text('created_at').notNull(),
});

export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id').notNull().unique(),
  likedMovieIds: text('liked_movie_ids'),
  preferredGenres: text('preferred_genres'),
  searchHistory: text('search_history'),
  updatedAt: text('updated_at').notNull(),
});