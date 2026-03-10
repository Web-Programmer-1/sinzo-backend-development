// import dotenv from 'dotenv';
// import path from 'path';

// dotenv.config({ path: path.join(process.cwd(), '.env') });

// export default {
//     node_env: process.env.NODE_ENV,
//     port: process.env.PORT,
//     database_url: process.env.DATABASE_URL,
// }








import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
    
  jwt: {
    secret_key: process.env.JWT_SECRET_KEY,
    expires_in: process.env.EXPIRES_IN,
    refresh_secret_key: process.env.JWT_REFRESH_SECRET_KEY,
    expires_in_refresh: process.env.EXPIRES_IN_REFRESH,
  },
  
  salt_round: process.env.SALT_ROUND, 
  
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_KEY_NAME, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY, 
  },
  
  router_api_key: process.env.ROUTER_API_KEY, 
  
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  
  reset_pass: {
    secret_key: process.env.JWT_RESET_PASS_SECRET_KEY,
    expires_in: process.env.RESET_PASS_EXPIRES_IN,
    frontend_base_url: process.env.FRONTEND_BASE_URL,
  },
};

