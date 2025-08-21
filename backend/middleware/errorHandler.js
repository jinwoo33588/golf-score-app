module.exports = function errorHandler(err, req, res, next) {
  const isProd = process.env.NODE_ENV === 'production';
  const status = err.status || err.httpStatus || 500;
  const code = err.code || err.type || undefined;

  const payload = {
    error: {
      message: err.publicMessage || err.message || 'Internal Server Error',
      ...(code && { code }),
      ...(err.details && { details: err.details }),
    },
  };

  // 개발 환경에서는 스택도 같이 보기
  if (!isProd && err.stack) payload.error.stack = err.stack;

  if (!res.headersSent) res.status(status).json(payload);
  else next(err);
};
