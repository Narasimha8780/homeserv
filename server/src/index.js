import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { citiesRouter } from './routes/cities.js';
import { categoriesRouter } from './routes/categories.js';
import { captainsRouter } from './routes/captains.js';
import { reviewsRouter } from './routes/reviews.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors(
    allowedOrigins.length > 0
      ? {
          origin: allowedOrigins,
        }
      : undefined,
  ),
);
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/cities', citiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/captains', captainsRouter);
app.use('/api/reviews', reviewsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`HomeServ API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
