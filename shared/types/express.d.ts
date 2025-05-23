// src/types/express.d.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
