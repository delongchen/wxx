import {Middleware} from "../types";
import sharingBaseInfoMiddlewares from "./base-info";


export default [
  ...sharingBaseInfoMiddlewares,
] as Middleware<any>[]
