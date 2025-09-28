require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const connectDB = require('./config/db');
const publicRoutes = require('./routes/publicRoutes');
const adminRoutes = require('./routes/adminRoutes');
const workerRoutes = require('./routes/workerRoutes');
const slaCron = require('./jobs/slaCron');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // or set your frontend origin
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session (persisted in Mongo)
app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb+srv://PrakashShivsharan:Sharan%401383@cluster0.9qulqdc.mongodb.net/janfix?retryWrites=true&w=majority',
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: false, // set true if using HTTPS
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

// Routes
app.use('/api', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/worker', workerRoutes);

// Error handler
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Start SLA cron job
slaCron.start();

// Start server
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
