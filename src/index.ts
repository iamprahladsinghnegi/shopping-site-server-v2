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
import { OfferResolver } from "./graphQL/resolvers/offers.resolver";
// import DB_CONFIG from '../dbconfig.json';
// import * as path from "path";

const PORT: number = 5555;
const db: string = `mongodb+srv://iamprahlad:${process.env.DB_PASSWORD}@shopping-site.msc7a.mongodb.net/shopping?retryWrites=true&w=majority`; //`mongodb://${DB_CONFIG.url}:${DB_CONFIG.port}/shopping`;

(async () => {
    const app: Application = express();
    app.use(cors({
        credentials: true,
        origin: "http://localhost:3000"
    }))
    app.use(cookieParser());

    app.get('/', (_req, res) => {
        return res.send('<h1>Thanks for request!</h1>');
    })

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
        const user: UserDocument = await UserModel.findOne({ userId: payload.userId }, { _id: 0, userId: 1, tokenNumber: 1 })
        console.log(user)
        if (!user) {
            console.log('user not found')
            return res.send({ ok: false, accessToken: '' })
        }
        if (user.tokenNumber !== payload.tokenNumber) {
            console.log('token number different! please log in again')
            return res.send({ ok: false, accessToken: '' })

        }

        //adding cookie to response
        sendRefreshToken(res, createRefreshToken(user))
        return res.send({ ok: true, accessToken: createAccessToken(user) })

    })
    const connect = () => {
        mongoose.connect(db, { useNewUrlParser: true, autoIndex: true }).then(async () => {
            const apolloServer = new ApolloServer({
                schema: await buildSchema({
                    resolvers: [UserResolver, InventoryResolver, CartResolver, ItemResolver, OfferResolver],
                    // automatically create `schema.gql` file with schema definition in current folder
                    // emitSchemaFile: path.resolve(__dirname, "schema.gql"),
                }),
                context: ({ req, res }) => ({ req, res })
            })
            apolloServer.applyMiddleware({ app, cors: false });
            app.listen(process.env.PORT || PORT, () =>
                console.log(`Application started successfully on PORT : ${process.env.PORT || PORT}.`)
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