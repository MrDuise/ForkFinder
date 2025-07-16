# ForkFinder API

A monolithic backend service for the ForkFinder application - a collaborative restaurant discovery platform that helps groups find and vote on restaurants together.

## 🍽️ Overview

ForkFinder is a group dining decision-making platform that allows users to:
- Create collaborative restaurant discovery sessions
- Vote on restaurant choices with group members
- Set location-based preferences and dietary restrictions
- Share sessions via links for easy group participation

## 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Primary Database**: PostgreSQL (User data, profiles)
- **Session Storage**: MongoDB (Session data, voting)
- **Caching**: Redis (Restaurant data, temporary storage)
- **Geocoding**: OpenStreetMap via node-geocoder

## 📁 Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── config/                    # Configuration files
│   ├── database.config.ts     # PostgreSQL configuration
│   ├── redis.config.ts        # Redis configuration
│   ├── mongo.config.ts        # MongoDB configuration
│   └── jwt.config.ts          # JWT configuration
├── common/
│   └── middleware/            # Global middleware
├── modules/
│   ├── auth/                  # Authentication & user management
│   │   ├── controllers/       # Auth & user controllers
│   │   ├── services/          # Business logic
│   │   ├── entities/          # Database entities
│   │   ├── dto/              # Data transfer objects
│   │   └── jwt-auth.guard.ts  # JWT authentication guard
│   ├── session/              # Session management
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── schemas/          # MongoDB schemas
│   │   └── dto/
│   └── redis/                # Redis service
└── database/
    └── migrations/           # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL
- MongoDB
- Redis

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_ISSUER=ForkFinder
JWT_AUDIENCE=ForkFinder-Users
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=7d

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres123
DB_NAME=ForkFinder

# MongoDB
MONGODB_URI=mongodb://admin:password@localhost:27017/sessionDB?authSource=admin

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=forkfinder:
```

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd forkfinder-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up databases**
   
   **PostgreSQL:**
   ```sql
   CREATE DATABASE ForkFinder;
   CREATE USER postgres WITH PASSWORD 'postgres123';
   GRANT ALL PRIVILEGES ON DATABASE ForkFinder TO postgres;
   ```

   **MongoDB:** Ensure MongoDB is running with the credentials specified in your environment variables.

   **Redis:** Ensure Redis server is running on the specified port.

4. **Run database migrations**
   ```bash
   npm run migration:run
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

The API will be available at `http://localhost:3000/api/v1`

## 📡 API Endpoints

### Health & Status
- `GET /api/v1/` - Welcome message
- `GET /api/v1/health` - Health check with system info
- `GET /api/v1/status` - Service status check

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login

### User Management (Protected)
- `PATCH /api/v1/user/profileInfo` - Update user profile and preferences

### Sessions (Protected)
- `POST /api/v1/sessions` - Create new session
- `GET /api/v1/sessions/:id` - Get session details
- `PUT /api/v1/sessions/:id` - Update session
- `DELETE /api/v1/sessions/:id` - Delete session

## 🔐 Authentication

The API uses JWT-based authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📝 Data Models

### User
```typescript
{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Preferences
```typescript
{
  userId: string;
  defaultLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  defaultRadius?: number;
  dietaryPreferences?: string[];
  cuisinePreferences?: string[];
}
```

### Session
```typescript
{
  id: string;
  creatorId: string;
  participants: string[];
  votes: Array<{
    restaurantId: string;
    userId: string;
    vote: boolean;
  }>;
  location: {
    lat: number;
    lng: number;
    radius: number;
  };
  settings: {
    maxGroupSize: number;
    notificationPreferences: string;
    timeLimit: number;
  };
  expiresAt: Date;
}
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🛠️ Development

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint

### Database Operations

```bash
# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## 🔧 Configuration

The application uses NestJS's configuration module with environment-specific configs:

- **Development**: `.env.local`, `.env`
- **Production**: Environment variables

Key configuration files:
- `src/config/database.config.ts` - PostgreSQL settings
- `src/config/redis.config.ts` - Redis settings
- `src/config/mongo.config.ts` - MongoDB settings
- `src/config/jwt.config.ts` - JWT settings

## 🐳 Docker Support

*(Docker configuration not included in current codebase but recommended)*

Create `docker-compose.yml` for local development:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: ForkFinder
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
    ports:
      - "5432:5432"
      
  mongodb:
    image: mongo:5
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 🚨 Known Issues

- Session module is commented out in `app.module.ts` (line 25-26)
- Some test files are commented out
- Geocoding currently uses OpenStreetMap (consider rate limiting for production)

## 📈 Production Considerations

- Enable SSL for all database connections
- Use proper secrets management (AWS Secrets Manager, etc.)
- Implement rate limiting
- Add comprehensive logging and monitoring
- Use connection pooling for databases
- Implement proper error tracking (Sentry, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and ensure they pass
6. Submit a pull request

## 📄 License

[Add your license information here]

---

**ForkFinder API** - Making group dining decisions easier, one swipe at a time! 🍴