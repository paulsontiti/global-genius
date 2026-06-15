
import { IUseCase } from "../../../../../services/identity/domain/usecases/iusecase";
import { LoginUserInputDTO } from "../../../../../services/identity/domain/dtos/login";
import { FastifyReply, FastifyRequest } from "fastify";
import { LoginUserResponseDTO } from "../../../../../services/identity/domain/dtos/auth-response";

export type LoginRequest = FastifyRequest<{
  Body: LoginUserInputDTO;
}>;

export class LoginController {
  constructor(private loginUserUseCase: IUseCase<LoginUserInputDTO,LoginUserResponseDTO>) {}

    async handle(
     request: LoginRequest,
     reply: FastifyReply
   ) {
       const result =
       await this.loginUserUseCase.execute(
         request.body 
       );
 
     return reply.code(201).send(result);
    
   }
}
