import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import Boom from '@hapi/boom';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app = express();
app.use(express.json());

// Global error-handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (Boom.isBoom(err)) {
        // Boom error: get the status code and payload
        const { output } = err;
         res.status(output.statusCode).json(output.payload);
    }

    // For non-Boom errors, fallback to a generic server error
    res.status(500).json({
        statusCode: 500,
        error: 'Internal Server Error',
        message: err.message || 'An unknown error occurred',
    });
});


// Routes
app.use('/api/auth', authRoutes);

export default app;
