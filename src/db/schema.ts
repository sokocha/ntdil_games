import { pgTable, serial, text, integer, jsonb, timestamp, unique } from 'drizzle-orm/pg-core'

// Squaddle players table
export const players = pgTable(
  'players',
  {
    id: serial().primaryKey().notNull(),
    playerId: text('player_id').notNull(),
    name: text().notNull(),
    acceptedAnswers: jsonb('accepted_answers').$type<string[]>().notNull(),
    clues: jsonb()
      .$type<{
        position: string
        trophies: string
        stats: string
        international: string
        clubs: string
        hint: string
      }>()
      .notNull(),
    difficulty: text().$type<'easy' | 'medium' | 'hard'>().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
    scheduledDate: text('scheduled_date'),
  },
  (table) => [unique('players_player_id_unique').on(table.playerId)]
)

// Outliers categories table
export const categories = pgTable('categories', {
  id: serial().primaryKey().notNull(),
  difficulty: integer().notNull(),
  connection: text().notNull(),
  items: jsonb().$type<string[]>().notNull(),
  outliers: jsonb().$type<string[]>().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  scheduledDate: text('scheduled_date'),
})

// Game analytics tracking table
export const gamePlays = pgTable('game_plays', {
  id: serial().primaryKey().notNull(),
  uniquePlayerId: text('unique_player_id').notNull(),
  ipAddress: text('ip_address'),
  game: text().notNull().$type<'squaddle' | 'outliers' | 'simon'>(),
  playDate: text('play_date').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
})

// Types for TypeScript
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type GamePlay = typeof gamePlays.$inferSelect
export type NewGamePlay = typeof gamePlays.$inferInsert
