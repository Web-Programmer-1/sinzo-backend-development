import httpStatus from "http-status";
import { prisma } from "../../shared/Prisma";
import AppError from "../../shared/ApiError";
import {  TProductPayload } from "./products.interface";












const PRODUCT_COLORS = [
  "BLACK",
  "WHITE",
  "BLUE",
  "RED",
  "GREEN",
  "YELLOW",
  "GRAY",
  "BROWN",
  "NAVY",
  "PINK",
  "PURPLE",
  "ORANGE",
] as const;

const validateColorVariants = (colorVariants: any) => {
  if (!colorVariants) return [];

  if (!Array.isArray(colorVariants)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "colorVariants must be an array"
    );
  }

  const formattedVariants = colorVariants.map((item: any) => {
    if (!item?.color) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Each color variant must have a color"
      );
    }

    if (!PRODUCT_COLORS.includes(item.color)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Invalid color: ${item.color}`
      );
    }

    if (!Array.isArray(item.images) || item.images.length === 0) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Images are required for color ${item.color}`
      );
    }

    return {
      color: item.color,
      images: item.images,
    };
  });

  return formattedVariants;
};

const createProduct = async (payload: TProductPayload) => {
  const {
    title,
    slug,
    description,
    cardShortTitle,
    price,
    stock,
    badge,
    categoryId,
    productCardImage,
    colorVariants,
    sizes,
    sizeType,
    sizeGuideImage,
    sizeGuideData,
    averageRating,
    totalReviews,
    galleryImages,
  } = payload;

  if (!title || !categoryId || !productCardImage || !price || Number(price) <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      !title
        ? "Title is required"
        : !categoryId
        ? "Category id is required"
        : !productCardImage
        ? "Product card image is required"
        : "Price must be greater than 0"
    );
  }

  const validatedColorVariants = validateColorVariants(colorVariants);

  const [category, existingSlug] = await Promise.all([
    prisma.category.findUnique({
      where: { id: categoryId },
      select: { id: true },
    }),
    slug
      ? prisma.product.findUnique({
          where: { slug },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (existingSlug) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
  }

  const result = await prisma.product.create({
    data: {
      title: title.trim(),
      slug: slug?.trim() || null,
      description: description?.trim() || null,
      cardShortTitle: cardShortTitle?.trim() || null,
      price: Number(price),
      stock: stock ? Number(stock) : 0,
      badge: badge || null,
      categoryId,
      productCardImage,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      colorVariants: validatedColorVariants || null,
      sizes: Array.isArray(sizes) ? sizes : [],
      sizeType: sizeType || null,
      sizeGuideImage: sizeGuideImage || null,
      sizeGuideData: sizeGuideData ?? null,
      averageRating: averageRating ? Number(averageRating) : 0,
      totalReviews: totalReviews ? Number(totalReviews) : 0,
    },
    include: {
      category: {
        select: {
          id: true,
          title: true,
          thumbnailImage: true,
        },
      },
    },
  });

  return result;
};














// const createProduct = async (payload: TProductPayload) => {
//   const {
//     title,
//     slug,
//     description,
//     cardShortTitle,
//     price,
//     stock,
//     badge,
//     categoryId,
//     productCardImage,
//     colors,
//     sizes,
//     sizeType,
//     sizeGuideImage,
//     sizeGuideData,
//     averageRating,
//     totalReviews,
//     galleryImages,
//   } = payload;

//   // ✅ Step 1: সব field validation একসাথে — কোনো DB call নেই
//   if (!title || !categoryId || !productCardImage || !price || Number(price) <= 0) {
//     throw new AppError(
//       httpStatus.BAD_REQUEST,
//       !title
//         ? "Title is required"
//         : !categoryId
//           ? "Category id is required"
//           : !productCardImage
//             ? "Product card image is required"
//             : "Price must be greater than 0"
//     );
//   }

//   // ✅ Step 2: Category + Slug check একসাথে parallel — 2 query → 1 round trip
//   const [category, existingSlug] = await Promise.all([
//     prisma.category.findUnique({
//       where: { id: categoryId },
//       select: { id: true }, // ✅ শুধু id দরকার, সব field আনার দরকার নেই
//     }),
//     slug
//       ? prisma.product.findUnique({
//           where: { slug },
//           select: { id: true }, // ✅ শুধু id দরকার
//         })
//       : Promise.resolve(null),
//   ]);

//   if (!category) {
//     throw new AppError(httpStatus.NOT_FOUND, "Category not found");
//   }

//   if (existingSlug) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
//   }

//   // ✅ Step 3: Product create
//   const result = await prisma.product.create({
//     data: {
//       title,
//       slug: slug || null,
//       description: description || null,
//       price: Number(price),
//       cardShortTitle:String(cardShortTitle) || null,
//       stock: stock ? Number(stock) : 0,
//       badge: badge || null,
//       categoryId,
//       productCardImage,
//       galleryImages: galleryImages || [],
      
//       sizes: sizes || [],
//       sizeType: sizeType || null,
//       sizeGuideImage: sizeGuideImage || null,
//       sizeGuideData: sizeGuideData ?? null,
//       averageRating: averageRating ? Number(averageRating) : 0,
//       totalReviews: totalReviews ? Number(totalReviews) : 0,
//     },
//     include: {
//       category: {
//         select: { id: true,
//          title: true,
//           thumbnailImage: true,
//            },
//       },
//     },
//   });

//   return result;
// };
















const getAllProducts = async (query: any) => {
  const {
    searchTerm,
    minPrice,
    maxPrice,
    categoryId,
    size,
    color,
    sort,
    page = 1,
    limit = 12,
  } = query;

  const andConditions: any[] = [];

  // search title
  if (searchTerm) {
    andConditions.push({
      title: {
        contains: searchTerm,
        mode: "insensitive",
      },
    });
  }

  // categoryId filter
  if (categoryId) {
    andConditions.push({
      categoryId: categoryId,
    });
  }

  // price range
  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        gte: minPrice ? Number(minPrice) : undefined,
        lte: maxPrice ? Number(maxPrice) : undefined,
      },
    });
  }

  // size filter
  if (size) {
    andConditions.push({
      sizes: {
        has: size,
      },
    });
  }

  // color filter
  if (color) {
    andConditions.push({
      colors: {
        has: color,
      },
    });
  }

  const whereConditions = andConditions.length ? { AND: andConditions } : {};

  let orderBy: any = { createdAt: "desc" };

  if (sort === "oldest") {
    orderBy = { createdAt: "asc" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const products = await prisma.product.findMany({
    where: whereConditions,
    orderBy,
    skip,
    take: Number(limit),
    select: {
      id: true,
      slug: true,
      productCardImage: true,
      title: true,
      price: true,
      cardShortTitle:true,
      badge: true,
      stock: true,
      description:true,
      totalReviews: true,
      category: {
        select: {
          title: true,
          thumbnailImage: true,
        },
      },
    },
  });

  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: products,
  };
};



