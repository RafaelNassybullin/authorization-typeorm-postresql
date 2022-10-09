import { Field, InputType } from "type-graphql"
import { IsEmail, Length, MinLength } from "class-validator"

@InputType()
export class RegisterInput {
  @Field()
  @Length(1, 255)
  firstname: string

  @Field()
  @Length(1, 255)
  lastname: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  @MinLength(5)
  password: string
}

@InputType()
export class UpdatePasswordInput {
  @Field()
  key: string

  @MinLength(5)
  @Field()
  password: string
}