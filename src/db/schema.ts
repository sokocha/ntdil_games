import { pgTable, serial, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

// Squaddle players table
export const players = pgTable('players', {
  id: serial('id').primaryKey(),
  playerId: text('player_id').notNull().unique(),
  name: text('name').notNull(),
  acceptedAnswers: jsonb('accepted_answers').$type<string[]>().notNull(),
  clues: jsonb('clues')
    .$type<{
      position: string
      trophies: string
      stats: string
      international: string
      clubs: string
      hint: string
    }>()
    .notNull(),
  difficulty: text('difficulty').$type<'easy' | 'medium' | 'hard'>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  scheduledDate: text('scheduled_date'), // YYYY-MM-DD format, null for unscheduled
})

// Outliers categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  difficulty: integer('difficulty').notNull(), // 1 = easy, 2 = medium, 3 = hard
  connection: text('connection').notNull(),
  items: jsonb('items').$type<string[]>().notNull(),
  outliers: jsonb('outliers').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  scheduledDate: text('scheduled_date'), // YYYY-MM-DD format, null for unscheduled
})

// Game analytics tracking table
export const gamePlays = pgTable('game_plays', {
  id: serial('id').primaryKey(),
  uniquePlayerId: text('unique_player_id').notNull(), // UUID stored in localStorage
  ipAddress: text('ip_address'), // Backup identifier
  game: text('game').notNull().$type<'squaddle' | 'outliers' | 'simon'>(),
  playDate: text('play_date').notNull(), // YYYY-MM-DD format
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Types for TypeScript
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type GamePlay = typeof gamePlays.$inferSelect
export type NewGamePlay = typeof gamePlays.$inferInsert
