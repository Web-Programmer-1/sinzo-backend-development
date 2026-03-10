import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { ProductRoutes } from '../modules/products/product.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { ReviewRoutes } from '../modules/review/review.route';


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

];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;