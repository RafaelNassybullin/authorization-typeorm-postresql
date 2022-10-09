import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import bcryptjs from "bcryptjs"
import { User } from "../../auth/schema";
import { RegisterInput, UpdatePasswordInput } from "./inputs";
import { MyContext } from "../../interfaces";
import { confirmationLink, sendEmail } from "../../auth/utils";
import { redis } from "../../config";
import { v4 } from "uuid";

@Resolver()
export class AuthResolver {

  //* Sign Up =>
  @Mutation(() => User)
  async register(
    @Arg("data") { firstname, lastname, email, password }: RegisterInput
  ): Promise<User> {
    const hashedPassword = await bcryptjs.hash(password, 12)
    const user = User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword
    }).save()
    await sendEmail(email, await confirmationLink((await user).id))
    return user!
  }

  //*  Sign in =>
  @Mutation(() => User, { nullable: true })
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return null
    }
    const valid = await bcryptjs.compare(password, user.password)
    if (!valid) {
      return null
    }
    if (!user.confirmed) {
      return null
    }
    ctx.req.session!.userId = user.id
    return user
  }

  //*  Confirm Email =>
  @Mutation(() => Boolean)
  async confirmEmail(
    @Arg("key") key: string
  ): Promise<boolean> {
    const userID = await redis.get("confirm" + key);
    if (!userID) {
      return false
    }
    await User.update({ id: Number(userID) }, { confirmed: true })
    await redis.del("confirm" + key)
    return true
  }

  //* Forgot Password =>
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return true
    }
    const key = v4();
    await redis.set("forgot" + key, user.id, "EX", 60 * 60 * 24);
    await sendEmail(email, `http://localhost:3000/user/forgot-password/${key}`)
    return true
  }

  //* Update Password =>
  @Mutation(() => User, { nullable: true })
  async updatePassword(
    @Arg("data") data: UpdatePasswordInput,
    @Ctx() ctx: MyContext
  ): Promise<User | null> {
    const userId = await redis.get("forgot" + data.key);
    if (!userId) {
      return null
    }
    const id = Number(userId)
    const user = await User.findOne({ where: { id } });
    if (!user) {
      return null
    }
    await redis.del("forgot" + data.key)
    user.password = await bcryptjs.hash(data.password, 12);
    await user.save();
    ctx.req.session!.userId = user.id
    return user
  }

  //* LogOut =>
  @Mutation(() => Boolean)
  async logOut(
    @Ctx() ctx: MyContext
  ): Promise<boolean> {
    return new Promise((res, rej) => ctx.req.session!.destroy((err) => {
      if (err) {
        return rej(false)
      }
      ctx.res.clearCookie("rafaelsCookie")
      return res(true)
    }))
  }
}