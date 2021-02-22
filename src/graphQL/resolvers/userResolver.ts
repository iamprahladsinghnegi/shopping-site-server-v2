import { Resolver, Mutation, Arg, Ctx, Args, Query, UseMiddleware } from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User, RegisterUserResponse, LoginResponse } from '../types/user.types';
import { Context } from '../types/context';
import { verify } from 'jsonwebtoken';
import { RegisterUser } from '../types/user.types';
import { UserDocument, UserModel } from '../../database/model/user.model';
import { sendRefreshToken } from '../../utils/sendRefreshToken';
import { createAccessToken, createRefreshToken } from '../../utils/auth';
import { CartModel } from '../../database/model/cart.model';
import { isAuth } from '../../utils/isAuthMiddleware';
import { generateRendomString } from '../../utils/generateId';



@Resolver()
export class UserResolver {
    //TODO -> research 
    // private readonly userCollection = new UserModel() 

    //get user details
    @Query(() => User, { nullable: true })
    async getUserDetails(
        @Ctx() context: Context
    ): Promise<User | null> {
        const authorization = context.req.headers['authorization']
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(' ')[1]
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            const user: UserDocument = await UserModel.findOne({ userId: payload.userId }).populate('cart')
            if (!user) {
                throw new Error('unable to get user')
            }
            return user
        } catch (err) {
            console.log('unable to get user details', err)
            return null
        }
    }

    //use function 
    @Mutation(() => Boolean)
    async revokeRefreshTokensForUser(
        @Arg('userId', () => String) userId: string
    ): Promise<boolean> {
        //trying to increment user's token in database
        const updateUserToken = await UserModel.updateOne({ userId }, { $inc: { tokenNumber: 1 } })
        if (!updateUserToken) {
            throw new Error('Unbale to increment user tokeNumber');

        }
        return true
    }

    //login
    @Mutation(() => LoginResponse)
    async loginUser(@Arg('email') email: string, @Arg('password') password: string, @Ctx() { res }: Context): Promise<typeof LoginResponse> {

        // try to get the user using email, if not able to get user means email is not registered 
        const user: UserDocument = await UserModel.findOne({ email }).populate('cart')
        console.log(user)
        if (!user) {
            // throw new Error(`Email doesn't register! please register`)
            return {
                message: "Email doesn't register! please register",
                errorCode: 1,
                isEmailExists: false
            }
        }

        // compare the result with user's hashed password
        const isValid = await compare(password, user.password)
        if (!isValid) {
            // throw new Error('Password not matched!')
            return {
                message: "Password not matched",
                errorCode: 2,
                isPasswordMatched: false
            }
        }

        // create and add refresh token in cookie
        sendRefreshToken(res, createRefreshToken(user))

        //create and return access token in response
        return {
            accessToken: createAccessToken(user),
            user
        }


    }

    //register
    @Mutation(() => RegisterUserResponse)
    async registerUser(
        @Args() { email, firstName, lastName, password }: RegisterUser
    ): Promise<typeof RegisterUserResponse> {

        // check whether the email already exists 
        let isEmailExists = await UserModel.findOne({ 'email': email })
        if (isEmailExists) {
            return {
                message: "email error",
                errorCode: 1,
                isUserExists: true
            }
        }

        // hash the password before storing to db 
        const hashedPassowd = await hash(password, 7) //process.env.HASH_SALT!
        if (!hashedPassowd) {
            return {
                message: "hash error",
                errorCode: 2,
                uanbleToHash: true
            }
        }

        //create empty card for user
        const userCartId: string = generateRendomString();
        const newCart = await CartModel.create({ cartId: userCartId })

        // try to add the user 
        const userId: string = generateRendomString();
        return UserModel.create({ userId, email, password: hashedPassowd, lastName, firstName, cart: newCart._id }).then(_res => {
            return { userId }
        }).catch(_err => {
            console.log('unable to add user!', _err)
            return {
                message: "somthing went wrong",
                errorCode: 3,
                isSomethingWorng: true
            }
        })

    }

    // logout
    @Mutation(() => Boolean)
    async logoutUser(
        @Ctx() { res }: Context
    ): Promise<boolean> {
        //send empty refresh token in cookies
        sendRefreshToken(res, '')
        return true
    }


    //protected route
    @Query(() => String)
    @UseMiddleware(isAuth)
    bye(@Ctx() { payload }: Context): string {
        console.log(payload)
        return `hi! userId: ${payload!.userId}`
    }
}

