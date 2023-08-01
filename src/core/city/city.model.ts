import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { User } from '../user/user.model';

export interface CityCreationAttrs {
  name: string;
}

@Table({ tableName: 'cities', paranoid: true })
export class City extends Model<City, CityCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @HasMany(() => User, 'city_id')
  users: User[];
}
