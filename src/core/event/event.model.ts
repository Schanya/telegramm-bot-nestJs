import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';

import { User } from '@user/user.model';
import { EventType } from './types';

export interface EventCreationAttrs {
  time: Date;
  type: EventType;
}

@Table({ tableName: 'events', paranoid: true })
export class Event extends Model<Event, EventCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.DATE, allowNull: false })
  time: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  type: EventType;

  @BelongsToMany(() => User, 'user_event', 'event_id', 'user_id')
  users: User[];
}
