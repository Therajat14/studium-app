export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next(); // if no errors, continue
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
    });
  }
};
