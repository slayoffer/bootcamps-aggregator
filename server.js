const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

// const logger = require('./middleware/logger');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: './config/config.env' });

// ? Connect to DB
connectDB();

// * Route files
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');

const app = express();

// * Body parser
app.use(express.json());

// * Cookie parser
app.use(cookieParser());

// app.use(logger);

// ? DEV logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ? File uploading
app.use(fileUpload());

// ? Sanitize data
app.use(mongoSanitize());

// ? Set security headers
app.use(helmet());

// ? Prevent cross site scripting attacks (XSS)
app.use(xss());

// ? Request rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});

app.use(limiter);

// ? Prevent http param pollution
app.use(hpp());

// ? Enable CORS
app.use(cors());

// * Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// * Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

app.use(errorHandler);

const { PORT } = process.env || 3000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// ? Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // ? Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
