import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput } from "@global-genius/database/src/repositories/types/create-user";
import { IUseCase } from "../../../../../services/identity/domain/usecases/iusecase";
import { ReturnedDBUser } from "@global-genius/database";
import { registerSchema } from "../schemas/register.schema";

export type RegisterRequest = FastifyRequest<{
  Body: CreateUserInput;
}>;

export class RegisterController {
  constructor(
    private registerUserUseCase: IUseCase<CreateUserInput, ReturnedDBUser>,
  ) {}

  async handle(request: RegisterRequest, reply: FastifyReply) {
      const result = await this.registerUserUseCase.execute(request.body);

      return reply.code(201).send(result);
   
  }
}
