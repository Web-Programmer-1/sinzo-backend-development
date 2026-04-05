import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { ProductRoutes } from '../modules/products/product.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { cartRoutes } from '../modules/cart/cart.route';
import { orderRoutes } from '../modules/order/order.route';
import { steadfastRoutes } from '../modules/steadfast/steadfast.route';
import { WishlistRoutes } from '../modules/wishlist/wishlist.route';
import { CheckoutDraftRoutes } from '../modules/checkoutdraf/checkoutdraf.route';


const router = express.Router();

const moduleRoutes = [
    {
        path: '/users',
        route: UserRoutes,
    },
        {
        path: '/category',
        route: CategoryRoutes,
    },
    {
        path: '/products',
        route: ProductRoutes,
    },
    {
        path: '/review',
        route: ReviewRoutes,
    },
    {
        path: '/cart',
        route: cartRoutes,
    },
    {
        path: '/order',
        route: orderRoutes,
    },
    {
        path: '/steadfast',
        route: steadfastRoutes,
    },
    {
        path: '/wishlist',
        route: WishlistRoutes,
    },
    {
        path: '/checkoutdraf',
        route: CheckoutDraftRoutes,
    },

];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;