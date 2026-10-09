import 'dotenv/config';

import app from './app.js';
import { connectDB } from './config/db.js';
import User from './models/User.js';


const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    // connect to db
    await connectDB();
    await User.init();

    // start the express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}/api_endpoint`);
    })
  }catch (err) {
    console.error("Sever startup failed",err.message);
    process.exit(1);
  }
};

startServer();
