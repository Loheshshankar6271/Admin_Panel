const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

// Support a comma-separated list of allowed exact origins via CLIENT_URL,
// e.g. "https://your-app.vercel.app,http://localhost:5173"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// Also allow any Vercel preview deployment URL (*.vercel.app)
const vercelPreviewRegex = /^https:\/\/.*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    console.log('REQUEST ORIGIN:', origin);
    console.log('ALLOWED ORIGINS:', allowedOrigins);

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      vercelPreviewRegex.test(origin)
    ) {
      callback(null, true);
    } else {
      console.log('BLOCKED ORIGIN:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
