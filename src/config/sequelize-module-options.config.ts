import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';

const dbconfig: SequelizeModuleOptions = {
  dialect: process.env.POSTGRES_DB_DIALECT as Dialect,
  host: process.env.POSTGRES_DB_HOST,
  port: Number.parseInt(process.env.POSTGRES_DB_PORT, 10),
  username: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  database: process.env.POSTGRES_DB_NAME,
  models: [],
  autoLoadModels: true,
  synchronize: true,
};

export { dbconfig };
