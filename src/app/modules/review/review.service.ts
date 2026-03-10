import httpStatus from "http-status";
import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import { TCreateReviewPayload } from "./review.interface";

const createReview = async (
  userId: string,
  payload: TCreateReviewPayload
) => {
  const { productId, rating, comment } = payload;

  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product id is required");
  }

  if (!rating) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating is required");
  }

  if (Number(rating) < 1 || Number(rating) > 5) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 to 5");
  }

  const isUserExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!isUserExists) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isProductExists = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!isProductExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const isAlreadyReviewed = await prisma.review.findFirst({
    where: {
      userId,
      productId,
    },
  });

  if (isAlreadyReviewed) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have already reviewed this product"
    );
  }

  const result = await prisma.review.create({
    data: {
      userId,
      productId,
      rating: Number(rating),
      comment: comment || null,
      replies: [],
      reactions: {
        like: 0,
        love: 0,
        care: 0,
        haha: 0,
        users: [],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  // update product review summary
  const reviewStats = await prisma.review.aggregate({
    where: {
      productId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id || 0,
    },
  });

  return result;
};



const getReviewsByProduct = async (
  productId: string,
  query: { sort?: string }
) => {
  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product id is required");
  }

  const orderBy: any =
    query?.sort === "oldest"
      ? { createdAt: "asc" }
      : { createdAt: "desc" };

  const reviews = await prisma.review.findMany({
    where: {
      productId,
    },
    orderBy,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
    },
  });

  return reviews;
};



const updateReview = async (
  reviewId: string,
  userId: string,
  payload: any
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  const action = payload?.action;

  // 1) ADD REPLY
  if (action === "ADD_REPLY") {
    if (!payload.message) {
      throw new AppError(httpStatus.BAD_REQUEST, "Reply message is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        profileImage: true,
      },
    });

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const previousReplies = Array.isArray(review.replies) ? review.replies : [];

    const newReply = {
      replyId: `reply_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userImage: user.profileImage,
      message: payload.message,
      createdAt: new Date().toISOString(),
    };

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        replies: [...previousReplies, newReply],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return updatedReview;
  }

  // 2) REACTION TOGGLE
  if (action === "REACTION") {
    const reactionType = payload?.reactionType;

    if (!reactionType) {
      throw new AppError(httpStatus.BAD_REQUEST, "Reaction type is required");
    }

    const allowedReactions = ["LIKE", "LOVE", "CARE", "HAHA"];

    if (!allowedReactions.includes(reactionType)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid reaction type");
    }

    const previousReactions =
      review.reactions && typeof review.reactions === "object"
        ? (review.reactions as any)
        : {
            like: 0,
            love: 0,
            care: 0,
            haha: 0,
            users: [],
          };

    const users = Array.isArray(previousReactions.users)
      ? [...previousReactions.users]
      : [];

    const existingUserReactionIndex = users.findIndex(
      (item: any) => item.userId === userId
    );

    const keyMap: Record<string, string> = {
      LIKE: "like",
      LOVE: "love",
      CARE: "care",
      HAHA: "haha",
    };

    const reactionKey = keyMap[reactionType];

    if (existingUserReactionIndex !== -1) {
      const existingReaction = users[existingUserReactionIndex];

      // same reaction দিলে remove হবে
      if (existingReaction.type === reactionType) {
        previousReactions[reactionKey] = Math.max(
          0,
          (previousReactions[reactionKey] || 0) - 1
        );

        users.splice(existingUserReactionIndex, 1);
      } else {
        const oldReactionKey = keyMap[existingReaction.type];

        previousReactions[oldReactionKey] = Math.max(
          0,
          (previousReactions[oldReactionKey] || 0) - 1
        );

        previousReactions[reactionKey] =
          (previousReactions[reactionKey] || 0) + 1;

        users[existingUserReactionIndex] = {
          userId,
          type: reactionType,
        };
      }
    } else {
      previousReactions[reactionKey] = (previousReactions[reactionKey] || 0) + 1;

      users.push({
        userId,
        type: reactionType,
      });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        reactions: {
          ...previousReactions,
          users,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return updatedReview;
  }

  // 3) NORMAL REVIEW UPDATE
  if (review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to update this review"
    );
  }

  if (
    payload.rating !== undefined &&
    (Number(payload.rating) < 1 || Number(payload.rating) > 5)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rating must be between 1 to 5");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating:
        payload.rating !== undefined ? Number(payload.rating) : review.rating,
      comment:
        payload.comment !== undefined ? payload.comment : review.comment,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  // product review summary update
  const reviewStats = await prisma.review.aggregate({
    where: {
      productId: review.productId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id || 0,
    },
  });

  return updatedReview;
};




const deleteReview = async (reviewId: string, userId: string, role: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(httpStatus.NOT_FOUND, "Review not found");
  }

  // user নিজের review delete করতে পারবে
  if (role !== "ADMIN" && review.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this review"
    );
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // product review summary update
  const reviewStats = await prisma.review.aggregate({
    where: {
      productId: review.productId,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: reviewStats._avg.rating || 0,
      totalReviews: reviewStats._count.id || 0,
    },
  });

  return null;
};






export const ReviewServices = {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
};