const getSingleProduct = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: {
      slug,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      price: true,
      stock: true,
      badge: true,
      productCardImage: true,
      galleryImages: true,
      colorVariants: true,
      sizes: true,
      sizeType: true,
      sizeGuideImage: true,
      sizeGuideData: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
      updatedAt: true,
      category: {
        select: {
          id: true,
          title: true,
          thumbnailImage: true,
        },
      },
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.category.id,
      NOT: {
        id: product.id,
      },
    },
    take: 4,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      slug: true,
      productCardImage: true,
      title: true,
      price: true,
      badge: true,
      stock: true,
      totalReviews: true,
    },
  });

  return {
    ...product,
    relatedProducts,
  };
};









// const updateProduct = async (id: string, payload: Partial<TProductPayload>) => {
//   const existingProduct = await prisma.product.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       slug: true,
//       categoryId: true,
//     },
//   });

//   if (!existingProduct) {
//     throw new AppError(httpStatus.NOT_FOUND, "Product not found");
//   }

//   if (payload.categoryId) {
//     const category = await prisma.category.findUnique({
//       where: { id: payload.categoryId },
//       select: { id: true },
//     });

//     if (!category) {
//       throw new AppError(httpStatus.NOT_FOUND, "Category not found");
//     }
//   }

//   if (payload.slug && payload.slug !== existingProduct.slug) {
//     const existingSlug = await prisma.product.findUnique({
//       where: { slug: payload.slug },
//       select: { id: true },
//     });

//     if (existingSlug) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
//     }
//   }

//   if (payload.price !== undefined && Number(payload.price) <= 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Price must be greater than 0");
//   }

//   if (payload.stock !== undefined && Number(payload.stock) < 0) {
//     throw new AppError(httpStatus.BAD_REQUEST, "Stock cannot be negative");
//   }

//   const result = await prisma.product.update({
//     where: { id },
//     data: {
//       title: payload.title ?? undefined,
//       slug: payload.slug ?? undefined,
//       description: payload.description ?? undefined,
//       price: payload.price !== undefined ? Number(payload.price) : undefined,
//       stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
//       badge: payload.badge ?? undefined,
//       categoryId: payload.categoryId ?? undefined,
//       productCardImage: payload.productCardImage ?? undefined,
//       galleryImages: payload.galleryImages ?? undefined,
//       colorVariants:
//       sizes: payload.sizes ?? undefined,
//       sizeType: payload.sizeType ?? undefined,
//       sizeGuideImage: payload.sizeGuideImage ?? undefined,
//       sizeGuideData:
//         payload.sizeGuideData !== undefined ? payload.sizeGuideData : undefined,
//       averageRating:
//         payload.averageRating !== undefined
//           ? Number(payload.averageRating)
//           : undefined,
//       totalReviews:
//         payload.totalReviews !== undefined
//           ? Number(payload.totalReviews)
//           : undefined,
//     },
//     include: {
//       category: {
//         select: {
//           id: true,
//           title: true,
//           thumbnailImage: true,
//         },
//       },
//     },
//   });

