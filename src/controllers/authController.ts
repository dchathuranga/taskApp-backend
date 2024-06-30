import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

interface RegisterUserReq extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}
interface RegisterUserResData {
  _id: string;
  username: string;
  email: string;
  token: string;
}
export const registerUser = async (req: RegisterUserReq, res: ApiResponse<RegisterUserResData>) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Username, email, and password are required.'
      });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'There is already a verified account with this email. If you are the owner, please sign-in or reset your credentials to continue.'
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
    });

    if (!newUser) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Server error'
      });
    }
    const newUserId = newUser._id.toString();
    const accessToken = generateAccessToken(newUserId);
    await generateRefreshToken(newUserId);
    await newUser.save();
    
    res.status(201).json({
      success: true,
      data: {
        _id: newUser._id.toString(),
        username: newUser.username,
        email: newUser.email,
        token: accessToken,
      },
      message: 'User registered successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: `Error in registerUser: ${error}`
    });
  }
};

interface LoginReq extends Request {
  body: {
    email: string;
    password: string;
  };
}
interface LoginResData {
  _id: string;
  username: string;
  email: string;
  token: string;
}
export const login = async (req: LoginReq, res: ApiResponse<LoginResData>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Email and password are required.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'user not found.'
      });
    }
    const userId = user._id.toString();
    const accessToken = generateAccessToken(userId);
    await generateRefreshToken(userId);

    if (await user.matchPassword(password)) {
      res.json({
        success: true,
        data: {
          _id: userId,
          username: user.username,
          email: user.email,
          token: accessToken,
        },
        message: 'Authentication successful.'
      });
    } else {
      res.status(401).json({
        success: false,
        data: null,
        message: 'Invalid email or password'
      });
    }
  } catch (error) {
    console.error('Error in authUser:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Server error'
    });
  }
};

interface RefreshTokenReq extends Request {
  body: {
    token: string;
  };
}
interface RefreshTokenResData {
  accessToken: string;
}
export const refreshToken = async (req: RefreshTokenReq, res: ApiResponse<RefreshTokenResData>) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401);

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const existingToken = await RefreshToken.findOne({ token: hashedToken });

  if (!existingToken) return res.sendStatus(403);

  if (existingToken.expiryDate < new Date()) {
    await RefreshToken.findByIdAndDelete(existingToken._id);
    return res.sendStatus(403);
  }

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, async (err: any, decoded: any) => {
    if (err || existingToken.userId.toString() !== decoded.userId) return res.sendStatus(403);

    const newAccessToken = generateAccessToken(decoded.userId);
    res.json({
      success: true,
      data: { accessToken: newAccessToken },
      message: 'token updated.'
    });
  });
};
