// express request object
declare module "express-serve-static-core" {
  interface Request {
    uid?: string;
  }
}