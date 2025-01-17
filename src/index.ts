import "dotenv/config";
import "reflect-metadata";
import express, { Application } from "express";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from "type-graphql";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoose from "mongoose";
import { verify } from "jsonwebtoken";
import { UserDocument, UserModel } from "./database/model/user.model";
import { createRefreshToken, createAccessToken } from "./utils/auth";
import { sendRefreshToken } from "./utils/sendRefreshToken";
import { UserResolver } from "./graphQL/resolvers/userResolver";
import { ItemResolver } from "./graphQL/resolvers/item.resolver";
import { InventoryResolver } from "./graphQL/resolvers/inventory.resolver";
import { CartResolver } from "./graphQL/resolvers/cart.resolver";
// import { TestResolver } from "./graphQL/resolvers/testResolver";
const PORT: number = 5555;
const db: string = "mongodb://127.0.0.1:27017/server";

(async () => {
    const app: Application = express();
    app.use(cors({
        credentials: true,
        origin: "http://localhost:3000"
    }))
    app.use(cookieParser());
    app.post('/refresh_token', async (req, res) => {
        const token = req.cookies.abcid
        if (!token) {
            console.log('unable to get token')
            return res.send({ ok: false, accessToken: '' })
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        }
        catch (err) {
            console.log(err)
            return res.send({ ok: false, accessToken: '' })
        }
        // token is valid 
        // we can send back an access token
        const user: UserDocument = await UserModel.findOne({ _id: payload.userId })
        if (!user) {
            console.log('user not found')
            return res.send({ ok: false, accessToken: '' })
        }
        if (user.tokenNumber !== payload.tokenNumber) {
            console.log('')
            return res.send({ ok: false, accessToken: '' })

        }

        //adding cookie to response
        sendRefreshToken(res, createRefreshToken(user))
        return res.send({ ok: true, accessToken: createAccessToken(user) })

    })
    const connect = () => {
        mongoose.connect(db, { useNewUrlParser: true }).then(async () => {
            const apolloServer = new ApolloServer({
                schema: await buildSchema({
                    resolvers: [UserResolver, InventoryResolver, CartResolver, ItemResolver]
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