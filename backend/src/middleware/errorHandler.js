// server/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      message: err.message || 'An internal error occurred. Please try again later.',
    });
  };
  
  module.exports = errorHandler;
  