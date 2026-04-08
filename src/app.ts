import express, { Application,  Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import config from './config';
import router from './app/routes';
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from 'express-rate-limit';

const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sinzo-frontend-development.vercel.app",
];

app.use(helmet());



app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
}));



app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
//parser
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => {
    res.send({
        message: "Server is running..",
        environment: config.node_env,
        uptime: process.uptime().toFixed(2) + " sec",
        timeStamp: new Date().toISOString()
    })
});

app.set("trust proxy", true);

// 🔹 main api route
app.use("/api/v1", router);


app.use(notFound);

app.use(globalErrorHandler);



export default app;