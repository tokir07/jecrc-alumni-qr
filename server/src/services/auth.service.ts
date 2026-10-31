import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { comparePassword, hashPassword } from '../utils/crypto.js';
import { AuthUserPayload } from '../types/index.js';
import { Role } from '@prisma/client';

export class AuthService {
  /**
   * Authenticate admin or volunteer user.
   */
  async login(username: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isValid = await comparePassword(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid username or password');
    }

    const payload: AuthUserPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '24h',
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  /**
   * Get all volunteer accounts (Admin only).
   */
  async getVolunteers() {
    return prisma.user.findMany({
      where: { role: Role.VOLUNTEER },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create a new volunteer account (Admin only).
   */
  async createVolunteer(username: string, passwordPlain: string) {
    const cleanUsername = username.trim();

    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      const err = new Error(`User "${cleanUsername}" already exists.`);
      (err as any).statusCode = 409;
      throw err;
    }

    const passwordHash = await hashPassword(passwordPlain);

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        passwordHash,
        role: Role.VOLUNTEER,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }
}

export const authService = new AuthService();
