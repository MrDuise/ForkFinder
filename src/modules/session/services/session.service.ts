import { Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  GroupSettings,
  Session,
  SessionDocument,
} from '../schemas/session.schema';
import { CreateSessionDto } from '../dto/create-session-dto';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../redis/redis.service';
import {
  GoogleMapsService,
  GooglePlaceResult,
} from '../../../restaurant-search/google-maps.service';
import { DatabaseRetryInterceptor } from '../../../interceptors/database-retry.interceptor';

@Injectable()
@UseInterceptors(DatabaseRetryInterceptor)
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private readonly redisService: RedisService,
    private readonly googleMapsService: GoogleMapsService,
  ) {}

  async createSession(
    creatorId: string,
    createSessionDto: CreateSessionDto,
  ): Promise<Session> {
    const { location, settings } = createSessionDto;

    // Step 1: Generate a unique session ID
    const sessionId = uuidv4();

    // Step 2: Create a Redis key using the session ID
    const redisKey = `session:${sessionId}`;

    // Step 3: Fetch restaurant data based on location
    const restaurants = await this.fetchRestaurants(location);

    // Step 4: Store restaurant data in Redis
    await this.redisService.set(redisKey, restaurants);

    //Step 5: generate link
    const sharingLink = await this.createLink(sessionId);

    const groupSettings: GroupSettings = {
      maxGroupSize: settings.maxGroupSize,
      timeLimit: settings.timeLimit,
      sharingLink,
    };

    // Step 6: Create and save the session in MongoDB
    const session = new this.sessionModel({
      _id: sessionId, // Store the session ID in MongoDB as well
      creatorId, //links the session to the id of who created it
      participants: [creatorId], // Creator is automatically added
      votes: [],
      location,
      settings: groupSettings,
      redisKey,
      expiresAt: new Date(Date.now() + groupSettings.timeLimit * 60 * 1000), // Convert time limit to ms
    });

    return session.save();
  }

  //needs to be updated, query param for searching for specific cuisine types, or price levels, etc
  //query param matches individual user preferences too, so if they want vegan places only, or gluten free, etc
  private async fetchRestaurants(_location: {
    lat: number;
    lng: number;
    radius: number;
  }) {
    const restraunts: GooglePlaceResult[] =
      await this.googleMapsService.searchRestaurants(
        '',
        _location,
        _location.radius,
      );
    // Call external API to get restaurant data (replace with actual implementation)
    //calls google api, yelp api, combines into custom object, with vote data attached to each restraunt. vote data is updated by the websocket connection, which is tied to the session id
    return restraunts;
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

  async createLink(sessionID: string): Promise<string> {
    const baseUrl = process.env.BASE_URL || 'http://localhost:4200';
    return `${baseUrl}/session/join/${sessionID}`;
  }

  async joinSession(sessionID: string, userId: string): Promise<void> {
    const session = await this.getSessionById(sessionID);

    if (!session) {
      throw new NotFoundException(`Session with ID ${sessionID} not found.`);
    }

    session.participants.push(userId);

    await this.updateSession(sessionID, session);
    //TODO: create websocket connection between backend and front-end
  }

  //sessions are temporary, once a session is done, its deleted from mongo, then stored in the sql database for referense later
  async deleteSession(id: string): Promise<Session | null> {
    return this.sessionModel.findByIdAndDelete(id).exec();
  }
}
