import { pgTable, serial, text, integer, timestamp, uniqueIndex, varchar } from 'drizzle-orm/pg-core';

// Defines the 'users' table in the database.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  // The 'sub' claim from the Auth0 JWT, used as the primary identifier for the user.
  auth0Sub: text('auth0_sub').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  photoURL: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Defines the 'likes' table, linking users to their liked media items.
export const likes = pgTable('likes', {
  pk: serial('pk').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  id: integer('id').notNull(), // TMDB media ID
  type: varchar('type', { length: 10 }).notNull(), // 'movie' or 'tv'
  title: text('title').notNull(),
  posterUrl: text('poster_url').notNull(),
  releaseYear: varchar('release_year', { length: 4 }).notNull(),
}, (table) => {
  return {
    userIdx: uniqueIndex('likes_user_id_idx').on(table.userId, table.id),
  };
});

// Defines the 'dislikes' table, linking users to their disliked media items.
export const dislikes = pgTable('dislikes', {
  pk: serial('pk').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  id: integer('id').notNull(), // TMDB media ID
  type: varchar('type', { length: 10 }).notNull(), // 'movie' or 'tv'
}, (table) => {
  return {
    userIdx: uniqueIndex('dislikes_user_id_idx').on(table.userId, table.id),
  };
});