




import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../shared/ApiError";
import { verifyToken } from "../../util/jwt";
import { prisma } from "../shared/Prisma";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const authGuard =
  (...requiredRoles: string[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader;

      const cookieToken = req.cookies?.accessToken;

      const token = bearerToken || cookieToken;

      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const decoded = verifyToken(
        token,
        process.env.JWT_ACCESS_SECRET as string
      ) as {
        userId: string;
        role: string;
      };

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });

      if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      if (user.status === "BLOCKED") {
        throw new AppError(httpStatus.FORBIDDEN, "User is blocked");
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not permitted to access this route"
        );
      }

      req.user = {
        userId: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

export default authGuard;