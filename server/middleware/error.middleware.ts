export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  // In development, show the actual error message + stack trace
  // In production, mask non-operational errors
  const isDev = process.env.NODE_ENV === 'development';
  const message = isDev ? err.message : (err.isOperational ? err.message : 'Internal server error');

  if (!err.isOperational) {
    console.error('⚠️ Unexpected error:', err);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(isDev && { stack: err.stack }),
    },
  });
}
