import { SequelizeModuleOptions } from '@nestjs/sequelize';
import { Dialect } from 'sequelize';
import { db } from 'env';

const dbconfig: SequelizeModuleOptions = {
  dialect: db.dialect as Dialect,
  host: db.host,
  port: Number.parseInt(db.port, 10),
  username: db.userName,
  password: db.password,
  database: db.dbName,
  models: [],
  autoLoadModels: true,
  synchronize: true,
};

export { dbconfig };
