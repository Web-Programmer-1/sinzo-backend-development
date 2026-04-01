import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProductServices } from "./product.service";
import AppError from "../../shared/ApiError";

// const createProduct = catchAsync(async (req: Request, res: Response) => {
//   const files = req.files as {
//     [fieldname: string]: Express.MulterS3.File[];
//   };

//   const productCardImage = files?.productCardImage?.[0]?.location || null;

//   const galleryImages =
//     files?.galleryImages?.map((file) => file.location) || [];

//   const sizeGuideImage = files?.sizeGuideImage?.[0]?.location || null;

//   const payload = {
//     ...req.body,
//     price: Number(req.body.price),
//     stock: req.body.stock ? Number(req.body.stock) : 0,
//     colors: req.body.colors ? JSON.parse(req.body.colors) : [],
//     sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
//     sizeGuideData: req.body.sizeGuideData
//       ? JSON.parse(req.body.sizeGuideData)
//       : null,
//     productCardImage,
//     galleryImages,
//     sizeGuideImage,
//   };

//   const result = await ProductServices.createProduct(payload);

//   sendResponse(res, {
//     statusCode: httpStatus.CREATED,
//     success: true,
//     message: "Product created successfully",
//     data: result,
//   });
// });




const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.MulterS3.File[];
  };

  const productCardImage = files?.productCardImage?.[0]?.location || null;
  const galleryImages =
    files?.galleryImages?.map((file) => file.location) || [];
  const sizeGuideImage = files?.sizeGuideImage?.[0]?.location || null;

  const parsedColorVariants = req.body.colorVariants
    ? JSON.parse(req.body.colorVariants)
    : [];

const colorVariants = Array.isArray(parsedColorVariants)
  ? parsedColorVariants.map((variant: any) => {
      if (!variant?.color) {
        throw new Error("Color is required in colorVariants");
      }

      const colorKey = `colorImages_${variant.color}`;
      const colorFiles = files?.[colorKey] || [];

      return {
        color: variant.color,
        images: colorFiles.map((file) => file.location),
      };
    })
  : [];

  const payload = {
    ...req.body,
    price: Number(req.body.price),
    stock: req.body.stock ? Number(req.body.stock) : 0,
    sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
    sizeGuideData: req.body.sizeGuideData
      ? JSON.parse(req.body.sizeGuideData)
      : null,
    productCardImage,
    galleryImages,
    sizeGuideImage,
    colorVariants,
  };

  const result = await ProductServices.createProduct(payload);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Product created successfully",
    data: result,
  });
});







const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getAllProducts(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Products fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});





const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getSingleProduct(req.params.slug as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product details fetched successfully",
    data: result,
  });
});








// const updateProduct = catchAsync(async (req: Request, res: Response) => {
//   const files = req.files as {
//     [fieldname: string]: Express.MulterS3.File[];
//   };

//   const productCardImage = files?.productCardImage?.[0]?.location;
//   const galleryImages = files?.galleryImages?.map((file) => file.location);
//   const sizeGuideImage = files?.sizeGuideImage?.[0]?.location;

//   const payload: any = {
//     ...req.body,
//   };

//   if (req.body.price !== undefined) {
//     payload.price = Number(req.body.price);
//   }

//   if (req.body.stock !== undefined) {
//     payload.stock = Number(req.body.stock);
//   }

//   if (req.body.averageRating !== undefined) {
//     payload.averageRating = Number(req.body.averageRating);
//   }

//   if (req.body.totalReviews !== undefined) {
//     payload.totalReviews = Number(req.body.totalReviews);
//   }

//   if (req.body.colors) {
//     payload.colors = JSON.parse(req.body.colors);
//   }

//   if (req.body.sizes) {
//     payload.sizes = JSON.parse(req.body.sizes);
//   }

//   if (req.body.sizeGuideData) {
//     payload.sizeGuideData = JSON.parse(req.body.sizeGuideData);
//   }

//   if (productCardImage) {
//     payload.productCardImage = productCardImage;
//   }

//   if (galleryImages && galleryImages.length) {
//     payload.galleryImages = galleryImages;
//   }

//   if (sizeGuideImage) {
//     payload.sizeGuideImage = sizeGuideImage;
//   }

//   const result = await ProductServices.updateProduct(req.params.id as string, payload);

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Product updated successfully",
//     data: result,
//   });
// });





const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.MulterS3.File[];
  };

  const productCardImage = files?.productCardImage?.[0]?.location;
  const galleryImages = files?.galleryImages?.map((file) => file.location);
  const sizeGuideImage = files?.sizeGuideImage?.[0]?.location;

  const payload: any = {
    ...req.body,
  };

  if (req.body.price !== undefined) {
    payload.price = Number(req.body.price);
  }

  if (req.body.stock !== undefined) {
    payload.stock = Number(req.body.stock);
  }

  if (req.body.averageRating !== undefined) {
    payload.averageRating = Number(req.body.averageRating);
  }

  if (req.body.totalReviews !== undefined) {
    payload.totalReviews = Number(req.body.totalReviews);
  }

  if (req.body.sizes !== undefined) {
    payload.sizes = req.body.sizes ? JSON.parse(req.body.sizes) : [];
  }

  if (req.body.sizeGuideData !== undefined) {
    payload.sizeGuideData = req.body.sizeGuideData
      ? JSON.parse(req.body.sizeGuideData)
      : null;
  }

  if (req.body.colorVariants !== undefined) {
    const parsedColorVariants = req.body.colorVariants
      ? JSON.parse(req.body.colorVariants)
      : [];

    payload.colorVariants = Array.isArray(parsedColorVariants)
      ? parsedColorVariants.map((variant: any) => {
          if (!variant?.color) {
            throw new AppError(
              httpStatus.BAD_REQUEST,
              "Each color variant must have a color"
            );
          }

          const colorKey = `colorImages_${variant.color}`;
          const colorFiles = files?.[colorKey] || [];

          return {
            color: variant.color,
            images: colorFiles.map((file) => file.location),
          };
        })
      : [];
  }

  if (productCardImage) {
    payload.productCardImage = productCardImage;
  }

  if (galleryImages && galleryImages.length) {
    payload.galleryImages = galleryImages;
  }

  if (sizeGuideImage) {
    payload.sizeGuideImage = sizeGuideImage;
  }

  const result = await ProductServices.updateProduct(
    req.params.id as string,
    payload
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product updated successfully",
    data: result,
  });
});





const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.deleteProduct(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
});

const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const limit = Number(req.query.limit) || 8;

  const result = await ProductServices.getRelatedProducts(productId as string, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Related products fetched successfully",
    data: result,
  });
});



export const ProductControllers = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
};