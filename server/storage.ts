import { users, transactions, type User, type InsertUser, type Transaction, type InsertTransaction } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Transaction methods
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Auth methods
  incrementLoginAttempts(username: string): Promise<void>;
  resetLoginAttempts(username: string): Promise<void>;
  lockUser(username: string): Promise<void>;
}

// PostgreSQL Database Storage
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class PostgreSQLStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate random initial balance between $100 and $1000
    const initialBalance = (Math.floor(Math.random() * 900) + 100).toFixed(2);
    
    const result = await db.insert(users).values({
      ...insertUser,
      balance: initialBalance,
      loginAttempts: 0,
      isLocked: false,
    }).returning();
    
    return result[0];
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    
    return result[0];
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values({
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      description: insertTransaction.description,
      metadata: insertTransaction.metadata ?? null,
      recipientUsername: insertTransaction.recipientUsername ?? null,
    }).returning();
    
    return result[0];
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    const result = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
    
    return result;
  }

  async incrementLoginAttempts(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { 
        loginAttempts: user.loginAttempts + 1,
        isLocked: user.loginAttempts + 1 >= 3
      });
    }
  }

  async resetLoginAttempts(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { 
        loginAttempts: 0,
        isLocked: false
      });
    }
  }

  async lockUser(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { isLocked: true });
    }
  }
}

// Memory Storage for fallback
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.currentUserId = 1;
    this.currentTransactionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const initialBalance = (Math.floor(Math.random() * 900) + 100).toFixed(2);
    
    const user: User = { 
      ...insertUser, 
      id, 
      balance: initialBalance,
      loginAttempts: 0,
      isLocked: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      id,
      userId: insertTransaction.userId,
      type: insertTransaction.type,
      amount: insertTransaction.amount,
      description: insertTransaction.description,
      metadata: insertTransaction.metadata ?? null,
      recipientUsername: insertTransaction.recipientUsername ?? null,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async incrementLoginAttempts(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { 
        loginAttempts: user.loginAttempts + 1,
        isLocked: user.loginAttempts + 1 >= 3
      });
    }
  }

  async resetLoginAttempts(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { 
        loginAttempts: 0,
        isLocked: false
      });
    }
  }

  async lockUser(username: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      await this.updateUser(user.id, { isLocked: true });
    }
  }
}

// Use PostgreSQL storage for real database functionality
export const storage = new PostgreSQLStorage();
