import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

class Location {
  @Column()
  address: string;

  @Column('double precision') // more precise for lat/lng
  latitude: number;

  @Column('double precision')
  longitude: number;
}

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryColumn('uuid') // same as User.id
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // tells TypeORM to use this as foreign key
  user: User;

  @Column(() => Location, { prefix: 'defaultLocation' })
  defaultLocation?: Location;

  @Column({ type: 'int', nullable: true })
  defaultRadius?: number;

  @Column('simple-array', { nullable: true })
  dietaryPreferences?: string[];

  @Column('simple-array', { nullable: true })
  cuisinePreferences?: string[];
}
