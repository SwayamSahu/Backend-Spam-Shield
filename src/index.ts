import express from 'express';
import authRoutes from './routes/auth';
import spamRoutes from './routes/spam';
import searchRoutes from './routes/search';
import { authenticateToken } from './middleware/authMiddleware';

const app = express();

app.use(express.json());

// Public routes (e.g., registration and login)
app.use('/auth', authRoutes);

// All other routes require authentication
app.use(authenticateToken);
app.use('/spam', spamRoutes);
app.use('/search', searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


