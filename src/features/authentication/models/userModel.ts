import { pgTable, serial, varchar, boolean, timestamp, unique, integer } from 'drizzle-orm/pg-core';
import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { db } from '@/config/database.ts';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import validator from 'validator';
import { roomModel } from '@/features/rooms/models/roomModel.ts';

// Define the User schema
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  photo: varchar('photo', { length: 255 }).default('default.jpg'),
  password: varchar('password', { length: 255 }).notNull(),
  passwordChangedAt: timestamp('password_changed_at'),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  active: boolean('active').default(true),
  joinedRoom: integer("joined_room").references(() => roomModel.id), // this is a foreign key
  socketId: varchar('socket_id'),
}, (table) => {
  return [unique().on(table.email)];
});

// Export types using the non-deprecated approach
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// User model class for methods
export class UserModel {
  // Create a new user with validation
  static async create(userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    photo?: string;
  }): Promise<User> {
    // Validate email
    if (!validator.isEmail(userData.email)) {
      throw new Error('Please provide a valid email');
    }

    // Validate password length
    if (userData.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Check if passwords match
    if (userData.password !== userData.passwordConfirm) {
      throw new Error('Passwords are not the same!');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    // Create the user object with all fields explicitly defined
    const userToInsert: Partial<NewUser> = {
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
    };

    // Add optional fields if provided
    if (userData.photo) userToInsert["photo"] = userData.photo;

    // Insert user into database
    const [user] = await db.insert(users).values(userToInsert as NewUser).returning();

    return user;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(
      eq(users.id, id),
      eq(users.active, true)
    ));
    return user;
  }

  // Find user by email
  static async findByEmail(email: string, includePassword = false): Promise<User | undefined> {
    const query = db.select().from(users).where(and(
      eq(users.email, email.toLowerCase()),
      eq(users.active, true)
    ));
    
    const [user] = await query;
    return user;
  }

  // Verify password
  static async correctPassword(candidatePassword: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
  }

  // Check if password changed after token was issued
  static changedPasswordAfter(user: User, JWTTimestamp: number): boolean {
    if (user.passwordChangedAt) {
      const changedTimestamp = Math.floor(new Date(user.passwordChangedAt).getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  // Create password reset token
  static async createPasswordResetToken(userId: number): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    const expiryDate = new Date(Date.now() + 10 * 60 * 1000);

    // Update using the proper column references to avoid type errors
    await db.update(users)
      .set({
        [users.passwordResetToken.name]: hashedToken,
        [users.passwordResetExpires.name]: expiryDate
      })
      .where(eq(users.id, userId));

    return resetToken;
  }
  
  // Update password
  static async updatePassword(userId: number, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [user] = await db.update(users)
      .set({
        [users.password.name]: hashedPassword,
        [users.passwordChangedAt.name]: new Date(Date.now() - 1000),
        [users.passwordResetToken.name]: null,
        [users.passwordResetExpires.name]: null
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  // Find user by reset token
  static async findByResetToken(token: string): Promise<User | undefined> {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    const [user] = await db.select().from(users).where(and(
      eq(users.passwordResetToken, hashedToken),
      eq(users.active, true)
    ));
    
    // Check if token has expired
    if (user && user.passwordResetExpires) {
      const now = new Date();
      if (new Date(user.passwordResetExpires) < now) {
        return undefined;
      }
    }
    
    return user;
  }

  // Update user active status
  static async updateActive(userId: number, active: boolean): Promise<User> {
    const [user] = await db.update(users)
      .set({
        [users.active.name]: active
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
}