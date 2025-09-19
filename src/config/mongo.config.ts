import { registerAs } from '@nestjs/config';

export const mongoConfig = registerAs('mongo', () => ({
  uri: process.env.MONGODB_URI!,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryAttempts: 5,
  retryDelay: 3000, // 3 seconds
  // MongoDB connection resilience options
  maxPoolSize: 20,
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 45000, // 45 seconds
  connectTimeoutMS: 10000, // 10 seconds
  heartbeatFrequencyMS: 10000, // 10 seconds
  maxIdleTimeMS: 30000, // 30 seconds
  //bufferMaxEntries: 0, // Don't buffer operations
  bufferCommands: false,
}));
