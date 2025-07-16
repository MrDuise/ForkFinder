import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type SessionDocument = Session & Document;

@Schema()
export class GroupSettings {
  @Prop({ type: Number, required: true })
  maxGroupSize: number;

  @Prop({ type: String, required: true })
  sharingLink: string;

  @Prop({ type: Number, required: true })
  timeLimit: number;
}

@Schema({ timestamps: true })
export class Session {
  @Prop({
    type: String,
    default: () => uuidv4(),
    _id: true, // This tells MongoDB to use this field as the _id
  })
  _id: string;

  @Prop({ type: String, required: true }) // This should be the actual user ID from JWT
  creatorId: string;

  @Prop({ type: [String], default: [] }) //UUID
  participants: string[];

  @Prop({
    type: [{ restaurantId: String, userId: String, vote: Boolean }],
    default: [],
  })
  votes: { restaurantId: string; userId: string; vote: boolean }[];

  @Prop({ type: Object, required: true }) // Location details
  location: {
    lat: number;
    lng: number;
    radius: number;
  };

  @Prop({ type: Object, required: true })
  settings: GroupSettings;

  @Prop({ type: String }) // Redis key reference
  redisKey?: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
export const GroupSettingsSchema = SchemaFactory.createForClass(GroupSettings);

// Disable the automatic _id generation since we're providing our own
SessionSchema.set('_id', false);
