import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';
import { CreateSessionDto } from '../dto/create-session-dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly redisService: RedisService,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<Session> {
    const { creatorId, location, settings } = createSessionDto;

    // Step 1: Generate a unique session ID
    const sessionId = uuidv4();

    // Step 2: Create a Redis key using the session ID
    const redisKey = `session:${sessionId}`;

    // Step 3: Fetch restaurant data based on location
    const restaurants = await this.fetchRestaurants(location);

    // Step 4: Store restaurant data in Redis
    await this.redisService.set(redisKey, JSON.stringify(restaurants));

    // Step 5: Create and save the session in MongoDB
    const session = new this.sessionModel({
      _id: sessionId, // Store the session ID in MongoDB as well
      creatorId,
      participants: [creatorId], // Creator is automatically added
      votes: [],
      location,
      settings,
      redisKey,
      expiresAt: new Date(Date.now() + settings.timeLimit * 60 * 1000), // Convert time limit to ms
    });

    return session.save();
  }

  private async fetchRestaurants(_location: {
    lat: number;
    lng: number;
    radius: number;
  }) {
    // Call external API to get restaurant data (replace with actual implementation)
    return [
      { id: 'restaurant1', name: 'Pizza Place' },
      { id: 'restaurant2', name: 'Sushi Spot' },
    ];
  }

  async getSessionById(id: string): Promise<Session | null> {
    return this.sessionModel.findById(id).exec();
  }

  async updateSession(
    id: string,
    data: Partial<Session>,
  ): Promise<Session | null> {
    return this.sessionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteSession(id: string): Promise<Session | null> {
    return this.sessionModel.findByIdAndDelete(id).exec();
  }

  async createLink(id: string): Promise<string | null> {
    return 'session share link';
  }

  // async addParticipte(id: string): Promise<string | null> {
  //   //user gets the link, clicks on it, it opens the app, gets the user id, sends the request to add them to the session, which returns opens up the main screen for the session for swiping
  // }
}
