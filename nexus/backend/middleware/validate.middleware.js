module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({
      success: false,
      message: issue ? `${issue.path.join('.')}: ${issue.message}` : 'Invalid input.',
    });
  }
  Object.assign(req, result.data);
  next();
};