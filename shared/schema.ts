import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("viewer"), // admin, archivist, viewer
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Blocks table (A, B, C, ... Z, AA, AB, ...)
export const blocks = pgTable("blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull().unique(), // A, B, C, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Rows table (3 rows per block: A.1, A.2, A.3)
export const rows = pgTable("rows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blockId: varchar("block_id").notNull().references(() => blocks.id),
  label: text("label").notNull(), // 1, 2, 3
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Sections table (multiple sections per row: A.1.1, A.1.2, ...)
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rowId: varchar("row_id").notNull().references(() => rows.id),
  label: text("label").notNull(), // 1, 2, 3, 4, ...
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id),
  reference: text("reference").notNull().unique(), // A.1.1.1, A.1.1.2, etc.
  title: text("title").notNull(),
  category: text("category").notNull(), // legal, financial, administrative, civil, criminal, commercial, family
  metadata: json("metadata"), // Additional metadata as JSON
  status: text("status").notNull().default("active"), // active, archived, pending
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Papers table (contents within documents)
export const papers = pgTable("papers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id),
  title: text("title").notNull(),
  content: text("content"),
  attachmentUrl: text("attachment_url"),
  fileType: text("file_type"), // pdf, doc, image, etc.
  fileSize: integer("file_size"), // in bytes
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBlockSchema = createInsertSchema(blocks).omit({
  id: true,
  createdAt: true,
});

export const insertRowSchema = createInsertSchema(rows).omit({
  id: true,
  createdAt: true,
});

export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  reference: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaperSchema = createInsertSchema(papers).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "اسم المستخدم مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Block = typeof blocks.$inferSelect;
export type InsertBlock = z.infer<typeof insertBlockSchema>;
export type Row = typeof rows.$inferSelect;
export type InsertRow = z.infer<typeof insertRowSchema>;
export type Section = typeof sections.$inferSelect;
export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Paper = typeof papers.$inferSelect;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;

// Document with relations
export type DocumentWithDetails = Document & {
  block: Block;
  row: Row;
  section: Section;
  papers: Paper[];
  creator: User;
};

// Stats type
export type DashboardStats = {
  totalCases: number;
  processedDocs: number;
  pendingDocs: number;
  archivedCases: number;
};
