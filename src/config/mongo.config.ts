import { registerAs } from '@nestjs/config';

export const mongoConfig = registerAs('mongo', () => ({
  uri:
    process.env.MONGODB_URI ||
    'mongodb://admin:password@localhost:27017/sessionDB?authSource=admin',
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  bufferCommands: false,
  bufferMaxEntries: 0,
}));
