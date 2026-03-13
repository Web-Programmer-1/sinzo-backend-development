import { prisma } from "../../shared/Prisma";


const addToCart = async (userId: string, payload: any) => {
  const { productId, quantity = 1, selectedColor, selectedSize } = payload;

  if (!productId) {
    throw new Error("Product ID is required");
  }

  if (quantity < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error("Not enough stock available");
  }

  // validate selected color
  if (selectedColor && product.colors.length > 0 && !product.colors.includes(selectedColor)) {
    throw new Error("Selected color is invalid");
  }

  // validate selected size
  if (selectedSize && product.sizes.length > 0 && !product.sizes.includes(selectedSize)) {
    throw new Error("Selected size is invalid");
  }

  // same product + same variant already exists?
  const existingCartItem = await prisma.cart.findFirst({
    where: {
      userId,
      productId,
      selectedColor: selectedColor ?? null,
      selectedSize: selectedSize ?? null,
    },
  });

  if (existingCartItem) {
    const newQuantity = existingCartItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new Error("Quantity exceeds available stock");
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
      userId,
      productId,
      quantity,
      selectedColor,
      selectedSize,
    },
    include: {
      product: true,
    },
  });

  return cartItem;
};

const getMyCart = async (userId: string) => {
  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select:{
            id:true,
            title:true,
            price:true,
        
            productCardImage:true,
            cart:{
                select:{
                    quantity:true
                }
            }
        }
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

const updateCartItem = async (userId: string, cartId: string, payload: any) => {
  const { quantity, selectedColor, selectedSize } = payload;

  const existingCart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      userId,
    },
    include: {
      product: true,
    },
  });

  if (!existingCart) {
    throw new Error("Cart item not found");
  }

  const updateData: any = {};

  if (quantity !== undefined) {
    if (Number(quantity) < 1) {
      throw new Error("Quantity must be at least 1");
    }

    if (Number(quantity) > existingCart.product.stock) {
      throw new Error("Quantity exceeds available stock");
    }

    updateData.quantity = Number(quantity);
  }

  if (selectedColor !== undefined) {
    if (
      selectedColor &&
      existingCart.product.colors.length > 0 &&
      !existingCart.product.colors.includes(selectedColor)
    ) {
      throw new Error("Selected color is invalid");
    }

    updateData.selectedColor = selectedColor;
  }

  if (selectedSize !== undefined) {
    if (
      selectedSize &&
      existingCart.product.sizes.length > 0 &&
      !existingCart.product.sizes.includes(selectedSize)
    ) {
      throw new Error("Selected size is invalid");
    }

    updateData.selectedSize = selectedSize;
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

const removeCartItem = async (userId: string, cartId: string) => {
  const existingCart = await prisma.cart.findFirst({
    where: {
      id: cartId,
      userId,
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

const clearMyCart = async (userId: string) => {
  await prisma.cart.deleteMany({
    where: { userId },
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