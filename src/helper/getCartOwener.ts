import { Request, Response } from "express";
import crypto from "crypto";

export const getCartOwner = (req: Request, res: Response) => {
  const user = (req as any).user;

  if (user?.userId) {
    return {
      userId: user.userId,
      guestId: null,
    };
  }

  let guestId = req.cookies?.guest_cart_id;

  if (!guestId) {
    guestId = crypto.randomUUID();

    res.cookie("guest_cart_id", guestId, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 30,
    });
  }

  return {
    userId: null,
    guestId,
  };
};