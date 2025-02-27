import express from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors"
import rateLimit from "express-rate-limit"
const app = express();


// //rate limiter 

// const basicLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, 
//   max: 100,
//   standardHeaders: true, 
//   legacyHeaders: false,
//   message: 'Too many requests from this IP, please try again after 15 minutes'
// });

// app.use(basicLimiter);

// // Or apply to specific routes

// app.use(basicLimiter);

// const apiLimiter = rateLimit({
//   windowMs: 60 * 1000,
//   max: 60, 
//   message: 'Too many requests from this IP, please try again after a minute'
// });


// app.use((err, req, res, next) => {
//   console.error(err.stack);
  
//   if (process.env.NODE_ENV === 'production') {
//     return res.status(500).json({ message: 'An error occurred' });
//   }
  
//   res.status(500).json({ 
//     message: 'An error occurred', 
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined 
//   });
// });

// app.use('/api/v1', apiLimiter);

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true,
}))

app.use(express.json({
    limit : '16kb'
}))

app.use(express.urlencoded({
    extended :true,
    limit : "16kb"
}))

app.use(
    cors({
      origin: "http://localhost:5173", 
      credentials: true, 
      methods: ["GET", "POST", "PUT", "DELETE","PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Set-Cookie"],
      optionsSuccessStatus: 200,
      preflightContinue: true,
      maxAge: 86400,
    })
  );

app.use(express.static("public"))
app.use(cookieParser())

//routes import 

import userRouter from './routes/user.routes.js';


//routes declaration

app.use("/api/v1/",userRouter)


export {app}