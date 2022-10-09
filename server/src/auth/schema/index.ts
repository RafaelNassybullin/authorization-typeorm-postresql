import { Field, Int, ObjectType, Root } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
@ObjectType()
export class User extends BaseEntity {

  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => String)
  @Column()
  firstname: string;

  @Field(() => String)
  @Column()
  lastname: string;

  @Field(() => String)
  @Column("text", { unique: true })
  email: string;

  @Field(() => String)
  name(@Root() parent: User): string {
    return `${parent.firstname} ${parent.lastname}`
  }

  @Column()
  password: string;

  @Field(() => Boolean)
  @Column("bool", { default: false })
  confirmed: boolean;
}