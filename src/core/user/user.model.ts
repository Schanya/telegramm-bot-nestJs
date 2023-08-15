import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { City } from '../city/city.model';
import { Event } from '../event/event.model';
import { Task } from '../task/task.model';

export interface UserCreationAttrs {
  telegrammID: number;
  name: string;
}

@Table({ tableName: 'users', paranoid: true })
export class User extends Model<User, UserCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  telegrammID: number;

  @BelongsTo(() => City, 'city_id')
  city: City;

  @BelongsToMany(() => Event, 'user_event', 'user_id', 'event_id')
  events: Event[];

  @HasMany(() => Task, 'user_id')
  tasks: Task[];
}
