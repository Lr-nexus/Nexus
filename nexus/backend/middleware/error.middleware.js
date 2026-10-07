const ApiError = require('../utils/ApiError');

exports.notFound = (req, res) => res.status(404).json({ success: false, message: 'Route not found.' });

exports.errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';
  if (status >= 500) console.error('💥', err.message);
  res.status(status).json({
    success: false,
    message: err.isOperational ? err.message : (isProd ? 'Something went wrong.' : err.message),
  });
};