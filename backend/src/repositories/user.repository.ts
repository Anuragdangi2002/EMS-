import { Prisma, User } from '@prisma/client';
import { prisma } from '../config/prisma';

export class UserRepository {
  /**
   * Finds a user by their UUID.
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  /**
   * Finds a user by their unique email.
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Finds a user by active password reset token and ensures the token hasn't expired.
   */
  async findByResetToken(hashedToken: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date() // Expiry timestamp must be greater than current time
        }
      }
    });
  }

  /**
   * Inserts a new user record into the database.
   */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data
    });
  }

  /**
   * Updates an existing user record.
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data
    });
  }
}

export const userRepository = new UserRepository();
