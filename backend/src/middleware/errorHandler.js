export const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  //  db duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0];

    let message = "Duplicate value already exists";

    if (field === "username") {
      message = "Username already exists";
    }

    if (field === "email") {
      message = "Email already exists";
    }

    return res.status(409).json({
      success: false,
      message,
    });
  }

  // invalid json request
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON body",
    });
  }

  // req body too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  console.error("API Error:", err);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};