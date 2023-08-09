import { config } from 'dotenv';
config();

const application = {
  port: process.env.APP_PORT,
};

const db = {
  host: process.env.POSTGRES_DB_HOST,
  port: process.env.POSTGRES_DB_PORT,
  userName: process.env.POSTGRES_DB_USERNAME,
  password: process.env.POSTGRES_DB_PASSWORD,
  dbName: process.env.POSTGRES_DB_NAME,
  dialect: process.env.POSTGRES_DB_DIALECT,
};

const telegramm = {
  token: process.env.TELEGRAMM_BOT_TOKEN,
};

const cat = {
  url: process.env.CAT_URL,
};

const dog = {
  url: process.env.DOG_URL,
};

const weather = {
  url: process.env.WEATHER_URL,
  key: process.env.WEATHER_KEY,
};

const sight = {
  url: process.env.SIGHTS_URL,
  key: process.env.SIGHTS_KEY,
};

export { application, db, telegramm, cat, dog, weather, sight };
