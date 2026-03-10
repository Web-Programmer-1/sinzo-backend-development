import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword: string) => {
  return bcrypt.hash(plainPassword, 10);
};

export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};