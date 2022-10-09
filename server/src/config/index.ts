import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session"
import { User } from "../auth/schema"
import { DataSourceOptions } from "typeorm";

export const redis = new Redis();
const RedisStore = connectRedis(session)

export const connectMessage = (port: string | number) => {
  return `

  PostgreSQL is connected!
  Server successfully started in http://localhost:${port}/graphql
  `
}

export const sessionConfig = {
  store: new RedisStore({
    client: redis as any,
  }),
  name: "rafaelsCookie",
  secret: "SECRET-SESSION-CODE-EXAMPLE",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 7 * 365, //7 days
  }
}

export const DBconfig: DataSourceOptions = {
  type: "postgres",
  entities: [User],
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "rafael",
  synchronize: true,
  logging: true
}