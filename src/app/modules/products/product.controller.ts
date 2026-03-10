import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as {
    [fieldname: string]: Express.MulterS3.File[];
  };

  const productCardImage = files?.productCardImage?.[0]?.location || null;

  const galleryImages =
    files?.galleryImages?.map((file) => file.location) || [];

  const sizeGuideImage = files?.sizeGuideImage?.[0]?.location || null;

  const payload = {
    ...req.body,
    price: Number(req.body.price),
    stock: req.body.stock ? Number(req.body.stock) : 0,
    colors: req.body.colors ? JSON.parse(req.body.colors) : [],
    sizes: req.body.sizes ? JSON.parse(req.body.sizes) : [],
    sizeGuideData: req.body.sizeGuideData
      ? JSON.parse(req.body.sizeGuideData)
      : null,
    productCardImage,
    galleryImages,
    sizeGuideImage,
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




export const ProductControllers = {
  createProduct,
  getAllProducts,
  getSingleProduct
};