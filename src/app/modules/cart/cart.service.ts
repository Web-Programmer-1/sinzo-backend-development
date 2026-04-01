import AppError from "../../shared/ApiError";
import { prisma } from "../../shared/Prisma";
import httpStatus from "http-status";


type TUpdateCartPayload = {
  quantity?: number;
  selectedColor?: string | null;
  selectedSize?: string | null;
};

// const addToCart = async (guestId: string, payload: any) => {
//   const { productId, quantity = 1, selectedColor, selectedSize } = payload;

//   if (!productId) {
//     throw new Error("Product ID is required");
//   }

//   if (quantity < 1) {
//     throw new Error("Quantity must be at least 1");
//   }

//   const product = await prisma.product.findUnique({
//     where: { id: productId },
//   });

//   if (!product) {
//     throw new Error("Product not found");
//   }

//   if (product.stock < quantity) {
//     throw new Error("Not enough stock available");
//   }

//   if (
//     selectedColor &&
//     product.colors.length > 0 &&
//     !product.colors.includes(selectedColor)
//   ) {
//     throw new Error("Selected color is invalid");
//   }

//   if (
//     selectedSize &&
//     product.sizes.length > 0 &&
//     !product.sizes.includes(selectedSize)
//   ) {
//     throw new Error("Selected size is invalid");
//   }

//   const existingCartItem = await prisma.cart.findFirst({
//     where: {
//       guestId,
//       productId,
//       selectedColor: selectedColor ?? null,
//       selectedSize: selectedSize ?? null,
//     },
//   });

//   if (existingCartItem) {
//     const newQuantity = existingCartItem.quantity + quantity;

//     if (newQuantity > product.stock) {
//       throw new Error("Quantity exceeds available stock");
//     }

//     const updatedCart = await prisma.cart.update({
//       where: { id: existingCartItem.id },
//       data: {
//         quantity: newQuantity,
//       },
//       include: {
//         product: true,
//       },
//     });

//     return updatedCart;
//   }

//   const cartItem = await prisma.cart.create({
//     data: {
//       guestId,
//       productId,
//       quantity,
//       selectedColor,
//       selectedSize,
//     },
//     include: {
//       product: true,
//     },
//   });

//   return cartItem;
// };



const addToCart = async (guestId: string, payload: any) => {
  const { productId, quantity = 1, selectedColor, selectedSize } = payload;

  if (!guestId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Guest ID is required");
  }

  if (!productId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Product ID is required");
  }

  if (Number(quantity) < 1) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Quantity must be at least 1"
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      stock: true,
      sizes: true,
      colorVariants: true,
    },
  });

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
  }

  if (product.stock < Number(quantity)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Not enough stock available");
  }

  const colorVariants = Array.isArray(product.colorVariants)
    ? (product.colorVariants as { color: string; images: string[] }[])
    : [];

  const availableColors = colorVariants.map((item) => item.color);

  if (
    selectedColor &&
    availableColors.length > 0 &&
    !availableColors.includes(selectedColor)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Selected color is invalid");
  }

  if (
    selectedSize &&
    Array.isArray(product.sizes) &&
    product.sizes.length > 0 &&
    !product.sizes.includes(selectedSize)
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Selected size is invalid");
  }

  const existingCartItem = await prisma.cart.findFirst({
    where: {
      guestId,
      productId,
      selectedColor: selectedColor ?? null,
      selectedSize: selectedSize ?? null,
    },
    select: {
      id: true,
      quantity: true,
    },
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + Number(quantity);

    if (newQuantity > product.stock) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Quantity exceeds available stock"
      );
    }

    const updatedCart = await prisma.cart.update({
      where: { id: existingCartItem.id },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });

    return updatedCart;
  }

  const cartItem = await prisma.cart.create({
    data: {
      guestId,
      productId,
      quantity: Number(quantity),
      selectedColor: selectedColor ?? null,
      selectedSize: selectedSize ?? null,
    },
    include: {
      product: true,
    },
  });

  return cartItem;
};






