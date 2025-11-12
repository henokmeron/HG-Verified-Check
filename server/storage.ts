import {
  users,
  creditTransactions,
  vehicleLookups,
  sharedReports,
  savedReports,
  type User,
  type UpsertUser,
  type InsertCreditTransaction,
  type CreditTransaction,
  type InsertVehicleLookup,
  type VehicleLookup,
  type InsertSharedReport,
  type SharedReport,
  type InsertSavedReport,
  type SavedReport,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, sum, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: { firstName?: string | null; lastName?: string | null }): Promise<User>;

  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<{ users: User[], total: number }>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User>;
  updateUserCredits(userId: string, creditBalance: number): Promise<User>;
  getAllCreditTransactions(limit?: number, offset?: number): Promise<{ transactions: CreditTransaction[], total: number }>;
  getAllVehicleLookups(limit?: number, offset?: number): Promise<{ lookups: VehicleLookup[], total: number }>;
  getGlobalStats(): Promise<{
    totalUsers: number;
    totalLookups: number;
    totalRevenue: number;
    thisMonthUsers: number;
    thisMonthLookups: number;
    thisMonthRevenue: number;
  }>;

  // Credit operations
  getUserCreditBalance(userId: string): Promise<number>;
  addCredits(userId: string, amount: number, description: string, stripePaymentIntentId?: string): Promise<CreditTransaction>;
  deductCredits(userId: string, amount: number, description: string): Promise<boolean>;
  getCreditTransactions(userId: string, limit?: number): Promise<CreditTransaction[]>;

  // Vehicle lookup operations
  createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup>;
  getVehicleLookups(userId: string, limit?: number): Promise<VehicleLookup[]>;
  getVehicleLookup(id: string): Promise<VehicleLookup | undefined>;
  getVehicleLookupById(lookupId: string): Promise<VehicleLookup | undefined>;

  // Analytics
  getUserStats(userId: string): Promise<{
    totalLookups: number;
    thisMonthLookups: number;
    totalSpent: number;
  }>;

  // Shared reports
  createSharedReport(report: InsertSharedReport, shareCode: string): Promise<SharedReport>;
  getSharedReportByCode(shareCode: string): Promise<SharedReport | undefined>;
  incrementShareViewCount(shareCode: string): Promise<void>;
  getUserSharedReports(userId: string): Promise<SharedReport[]>;
  deleteSharedReport(shareCode: string, userId: string): Promise<boolean>;
  
  // Saved reports
  savePDFReport(report: InsertSavedReport): Promise<SavedReport>;
  getUserSavedReports(userId: string): Promise<SavedReport[]>;
  getSavedReportsByLookupId(lookupId: string): Promise<SavedReport[]>;
  getSavedReportById(reportId: string, userId: string): Promise<SavedReport | undefined>;
  deleteSavedReport(reportId: string, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserCreditBalance(userId: string): Promise<number> {
    const [user] = await db.select({ creditBalance: users.creditBalance }).from(users).where(eq(users.id, userId));
    return user?.creditBalance || 0;
  }

  async addCredits(userId: string, amount: number, description: string, stripePaymentIntentId?: string): Promise<CreditTransaction> {
    const [transaction] = await db.transaction(async (tx) => {
      // Create transaction record
      const [transaction] = await tx
        .insert(creditTransactions)
        .values({
          userId,
          type: 'purchase',
          amount,
          description,
          stripePaymentIntentId,
        })
        .returning();

      // Update user balance
      await tx
        .update(users)
        .set({
          creditBalance: sql`${users.creditBalance} + ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log admin actions for transparency
      if (description.includes('Admin')) {
        console.log(`[ADMIN CREDIT ACTION] ${description} for user ${userId}. Amount: ${amount}. Transaction ID: ${transaction.id}`);
      }

      return [transaction];
    });

    return transaction;
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const result = await db.transaction(async (tx) => {
      // Check current balance
      const [user] = await tx.select({ creditBalance: users.creditBalance }).from(users).where(eq(users.id, userId));

      if (!user || user.creditBalance < amount) {
        return false;
      }

      // Create transaction record
      await tx
        .insert(creditTransactions)
        .values({
          userId,
          type: 'deduction',
          amount: -amount,
          description,
        });

      // Update user balance
      await tx
        .update(users)
        .set({
          creditBalance: sql`${users.creditBalance} - ${amount}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      return true;
    });

    return result;
  }

  async getCreditTransactions(userId: string, limit = 50): Promise<CreditTransaction[]> {
    return await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit);
  }

  async createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup> {
    const [vehicleLookup] = await db
      .insert(vehicleLookups)
      .values(lookup)
      .returning();
    return vehicleLookup;
  }

  async getVehicleLookups(userId: string, limit = 20): Promise<VehicleLookup[]> {
    return await db
      .select()
      .from(vehicleLookups)
      .where(eq(vehicleLookups.userId, userId))
      .orderBy(desc(vehicleLookups.createdAt))
      .limit(limit);
  }

  async getVehicleLookup(id: string): Promise<VehicleLookup | undefined> {
    const [lookup] = await db.select().from(vehicleLookups).where(eq(vehicleLookups.id, id));
    return lookup;
  }

  async getVehicleLookupById(lookupId: string): Promise<VehicleLookup | undefined> {
    const [lookup] = await db.select().from(vehicleLookups).where(eq(vehicleLookups.id, lookupId));
    return lookup;
  }

  async getUserStats(userId: string): Promise<{
    totalLookups: number;
    thisMonthLookups: number;
    totalSpent: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalLookups] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vehicleLookups)
      .where(and(eq(vehicleLookups.userId, userId), eq(vehicleLookups.success, true)));

    const [thisMonthLookups] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vehicleLookups)
      .where(
        and(
          eq(vehicleLookups.userId, userId),
          eq(vehicleLookups.success, true),
          gte(vehicleLookups.createdAt, startOfMonth)
        )
      );

    const [totalSpentResult] = await db
      .select({ total: sum(creditTransactions.amount) })
      .from(creditTransactions)
      .where(and(eq(creditTransactions.userId, userId), eq(creditTransactions.type, 'purchase')));

    return {
      totalLookups: totalLookups?.count || 0,
      thisMonthLookups: thisMonthLookups?.count || 0,
      totalSpent: Math.abs(Number(totalSpentResult?.total || 0)) * 7.0, // £7.00 per credit for single checks
    };
  }

  async updateUserProfile(id: string, updates: { firstName?: string | null; lastName?: string | null }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  // Admin operations
  async getAllUsers(limit = 50, offset = 0): Promise<{ users: User[], total: number }> {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const userList = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      users: userList,
      total: totalResult?.count || 0
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserCredits(userId: string, creditBalance: number): Promise<User> {
    // Log the credit update for debugging
    console.log(`Updating credits for user ${userId}: ${creditBalance > 0 ? 'setting to' : 'deducting'} ${Math.abs(creditBalance)} credits`);

    const [user] = await db
      .update(users)
      .set({ creditBalance, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    // Get updated balance for logging
    console.log(`Credit update successful. User ${userId} new balance: ${user.creditBalance}`);
    return user;
  }

  async getAllCreditTransactions(limit = 50, offset = 0): Promise<{ transactions: CreditTransaction[], total: number }> {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(creditTransactions);

    const transactions = await db
      .select({
        id: creditTransactions.id,
        userId: creditTransactions.userId,
        type: creditTransactions.type,
        amount: creditTransactions.amount,
        description: creditTransactions.description,
        stripePaymentIntentId: creditTransactions.stripePaymentIntentId,
        createdAt: creditTransactions.createdAt,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(creditTransactions)
      .leftJoin(users, eq(creditTransactions.userId, users.id))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      transactions: transactions as any[],
      total: totalResult?.count || 0
    };
  }

  async getAllVehicleLookups(limit = 50, offset = 0): Promise<{ lookups: VehicleLookup[], total: number }> {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vehicleLookups);

    const lookups = await db
      .select({
        id: vehicleLookups.id,
        userId: vehicleLookups.userId,
        registration: vehicleLookups.registration,
        vehicleData: vehicleLookups.vehicleData,
        creditsCost: vehicleLookups.creditsCost,
        success: vehicleLookups.success,
        errorMessage: vehicleLookups.errorMessage,
        createdAt: vehicleLookups.createdAt,
        userEmail: users.email,
        userFirstName: users.firstName,
        userLastName: users.lastName
      })
      .from(vehicleLookups)
      .leftJoin(users, eq(vehicleLookups.userId, users.id))
      .orderBy(desc(vehicleLookups.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      lookups: lookups as any[],
      total: totalResult?.count || 0
    };
  }

  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalLookups: number;
    totalRevenue: number;
    thisMonthUsers: number;
    thisMonthLookups: number;
    thisMonthRevenue: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [totalLookupsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vehicleLookups)
      .where(eq(vehicleLookups.success, true));

    const [totalRevenueResult] = await db
      .select({ total: sum(creditTransactions.amount) })
      .from(creditTransactions)
      .where(eq(creditTransactions.type, 'purchase'));

    const [thisMonthUsersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users)
      .where(gte(users.createdAt, startOfMonth));

    const [thisMonthLookupsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(vehicleLookups)
      .where(
        and(
          eq(vehicleLookups.success, true),
          gte(vehicleLookups.createdAt, startOfMonth)
        )
      );

    const [thisMonthRevenueResult] = await db
      .select({ total: sum(creditTransactions.amount) })
      .from(creditTransactions)
      .where(
        and(
          eq(creditTransactions.type, 'purchase'),
          gte(creditTransactions.createdAt, startOfMonth)
        )
      );

    return {
      totalUsers: totalUsersResult?.count || 0,
      totalLookups: totalLookupsResult?.count || 0,
      totalRevenue: Number(totalRevenueResult?.total || 0) * 7.0, // £7.00 per credit average
      thisMonthUsers: thisMonthUsersResult?.count || 0,
      thisMonthLookups: thisMonthLookupsResult?.count || 0,
      thisMonthRevenue: Number(thisMonthRevenueResult?.total || 0) * 7.0, // £7.00 per credit average
    };
  }

  async createSharedReport(report: InsertSharedReport, shareCode: string): Promise<SharedReport> {
    const [sharedReport] = await db
      .insert(sharedReports)
      .values({
        ...report,
        shareCode,
      })
      .returning();
    return sharedReport;
  }

  async getSharedReportByCode(shareCode: string): Promise<SharedReport | undefined> {
    const [report] = await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.shareCode, shareCode));
    return report;
  }

  async incrementShareViewCount(shareCode: string): Promise<void> {
    await db
      .update(sharedReports)
      .set({
        viewCount: sql`${sharedReports.viewCount} + 1`,
      })
      .where(eq(sharedReports.shareCode, shareCode));
  }

  async getUserSharedReports(userId: string): Promise<SharedReport[]> {
    return await db
      .select()
      .from(sharedReports)
      .where(eq(sharedReports.userId, userId))
      .orderBy(desc(sharedReports.createdAt));
  }

  async deleteSharedReport(shareCode: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(sharedReports)
      .where(
        and(
          eq(sharedReports.shareCode, shareCode),
          eq(sharedReports.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }

  async savePDFReport(report: InsertSavedReport): Promise<SavedReport> {
    const [savedReport] = await db.insert(savedReports).values(report).returning();
    return savedReport;
  }

  async getUserSavedReports(userId: string): Promise<SavedReport[]> {
    return await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.userId, userId))
      .orderBy(desc(savedReports.createdAt));
  }

  async getSavedReportsByLookupId(lookupId: string): Promise<SavedReport[]> {
    return await db
      .select()
      .from(savedReports)
      .where(eq(savedReports.lookupId, lookupId))
      .orderBy(desc(savedReports.createdAt));
  }

  async getSavedReportById(reportId: string, userId: string): Promise<SavedReport | undefined> {
    const [report] = await db
      .select()
      .from(savedReports)
      .where(
        and(
          eq(savedReports.id, reportId),
          eq(savedReports.userId, userId)
        )
      )
      .limit(1);
    return report;
  }

  async deleteSavedReport(reportId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(savedReports)
      .where(
        and(
          eq(savedReports.id, reportId),
          eq(savedReports.userId, userId)
        )
      )
      .returning();
    return result.length > 0;
  }
}

// Mock Storage for local development (when DATABASE_URL is not configured)
// Now with file-based persistence to survive server restarts
class MockStorage implements IStorage {
  private mockUsers: Map<string, User> = new Map();
  private mockTransactions: Map<string, CreditTransaction> = new Map();
  private mockLookups: Map<string, VehicleLookup> = new Map();
  private mockSharedReports: Map<string, SharedReport> = new Map();
  private mockSavedReports: Map<string, SavedReport> = new Map();
  private dataFilePath: string;

  constructor() {
    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    this.dataFilePath = path.join(dataDir, 'mock-storage.json');
    
    // Load existing data from file
    this.loadFromFile();
    
    console.log('📦 MockStorage initialized with persistent file storage');
    console.log(`📁 Data file: ${this.dataFilePath}`);
    console.log(`📊 Loaded: ${this.mockUsers.size} users, ${this.mockTransactions.size} transactions, ${this.mockLookups.size} lookups`);
  }

  private loadFromFile(): void {
    try {
      if (fs.existsSync(this.dataFilePath)) {
        const fileData = fs.readFileSync(this.dataFilePath, 'utf-8');
        const data = JSON.parse(fileData);
        
        // Restore users
        if (data.users) {
          for (const user of data.users) {
            // Convert date strings back to Date objects
            user.createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
            user.updatedAt = user.updatedAt ? new Date(user.updatedAt) : new Date();
            this.mockUsers.set(user.id, user);
          }
        }
        
        // Restore transactions
        if (data.transactions) {
          for (const transaction of data.transactions) {
            transaction.createdAt = transaction.createdAt ? new Date(transaction.createdAt) : new Date();
            this.mockTransactions.set(transaction.id, transaction);
          }
        }
        
        // Restore lookups
        if (data.lookups) {
          for (const lookup of data.lookups) {
            lookup.createdAt = lookup.createdAt ? new Date(lookup.createdAt) : new Date();
            this.mockLookups.set(lookup.id, lookup);
          }
        }
        
        // Restore shared reports
        if (data.sharedReports) {
          for (const report of data.sharedReports) {
            report.createdAt = report.createdAt ? new Date(report.createdAt) : new Date();
            this.mockSharedReports.set(report.shareCode, report);
          }
        }
        
        // Restore saved reports
        if (data.savedReports) {
          for (const report of data.savedReports) {
            report.createdAt = report.createdAt ? new Date(report.createdAt) : new Date();
            this.mockSavedReports.set(report.id, report);
          }
        }
        
        console.log('✅ Loaded persistent data from file');
      } else {
        console.log('📝 No existing data file found - starting fresh');
      }
    } catch (error) {
      console.error('❌ Error loading data from file:', error);
      console.log('📝 Starting with empty storage');
    }
  }

  private saveToFile(): void {
    try {
      const data = {
        users: Array.from(this.mockUsers.values()),
        transactions: Array.from(this.mockTransactions.values()),
        lookups: Array.from(this.mockLookups.values()),
        sharedReports: Array.from(this.mockSharedReports.values()),
        savedReports: Array.from(this.mockSavedReports.values()),
      };
      
      fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
      // Only log on important operations, not every save (too verbose)
    } catch (error) {
      console.error('❌ Error saving data to file:', error);
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.mockUsers.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // If userData has an id, try to find by id first
    if (userData.id) {
      const existingById = this.mockUsers.get(userData.id);
      if (existingById) {
        const updatedUser = { ...existingById, ...userData, updatedAt: new Date() };
        this.mockUsers.set(userData.id, updatedUser);
        this.saveToFile();
        return updatedUser;
      }
    }
    
    // Otherwise, find by email
    const existingUser = Array.from(this.mockUsers.values()).find(u => u.email === userData.email);
    if (existingUser) {
      const updatedUser = { ...existingUser, ...userData, updatedAt: new Date() };
      this.mockUsers.set(existingUser.id, updatedUser);
      this.saveToFile();
      return updatedUser;
    }

    // Create new user - use provided id or generate one
    const userId = userData.id || `user-${Date.now()}-${userData.email.split('@')[0]}`;
    const newUser: User = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      role: userData.role || 'user',
      creditBalance: userData.creditBalance || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockUsers.set(newUser.id, newUser);
    this.saveToFile();
    console.log('✅ Created/updated user in MockStorage:', newUser.email, 'ID:', newUser.id);
    return newUser;
  }

  async updateUserProfile(id: string, updates: { firstName?: string | null; lastName?: string | null }): Promise<User> {
    const user = this.mockUsers.get(id);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.mockUsers.set(id, updatedUser);
    this.saveToFile();
    return updatedUser;
  }

  async getAllUsers(limit = 50, offset = 0): Promise<{ users: User[], total: number }> {
    const allUsers = Array.from(this.mockUsers.values());
    // Sort by createdAt descending (newest first)
    const sortedUsers = allUsers.sort((a, b) => 
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
    return {
      users: sortedUsers.slice(offset, offset + limit),
      total: sortedUsers.length
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.mockUsers.values()).find(u => u.email === email);
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<User> {
    const user = this.mockUsers.get(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, role, updatedAt: new Date() };
    this.mockUsers.set(userId, updatedUser);
    this.saveToFile();
    return updatedUser;
  }

  async updateUserCredits(userId: string, creditBalance: number): Promise<User> {
    const user = this.mockUsers.get(userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, creditBalance, updatedAt: new Date() };
    this.mockUsers.set(userId, updatedUser);
    this.saveToFile();
    console.log(`💾 Saved credit update: User ${userId} now has ${creditBalance} credits`);
    return updatedUser;
  }

  async getAllCreditTransactions(limit = 50, offset = 0): Promise<{ transactions: CreditTransaction[], total: number }> {
    const allTransactions = Array.from(this.mockTransactions.values());
    return {
      transactions: allTransactions.slice(offset, offset + limit),
      total: allTransactions.length
    };
  }

  async getAllVehicleLookups(limit = 50, offset = 0): Promise<{ lookups: VehicleLookup[], total: number }> {
    const allLookups = Array.from(this.mockLookups.values());
    return {
      lookups: allLookups.slice(offset, offset + limit),
      total: allLookups.length
    };
  }

  async getGlobalStats(): Promise<{
    totalUsers: number;
    totalLookups: number;
    totalRevenue: number;
    thisMonthUsers: number;
    thisMonthLookups: number;
    thisMonthRevenue: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Calculate total users
    const totalUsers = this.mockUsers.size;
    
    // Calculate total lookups (only successful ones)
    const totalLookups = Array.from(this.mockLookups.values())
      .filter(l => l.success === true).length;
    
    // Calculate total revenue from purchase transactions
    const purchaseTransactions = Array.from(this.mockTransactions.values())
      .filter(t => t.type === 'purchase');
    const totalRevenue = purchaseTransactions.reduce((sum, t) => {
      // Calculate revenue: amount is credits, multiply by average price per credit (£7)
      return sum + (Math.abs(t.amount) * 7.0);
    }, 0);
    
    // Calculate this month's users
    const thisMonthUsers = Array.from(this.mockUsers.values())
      .filter(u => u.createdAt && u.createdAt >= startOfMonth).length;
    
    // Calculate this month's lookups (only successful ones)
    const thisMonthLookups = Array.from(this.mockLookups.values())
      .filter(l => l.success === true && l.createdAt && l.createdAt >= startOfMonth).length;
    
    // Calculate this month's revenue
    const thisMonthRevenue = purchaseTransactions
      .filter(t => t.createdAt && t.createdAt >= startOfMonth)
      .reduce((sum, t) => sum + (Math.abs(t.amount) * 7.0), 0);
    
    return {
      totalUsers,
      totalLookups,
      totalRevenue,
      thisMonthUsers,
      thisMonthLookups,
      thisMonthRevenue,
    };
  }

  async getUserCreditBalance(userId: string): Promise<number> {
    const user = this.mockUsers.get(userId);
    return user?.creditBalance || 0;
  }

  async addCredits(userId: string, amount: number, description: string, stripePaymentIntentId?: string): Promise<CreditTransaction> {
    const user = this.mockUsers.get(userId);
    if (user) {
      user.creditBalance += amount;
      user.updatedAt = new Date();
    }

    const transaction: CreditTransaction = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      type: 'purchase',
      amount,
      description,
      stripePaymentIntentId,
      createdAt: new Date(),
    };
    this.mockTransactions.set(transaction.id, transaction);
    this.saveToFile();
    return transaction;
  }

  async deductCredits(userId: string, amount: number, description: string): Promise<boolean> {
    const user = this.mockUsers.get(userId);
    if (!user || user.creditBalance < amount) return false;

    user.creditBalance -= amount;
    user.updatedAt = new Date();

    const transaction: CreditTransaction = {
      id: `transaction-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      userId,
      type: 'deduction',
      amount: -amount,
      description,
      createdAt: new Date(),
    };
    this.mockTransactions.set(transaction.id, transaction);
    this.saveToFile();
    console.log(`💾 Saved credit deduction: User ${userId} deducted ${amount} credits, new balance: ${user.creditBalance}`);
    return true;
  }

  async getCreditTransactions(userId: string, limit = 50): Promise<CreditTransaction[]> {
    return Array.from(this.mockTransactions.values())
      .filter(t => t.userId === userId)
      .slice(0, limit);
  }

  async createVehicleLookup(lookup: InsertVehicleLookup): Promise<VehicleLookup> {
    const newLookup: VehicleLookup = {
      id: `lookup-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...lookup,
      createdAt: new Date(),
    };
    this.mockLookups.set(newLookup.id, newLookup);
    this.saveToFile();
    return newLookup;
  }

  async getVehicleLookups(userId: string, limit = 20): Promise<VehicleLookup[]> {
    return Array.from(this.mockLookups.values())
      .filter(l => l.userId === userId)
      .slice(0, limit);
  }

  async getVehicleLookup(id: string): Promise<VehicleLookup | undefined> {
    return this.mockLookups.get(id);
  }

  async getVehicleLookupById(lookupId: string): Promise<VehicleLookup | undefined> {
    return this.mockLookups.get(lookupId);
  }

  async getUserStats(userId: string): Promise<{
    totalLookups: number;
    thisMonthLookups: number;
    totalSpent: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const userLookups = Array.from(this.mockLookups.values())
      .filter(l => l.userId === userId && l.success === true);
    const userTransactions = Array.from(this.mockTransactions.values())
      .filter(t => t.userId === userId && t.type === 'purchase');
    
    const thisMonthLookups = userLookups.filter(l => 
      l.createdAt && l.createdAt >= startOfMonth
    ).length;
    
    return {
      totalLookups: userLookups.length,
      thisMonthLookups,
      totalSpent: userTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) * 7,
    };
  }

  async createSharedReport(report: InsertSharedReport, shareCode: string): Promise<SharedReport> {
    const newReport: SharedReport = {
      id: `shared-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...report,
      shareCode,
      viewCount: 0,
      createdAt: new Date(),
    };
    this.mockSharedReports.set(shareCode, newReport);
    this.saveToFile();
    return newReport;
  }

  async getSharedReportByCode(shareCode: string): Promise<SharedReport | undefined> {
    return this.mockSharedReports.get(shareCode);
  }

  async incrementShareViewCount(shareCode: string): Promise<void> {
    const report = this.mockSharedReports.get(shareCode);
    if (report) {
      report.viewCount++;
      this.saveToFile();
    }
  }

  async getUserSharedReports(userId: string): Promise<SharedReport[]> {
    return Array.from(this.mockSharedReports.values())
      .filter(r => r.userId === userId);
  }

  async deleteSharedReport(shareCode: string, userId: string): Promise<boolean> {
    const report = this.mockSharedReports.get(shareCode);
    if (report && report.userId === userId) {
      this.mockSharedReports.delete(shareCode);
      this.saveToFile();
      return true;
    }
    return false;
  }

  async savePDFReport(report: InsertSavedReport): Promise<SavedReport> {
    const newReport: SavedReport = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      ...report,
      createdAt: new Date(),
    };
    this.mockSavedReports.set(newReport.id, newReport);
    this.saveToFile();
    return newReport;
  }

  async getUserSavedReports(userId: string): Promise<SavedReport[]> {
    return Array.from(this.mockSavedReports.values())
      .filter(r => r.userId === userId);
  }

  async getSavedReportsByLookupId(lookupId: string): Promise<SavedReport[]> {
    return Array.from(this.mockSavedReports.values())
      .filter(r => r.lookupId === lookupId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSavedReportById(reportId: string, userId: string): Promise<SavedReport | undefined> {
    const report = this.mockSavedReports.get(reportId);
    return report && report.userId === userId ? report : undefined;
  }

  async deleteSavedReport(reportId: string, userId: string): Promise<boolean> {
    const report = this.mockSavedReports.get(reportId);
    if (report && report.userId === userId) {
      this.mockSavedReports.delete(reportId);
      this.saveToFile();
      return true;
    }
    return false;
  }
}

// Export the appropriate storage implementation based on database availability
export const storage = db ? new DatabaseStorage() : new MockStorage();