import dotenv from 'dotenv';
import app from './app';
import { connectDatabase } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
  });
};

startServer();
