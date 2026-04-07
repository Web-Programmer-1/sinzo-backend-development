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
import { DashboardRoutes } from '../modules/dashboard/dashboard.routes';
import { BannerRoutes } from '../modules/banner/banner.route';
import { SettingRoutes } from '../modules/setting/setting.route';
import { ManualPaymentRoutes } from '../modules/manual-payment/payment.route';
import { SystemRoutes } from '../modules/systerm/systerm.route';


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
    {
        path: '/dashboard',
        route: DashboardRoutes,
    },
    {
        path: '/banner',
        route: BannerRoutes,
    },
    {
        path: '/setting',
        route: SettingRoutes,
    },
    {
        path: '/payment',
        route: ManualPaymentRoutes,
    },

  {
    path: '/system',
    route: SystemRoutes,
  },

];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;