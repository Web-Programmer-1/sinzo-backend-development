import httpStatus from "http-status";
import { prisma } from "../../shared/Prisma";
import AppError from "../../shared/ApiError";
import { TProductPayload } from "./products.interface";

const createProduct = async (payload: TProductPayload) => {
  const {
    title,
    slug,
    description,
    price,
    stock,
    badge,
    categoryId,
    productCardImage,
    colors,
    sizes,
    sizeType,
    sizeGuideImage,
    sizeGuideData,
    averageRating,
    totalReviews,
    galleryImages,
  } = payload;

  if (!title) {
    throw new AppError(httpStatus.BAD_REQUEST, "Title is required");
  }

  if (!categoryId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Category id is required");
  }

  if (!productCardImage) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Product card image is required"
    );
  }

  if (!price || Number(price) <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Price must be greater than 0");
  }

  const isCategoryExists = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!isCategoryExists) {
    throw new AppError(httpStatus.NOT_FOUND, "Category not found");
  }

  if (slug) {
    const isSlugExists = await prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (isSlugExists) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Product slug already exists"
      );
    }
  }

  const result = await prisma.product.create({
    data: {
      title,
      slug: slug || null,
      description: description || null,
      price: Number(price),
      stock: stock ? Number(stock) : 0,
      badge: badge || null,
      categoryId,
      productCardImage: productCardImage || null ,
      galleryImages: galleryImages || [],
      colors: colors || [],
      sizes: sizes || [],
      sizeType: sizeType || null,
      sizeGuideImage: sizeGuideImage || null,
      sizeGuideData: sizeGuideData ?? null,
      averageRating: averageRating ? Number(averageRating) : 0,
      totalReviews: totalReviews ? Number(totalReviews) : 0,
    },
    include: {
      category: true,
    },
  });

  return result;
};


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

// category title filter
if (query.category) {
  andConditions.push({
    category: {
      title: {
        contains: query.category,
        mode: "insensitive",
      },
    },
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

  // sorting
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

    // card data only
    select: {
      id: true,
      slug: true,
      productCardImage: true,
      title: true,
      price: true,
      badge: true,
      stock: true,
      totalReviews: true,
      category:{
        select:{
          title: true,
          thumbnailImage: true
        }
      }
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
      colors: true,
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















export const ProductServices = {
  createProduct,
  getAllProducts,
  getSingleProduct
};