import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  uuid,
  primaryKey,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  creditBalance: integer("credit_balance").default(0).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  role: varchar("role").default("user").notNull(), // 'user' or 'admin'
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  preferences: jsonb("preferences").default({}),
  authProvider: varchar("auth_provider").default("local").notNull(),
  providerId: varchar("provider_id"),
  passwordHash: text("password_hash"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
  lastLoginIp: varchar("last_login_ip"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_role").on(table.role),
  index("idx_users_created_at").on(table.createdAt),
  index("idx_users_auth_provider").on(table.authProvider),
  index("idx_users_provider_id").on(table.providerId),
]);

// Credit transactions table
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // 'purchase', 'deduction', 'refund', 'bonus', 'expired'
  amount: integer("amount").notNull(),
  description: text("description"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_credit_transactions_user_id").on(table.userId),
  index("idx_credit_transactions_type").on(table.type),
  index("idx_credit_transactions_created_at").on(table.createdAt),
]);

// Vehicle lookups table
export const vehicleLookups = pgTable("vehicle_lookups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  registration: varchar("registration").notNull(),
  vehicleData: jsonb("vehicle_data"), // Store the full DVLA response
  reportRaw: jsonb("report_raw"), // Store the entire VIDcheck JSON exactly as returned
  creditsCost: integer("credits_cost").default(1).notNull(),
  success: boolean("success").default(true).notNull(),
  errorMessage: text("error_message"),
  reportType: varchar("report_type").default("comprehensive").notNull(), // 'free', 'comprehensive'
  processingTime: integer("processing_time"), // milliseconds
  apiProvider: varchar("api_provider").default("vidcheck").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_vehicle_lookups_user_id").on(table.userId),
  index("idx_vehicle_lookups_registration").on(table.registration),
  index("idx_vehicle_lookups_created_at").on(table.createdAt),
  index("idx_vehicle_lookups_success").on(table.success),
]);

// Shared reports table
export const sharedReports = pgTable("shared_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shareCode: varchar("share_code").unique().notNull(),
  lookupId: varchar("lookup_id").notNull().references(() => vehicleLookups.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at"),
  viewCount: integer("view_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved PDF reports table
export const savedReports = pgTable("saved_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  vrm: varchar("vrm").notNull(),
  checkType: varchar("check_type").notNull(), // 'comprehensive' or 'free'
  bytes: integer("bytes").notNull(),
  fileName: varchar("file_name").notNull(),
  storageKey: varchar("storage_key").notNull(),
  downloadUrl: varchar("download_url").notNull(),
  lookupId: varchar("lookup_id").references(() => vehicleLookups.id, { onDelete: 'set null' }),
  downloadCount: integer("download_count").default(0).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_saved_reports_user_id").on(table.userId),
  index("idx_saved_reports_vrm").on(table.vrm),
  index("idx_saved_reports_created_at").on(table.createdAt),
]);

// Analytics and tracking tables
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventType: varchar("event_type").notNull(), // 'page_view', 'lookup', 'download', 'share', etc.
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  sessionId: varchar("session_id"),
  page: varchar("page"),
  referrer: varchar("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_event_type").on(table.eventType),
  index("idx_analytics_user_id").on(table.userId),
  index("idx_analytics_created_at").on(table.createdAt),
  index("idx_analytics_session_id").on(table.sessionId),
]);

// System configuration table
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key").unique().notNull(),
  value: jsonb("value").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_system_config_key").on(table.key),
  index("idx_system_config_is_public").on(table.isPublic),
]);

// API usage tracking
export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'set null' }),
  endpoint: varchar("endpoint").notNull(),
  method: varchar("method").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTime: integer("response_time").notNull(), // milliseconds
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_api_usage_user_id").on(table.userId),
  index("idx_api_usage_endpoint").on(table.endpoint),
  index("idx_api_usage_created_at").on(table.createdAt),
  index("idx_api_usage_status_code").on(table.statusCode),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  creditTransactions: many(creditTransactions),
  vehicleLookups: many(vehicleLookups),
  sharedReports: many(sharedReports),
  savedReports: many(savedReports),
  analytics: many(analytics),
  apiUsage: many(apiUsage),
  systemConfigUpdates: many(systemConfig),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}));

export const vehicleLookupsRelations = relations(vehicleLookups, ({ one, many }) => ({
  user: one(users, {
    fields: [vehicleLookups.userId],
    references: [users.id],
  }),
  sharedReports: many(sharedReports),
  savedReports: many(savedReports),
}));

export const sharedReportsRelations = relations(sharedReports, ({ one }) => ({
  user: one(users, {
    fields: [sharedReports.userId],
    references: [users.id],
  }),
  vehicleLookup: one(vehicleLookups, {
    fields: [sharedReports.lookupId],
    references: [vehicleLookups.id],
  }),
}));

export const savedReportsRelations = relations(savedReports, ({ one }) => ({
  user: one(users, {
    fields: [savedReports.userId],
    references: [users.id],
  }),
  vehicleLookup: one(vehicleLookups, {
    fields: [savedReports.lookupId],
    references: [vehicleLookups.id],
  }),
}));

export const analyticsRelations = relations(analytics, ({ one }) => ({
  user: one(users, {
    fields: [analytics.userId],
    references: [users.id],
  }),
}));

export const systemConfigRelations = relations(systemConfig, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [systemConfig.updatedBy],
    references: [users.id],
  }),
}));

export const apiUsageRelations = relations(apiUsage, ({ one }) => ({
  user: one(users, {
    fields: [apiUsage.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleLookupSchema = createInsertSchema(vehicleLookups).omit({
  id: true,
  createdAt: true,
});

export const insertSharedReportSchema = createInsertSchema(sharedReports).omit({
  id: true,
  createdAt: true,
  shareCode: true,
  viewCount: true,
});

export const insertSavedReportSchema = createInsertSchema(savedReports).omit({
  id: true,
  createdAt: true,
});

// Insert schemas for new tables
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertSystemConfigSchema = createInsertSchema(systemConfig).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserRole = 'user' | 'admin';
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertVehicleLookup = z.infer<typeof insertVehicleLookupSchema>;
export type VehicleLookup = typeof vehicleLookups.$inferSelect;
export type InsertSharedReport = z.infer<typeof insertSharedReportSchema>;
export type SharedReport = typeof sharedReports.$inferSelect;
export type InsertSavedReport = z.infer<typeof insertSavedReportSchema>;
export type SavedReport = typeof savedReports.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertSystemConfig = z.infer<typeof insertSystemConfigSchema>;
export type SystemConfig = typeof systemConfig.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;

// Vehicle data interface (for DVLA API response)
export interface VehicleData {
  registration: string;
  make: string;
  model: string;
  year: number;
  engineSize: string;
  fuelType: string;
  colour: string;
  firstRegistration: string;
  co2Emissions: string;
  euroStatus: string;
  motExpiry?: string;
  motResult?: string;
  mileage?: string;
  taxExpiry?: string;
  taxBand?: string;
  sornStatus: string;
}
