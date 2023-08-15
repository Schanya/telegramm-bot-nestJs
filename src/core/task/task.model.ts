import {
  BelongsTo,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from '../user/user.model';

export interface TaskCreationAttrs {
  title: string;
  description: string;
  time: Date;
}

@Table({ tableName: 'tasks', paranoid: true })
export class Task extends Model<Task, TaskCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  title: string;

  @Column({ type: DataType.STRING, allowNull: false })
  description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  time: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  notification: Boolean;

  @BelongsTo(() => User, 'user_id')
  user: User;
}
