// src/types/auth.types.ts
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// src/config/auth.ts
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth.types';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  bcryptSaltRounds: 12,
  passwordResetExpires: 60 * 60 * 1000, // 1 heure
};

export const generateTokens = (payload: Omit<JwtPayload, 'iat' | 'exp'>) => {
  const accessToken = jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(payload, authConfig.jwtRefreshSecret, {
    expiresIn: authConfig.jwtRefreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const verifyToken = (token: string, isRefresh = false): JwtPayload => {
  const secret = isRefresh ? authConfig.jwtRefreshSecret : authConfig.jwtSecret;
  return jwt.verify(token, secret) as JwtPayload;
};

// src/utils/validation.ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  username: z
    .string()
    .min(3, 'Le nom d\'utilisateur doit faire au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, _ et -'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export const passwordResetSchema = z.object({
  email: z.string().email('Email invalide'),
});

export const passwordUpdateSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit faire au moins 8 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
});

// src/services/auth.service.ts
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { authConfig, generateTokens } from '../config/auth';
import { RegisterData, LoginCredentials, AuthResponse } from '../types/auth.types';
import { logger } from '../utils/logger';

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName } = data;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error(
        existingUser.email === email 
          ? 'Cet email est déjà utilisé'
          : 'Ce nom d\'utilisateur est déjà pris'
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, authConfig.bcryptSaltRounds);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      },
    });

    logger.info('Nouvel utilisateur enregistré', { userId: user.id, email });

    // Générer les tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Mettre à jour la dernière connexion
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logger.info('Utilisateur connecté', { userId: user.id, email });

    // Générer les tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens,
    };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return;
    }

    // Générer un token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + authConfig.passwordResetExpires);

    // Supprimer les anciens tokens
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Créer le nouveau token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    // TODO: Envoyer l'email avec le lien de reset
    logger.info('Token de reset généré', { userId: user.id, email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw new Error('Token de reset invalide ou expiré');
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, authConfig.bcryptSaltRounds);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    logger.info('Mot de passe réinitialisé', { userId: resetToken.userId });
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, authConfig.jwtRefreshSecret) as any;
      
      // Vérifier que l'utilisateur existe toujours
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new Error('Utilisateur non trouvé');
      }

      // Générer de nouveaux tokens
      return generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
    } catch (error) {
      throw new Error('Token de rafraîchissement invalide');
    }
  }
}

// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { registerSchema, loginSchema, passwordResetSchema, passwordUpdateSchema } from '../utils/validation';
import { logger } from '../utils/logger';

export class AuthController {
  private authService = new AuthService();

  register = async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await this.authService.register(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        data: result,
      });
    } catch (error) {
      logger.error('Erreur lors de l\'inscription', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData);
      
      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error) {
      logger.error('Erreur lors de la connexion', { error: error.message });
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  };

  requestPasswordReset = async (req: Request, res: Response) => {
    try {
      const { email } = passwordResetSchema.parse(req.body);
      await this.authService.requestPasswordReset(email);
      
      res.json({
        success: true,
        message: 'Si cet email existe, vous recevrez un lien de réinitialisation',
      });
    } catch (error) {
      logger.error('Erreur lors de la demande de reset', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const { token, password } = passwordUpdateSchema.parse(req.body);
      await this.authService.resetPassword(token, password);
      
      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      logger.error('Erreur lors du reset de mot de passe', { error: error.message });
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Token de rafraîchissement requis',
        });
      }

      const tokens = await this.authService.refreshTokens(refreshToken);
      
      res.json({
        success: true,
        message: 'Tokens rafraîchis',
        data: { tokens },
      });
    } catch (error) {
      logger.error('Erreur lors du refresh token', { error: error.message });
      res.status(401).json({
        success: false,
        message: error.message,
      });
    }
  };
}