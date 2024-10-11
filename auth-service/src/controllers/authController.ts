import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Boom from '@hapi/boom';
import { register, login } from '../services/authService';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
        throw Boom.badRequest('Username and password are required.');
    }
   
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await register(username, hashedPassword);
     res.status(201).json(user);
  } catch (error) {
    next(error)
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;
    const token = await login(username, password);
    if (!token)
        {
            res.status(401).json({ message: 'Invalid credentials' });
        } 
     res.status(200).json({ token });
  } catch (error) {
    next(error)
  }
};
