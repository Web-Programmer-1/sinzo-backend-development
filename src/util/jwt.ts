import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";

export const createToken = (
  payload: object,
  secret: Secret,
  expiresIn: string
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};