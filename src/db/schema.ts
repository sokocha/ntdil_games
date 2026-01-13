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
  scheduledDate: text('scheduled_date'), // YYYY-MM-DD format, null for unscheduled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Outliers categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  difficulty: integer('difficulty').notNull(), // 1 = easy, 2 = medium, 3 = hard
  connection: text('connection').notNull(),
  items: jsonb('items').$type<string[]>().notNull(),
  outliers: jsonb('outliers').$type<string[]>().notNull(),
  scheduledDate: text('scheduled_date'), // YYYY-MM-DD format, null for unscheduled
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Types for TypeScript
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
