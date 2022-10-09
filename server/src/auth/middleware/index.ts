import { MyContext } from "../../interfaces"
import { MiddlewareFn } from "type-graphql"

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!context.req.session!.userId) throw Error("not authentificated")
  return next()
}