const getMyCart = async (guestId: string) => {
  const cartItems = await prisma.cart.findMany({
    where: { guestId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          price: true,
          productCardImage: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items: cartItems,
    summary: {
      subtotal,
      totalItems,
      totalUniqueItems: cartItems.length,
    },
  };
};

// const updateCartItem = async (
//   guestId: string,
//   cartId: string,
//   payload: any
// ) => {
//   const { quantity, selectedColor, selectedSize } = payload;

//   const existingCart = await prisma.cart.findFirst({
//     where: {
//       id: cartId,
//       guestId,
//     },
//     include: {
//       product: true,
//     },
//   });

//   if (!existingCart) {
//     throw new Error("Cart item not found");
//   }

//   const updateData: any = {};

//   if (quantity !== undefined) {
//     if (Number(quantity) < 1) {
//       throw new Error("Quantity must be at least 1");
//     }

//     if (Number(quantity) > existingCart.product.stock) {
//       throw new Error("Quantity exceeds available stock");
//     }

//     updateData.quantity = Number(quantity);
//   }

//   if (selectedColor !== undefined) {
//     if (
//       selectedColor &&
//       existingCart.product.colors.length > 0 &&
//       !existingCart.product.colors.includes(selectedColor)
//     ) {
//       throw new Error("Selected color is invalid");
//     }

//     updateData.selectedColor = selectedColor;
//   }

//   if (selectedSize !== undefined) {
//     if (
//       selectedSize &&
//       existingCart.product.sizes.length > 0 &&
//       !existingCart.product.sizes.includes(selectedSize)
//     ) {
//       throw new Error("Selected size is invalid");
//     }

//     updateData.selectedSize = selectedSize;
//   }

//   const updated = await prisma.cart.update({
//     where: { id: cartId },
//     data: updateData,
//     include: {
//       product: true,
//     },
//   });

//   return updated;
// };






const updateCartItem = async (
  guestId: string,
  cartId: string,
  payload: TUpdateCartPayload
) => {
  const { quantity, selectedColor, selectedSize } = payload;

  const existingCart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      guestId,
    },
    select: {
      id: true,
      quantity: true,
      selectedColor: true,
      selectedSize: true,
      product: {
        select: {
          id: true,
          stock: true,
          sizes: true,
          colorVariants: true,
        },
      },
    },
  });

  if (!existingCart) {
    throw new AppError(httpStatus.NOT_FOUND, "Cart item not found");
  }

  const colorVariants = Array.isArray(existingCart.product.colorVariants)
    ? (existingCart.product.colorVariants as { color: string; images: string[] }[])
    : [];

  const availableColors = colorVariants.map((item) => item.color);

  const updateData: Record<string, any> = {};

  if (quantity !== undefined) {
    if (Number(quantity) < 1) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Quantity must be at least 1"
      );
    }

    if (Number(quantity) > existingCart.product.stock) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Quantity exceeds available stock"
      );
    }

    updateData.quantity = Number(quantity);
  }

  if (selectedColor !== undefined) {
    if (
      selectedColor &&
      availableColors.length > 0 &&
      !availableColors.includes(selectedColor)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Selected color is invalid");
    }

    updateData.selectedColor = selectedColor ?? null;
  }

  if (selectedSize !== undefined) {
    if (
      selectedSize &&
      Array.isArray(existingCart.product.sizes) &&
      existingCart.product.sizes.length > 0 &&
      !existingCart.product.sizes.includes(selectedSize)
    ) {
      throw new AppError(httpStatus.BAD_REQUEST, "Selected size is invalid");
    }

    updateData.selectedSize = selectedSize ?? null;
  }

  const updated = await prisma.cart.update({
    where: { id: cartId },
    data: updateData,
    include: {
      product: true,
    },
  });

  return updated;
};







const removeCartItem = async (guestId: string, cartId: string) => {
  const existingCart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      guestId,
    },
  });

  if (!existingCart) {
    throw new Error("Cart item not found");
  }

  await prisma.cart.delete({
    where: { id: cartId },
  });

  return null;
};

const clearMyCart = async (guestId: string) => {
  await prisma.cart.deleteMany({
    where: { guestId },
  });

  return null;
};

export const CartService = {
  addToCart,
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearMyCart,
};