import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({userId}, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION });
};

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  const newToken = new RefreshToken({ token: refreshToken, userId, expiryDate });
  await newToken.save();

  return refreshToken;
};
