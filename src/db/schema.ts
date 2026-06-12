import { pgTable, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  school: text('school'),
  avatar: text('avatar'),
  xp: integer('xp').notNull().default(0),
  solved: integer('solved').notNull().default(0),
  streak: integer('streak').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isAdmin: boolean('is_admin').notNull().default(false),
  password: text('password').notNull(),
});

export const syllabus = pgTable('syllabus', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  progress: integer('progress').notNull().default(0),
  active: boolean('active').notNull().default(false),
  difficulty: text('difficulty').default('easy'),
  topic: text('topic').default(''),
  markdownContent: text('markdown_content').default(''),
  codeSnippet: text('code_snippet').default(''),
});
