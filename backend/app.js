import express from 'express';
import cookierParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './routes/auth.router.js';
import postRouter from './routes/post.router.js';
import uploadRouter from './routes/upload.router.js';
import searchRouter from './routes/search.router.js';
import healthRouter from './routes/health.router.js';

const app = express();
app.use(express.json());
app.use(cookierParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-blog-git-main-zainijaz231s-projects.vercel.app",
  "https://e-blog-kxhekysn0-zainijaz231s-projects.vercel.app",
  "https://e-blog-theta.vercel.app"

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ CORS blocked for origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.get('/', (req, res) => {
  res.send('Hello from Express.js backend!');
});

app.use('/api/auth', authRouter)
app.use('/api/post', postRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/search', searchRouter)

export default app;
