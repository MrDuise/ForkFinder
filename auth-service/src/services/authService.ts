import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const users: any[] = []; // A temporary in-memory store. Replace with DB later.
//TODO: Create connection to database

export const register = async (username: string, hashedPassword: string) => {
  const user = { id: users.length + 1, username, password: hashedPassword };
  users.push(user);
  return user;
};

export const login = async (username: string, password: string) => {
  const user = users.find(u => u.username === username);
  if (!user) return null;

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });
  return token;
};
