export const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route Not Found ${req.originalUrl}` });
};

export const errorHandler = (err, req, res, next) => {
  console.log(err);
  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status).json({
    message: err.message,
  });
};
