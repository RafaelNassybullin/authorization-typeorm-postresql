import { MyContext } from "../../../interfaces";
import { Query, Resolver, Ctx, Authorized, UseMiddleware } from "type-graphql";
import { isAuth } from "../../../auth/middleware";

@Resolver()
export class HelloResolver {

  @Query(() => String, { name: "hello", nullable: true })
  async hello(@Ctx() ctx: MyContext): Promise<string | undefined> {
    if (!ctx.req.session!.userId) {
      return undefined
    }
    return "Hello Rafael"
  }

  @Authorized()
  @Query(() => String, { name: "me", nullable: true })
  async me() {
    return "Authorized decorator work!"
  }

  @UseMiddleware(isAuth)
  @Query(() => String, { name: "me2", nullable: true })
  async me2() {
    return "My custom middleware work!"
  }
}