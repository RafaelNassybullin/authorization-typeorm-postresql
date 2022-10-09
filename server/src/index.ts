import "reflect-metadata";
import Express from "express";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";
import { buildSchema } from "type-graphql"
import { bgGreenBright, bgRedBright } from "colorette"
import { AuthResolver } from "./auth/resolver"
import { HelloResolver } from "./data/resolver"
import { DataSource } from "typeorm"
import session from "express-session"
import { connectMessage, DBconfig, sessionConfig } from "./config";

const PORT = 7808;

const main = async () => {
  const AppDataSource = new DataSource(DBconfig)
  AppDataSource.initialize()
    .then(() => {
      console.log(bgGreenBright(connectMessage(PORT)))
    })
    .catch((err) => {
      console.error(bgRedBright("Error during Data Source initialization"), err)
    })
  const schema = await buildSchema(
    {
      resolvers: [HelloResolver, AuthResolver],
      validate: true,
      authChecker: ({ context: { req } }): boolean => {
        return !!req.session.userId
      }
    }
  )
  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
  });
  const app = Express()
  app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
  }))
  app.use(session(sessionConfig))
  await apolloServer.start()
  apolloServer.applyMiddleware({ app })
  app.listen(PORT)
}

main()