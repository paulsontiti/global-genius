import type { UserRole } from "../generated/prisma/enums.js";

export { prisma } from "./client.js";


export type { User, Session,UserRole } from "../generated/prisma/client.js";



export {PrismaUserRepository} from "./repositories/user.js"
export {PrismaLoginRepository} from "./repositories/login.js"
export {PrismaRegisterRepository} from "./repositories/register.js"
export {PrismaSessionRepository} from "./repositories/session.js"
export type {ISessionRepository} from "./repositories/interfaces/isession.js"
export type {ILoginRepository} from "./repositories/interfaces/ilogin.js"
export type {IRegisterRepository} from "./repositories/interfaces/iregister.js"
export type {IUserRepository} from "./repositories/interfaces/iuser.js"
export type ReturnedDBUser = {
    id:string,
    email:string,role:UserRole,createdAt:Date
}