//   return result;
// };









const updateProduct = async (id: string, payload: Partial<TProductPayload>) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      categoryId: true,
    },
  });

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  const validatedColorVariants = validateColorVariants(payload.colorVariants);

  const [category, existingSlug] = await Promise.all([
    payload.categoryId
      ? prisma.category.findUnique({
          where: { id: payload.categoryId },
          select: { id: true },
        })
      : Promise.resolve(null),

    payload.slug && payload.slug !== existingProduct.slug
      ? prisma.product.findUnique({
          where: { slug: payload.slug },
          select: { id: true },
        })
      : Promise.resolve(null),
  ]);

  if (payload.categoryId && !category) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (existingSlug) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product slug already exists");
  }

  if (payload.price !== undefined && Number(payload.price) <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Price must be greater than 0");
  }

  if (payload.stock !== undefined && Number(payload.stock) < 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Stock cannot be negative");
  }

  const result = await prisma.product.update({
    where: { id },
    data: {
      title: payload.title !== undefined ? payload.title.trim() : undefined,
      slug: payload.slug !== undefined ? payload.slug.trim() || null : undefined,
      description:
        payload.description !== undefined
          ? payload.description.trim() || null
          : undefined,
      cardShortTitle:
        payload.cardShortTitle !== undefined
          ? payload.cardShortTitle.trim() || null
          : undefined,
      price: payload.price !== undefined ? Number(payload.price) : undefined,
      stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
      badge: payload.badge ?? undefined,
      categoryId: payload.categoryId ?? undefined,
      productCardImage: payload.productCardImage ?? undefined,
      galleryImages:
        payload.galleryImages !== undefined
          ? Array.isArray(payload.galleryImages)
            ? payload.galleryImages
            : []
          : undefined,
      colorVariants: validatedColorVariants,
      sizes:
        payload.sizes !== undefined
          ? Array.isArray(payload.sizes)
            ? payload.sizes
            : []
          : undefined,
      sizeType: payload.sizeType !== undefined ? payload.sizeType || null : undefined,
      sizeGuideImage:
        payload.sizeGuideImage !== undefined
          ? payload.sizeGuideImage || null
          : undefined,
      sizeGuideData:
        payload.sizeGuideData !== undefined ? payload.sizeGuideData : undefined,
      averageRating:
        payload.averageRating !== undefined
          ? Number(payload.averageRating)
          : undefined,
      totalReviews:
        payload.totalReviews !== undefined
          ? Number(payload.totalReviews)
          : undefined,
    },
    include: {
      category: {
        select: {
          id: true,
          title: true,
          thumbnailImage: true,
        },
      },
    },
  });

  return result;
};








const deleteProduct = async (id: string) => {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: { id: true, title: true },
  });

  if (!existingProduct) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  await prisma.product.delete({
    where: { id },
  });

  return existingProduct;
};







const getRelatedProducts = async (
  productId: string,
  limit: number = 8
) => {
  const parsedLimit = Number(limit) || 8;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      categoryId: true,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  // Step 1: same category related products
  const sameCategoryProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: {
        not: productId,
      },
    },
    select: {
      id: true,
      title: true,
      cardShortTitle: true,
      slug: true,
      productCardImage: true,
      price: true,
      stock: true,
      badge: true,
      galleryImages: true,
      averageRating: true,
      totalReviews: true,
      createdAt: true,
      category: {
        select: {
          id: true,
          title: true,
          thumbnailImage: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
    ],
    take: parsedLimit,
  });

  // Step 2: if not enough, fill with other products
  if (sameCategoryProducts.length < parsedLimit) {
    const remaining = parsedLimit - sameCategoryProducts.length;

    const existingIds = sameCategoryProducts.map((item) => item.id);

    const fallbackProducts = await prisma.product.findMany({
      where: {
        id: {
          notIn: [productId, ...existingIds],
        },
      },
      select: {
        id: true,
        title: true,
        cardShortTitle: true,
        slug: true,
        productCardImage: true,
        price: true,
        stock: true,
        badge: true,
        galleryImages: true,
        averageRating: true,
        totalReviews: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            title: true,
            thumbnailImage: true,
          },
        },
      },
      orderBy: [
        { createdAt: "desc" },
      ],
      take: remaining,
    });

    return [...sameCategoryProducts, ...fallbackProducts];
  }

  return sameCategoryProducts;
};





export const ProductServices = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
};