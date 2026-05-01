






import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from "cookie-parser";

import rateLimit from 'express-rate-limit';

import helmet from "helmet";

const app: Application = express();


if (process.env.NODE_ENV === 'production') {
    app.set("trust proxy", 1); 
}


const allowedOrigins = [
  "http://localhost:3000",    
      
  "https://www.sinzooffcial.com", 
  "https://sinzooffcial.com",    
  "https://sinzo-frontend-dev-w4wv.vercel.app", 
];

app.use(helmet());




app.use(rateLimit({
  windowMs: 60 * 1000, 
  max: 100,          
  message: "Too many requests from this IP, please try again after a minute."
}));



app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.indexOf(origin) !== -1;
      
      if (isAllowed) {
        return callback(null, true);
      } else {
      
        console.log(` CORS Blocked Origin: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body Parsers
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running.. 🚀",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    });
});


app.use("/api/v1", router);


app.use(notFound);
app.use(globalErrorHandler);

export default app;