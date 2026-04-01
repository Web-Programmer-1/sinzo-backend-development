import httpStatus from "http-status";
import { getGuestId } from "../../../helper/guestIdGenerator";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { Request } from "express";

const addToWishlist = async (req: any) => {
  const guestId = getGuestId(req, req.res);
  const { productId } = req.body;

  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product id is required");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const existingWishlist = await prisma.wishlist.findFirst({
    where: {
        guestId,
        productId
    },
  });

  if (existingWishlist) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product already added to wishlist"
    );
  }

  const result = await prisma.wishlist.create({
    data: {
      guestId,
      productId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  });

  return result;
};

const getMyWishlist = async (req: any) => {
  const guestId = getGuestId(req, req.res);

  const result = await prisma.wishlist.findMany({
    where: {
      guestId,
    },
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};

const removeFromWishlist = async (req: any) => {
  const guestId = getGuestId(req, req.res);
  const { wishlistId } = req.params;

  const wishlistItem = await prisma.wishlist.findUnique({
    where: {
      id: wishlistId,
    },
  });

  if (!wishlistItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Wishlist item not found");
  }

  if (wishlistItem.guestId !== guestId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to remove this wishlist item"
    );
  }

  const result = await prisma.wishlist.delete({
    where: {
      id: wishlistId,
    },
  });

  return result;
};

const removeWishlistByProductId = async (req: any) => {
  const guestId = getGuestId(req, req.res);
  const { productId } = req.params;

  const wishlistItem = await prisma.wishlist.findFirst({
     where:{
        guestId,
        productId
     }
  });

  if (!wishlistItem) {
    throw new AppError(httpStatus.NOT_FOUND, "Wishlist item not found");
  }

  const result = await prisma.wishlist.delete({
    where: {
      id: wishlistItem.id,
    },
  });

  return result;
};

const toggleWishlist = async (req: any) => {
  const guestId = getGuestId(req, req.res);
  const { productId } = req.body;

  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product id is required");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

const existingWishlist = await prisma.wishlist.findFirst({
  where: {
    guestId,
    productId,
  },
});


  if (existingWishlist) {
    await prisma.wishlist.delete({
      where: {
        id: existingWishlist.id,
      },
    });

    return {
      action: "REMOVED",
      productId,
      isWishlisted: false,
    };
  }

  await prisma.wishlist.create({
    data: {
      guestId,
      productId,
    },
  });

  return {
    action: "ADDED",
    productId,
    isWishlisted: true,
  };
};

const clearMyWishlist = async (req: any) => {
  const guestId = getGuestId(req, req.res);

  await prisma.wishlist.deleteMany({
    where: {
      guestId,
    },
  });

  return null;
};

const getWishlistCount = async (req: any) => {
  const guestId = getGuestId(req, req.res);

  const count = await prisma.wishlist.count({
    where: {
      guestId,
    },
  });

  return {
    count,
  };
};

export const WishlistService = {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
  removeWishlistByProductId,
  toggleWishlist,
  clearMyWishlist,
  getWishlistCount,
};