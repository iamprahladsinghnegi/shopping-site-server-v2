import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from "mongoose";
import { TestResolver } from "./graphQL/resolvers/testResolver";
const PORT: number = 5555;
const db: string = "mongodb://127.0.0.1:27017/server";

(async () => {
    const app: Application = express();
    app.use(cors({
        credentials: true,
        origin: "http://localhost:3000"
    }))
    app.use(cookieParser());
    const connect = () => {
        mongoose.connect(db, { useNewUrlParser: true }).then(async () => {
            const apolloServer = new ApolloServer({
                schema: await buildSchema({
                    resolvers: [TestResolver]
                }),
                context: ({ req, res }) => ({ req, res })
            })
            apolloServer.applyMiddleware({ app, cors: false });
            app.listen(PORT, () =>
                console.log(`Application started successfully on PORT : ${PORT}.`)
            );
            return console.info(`Successfully connected to ${db}`);
        }).catch(error => {
            console.error('Error connecting to database: ', error);
            return process.exit(1);
        });
    };
    connect();
    mongoose.connection.on('disconnected', connect);
})();