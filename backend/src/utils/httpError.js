class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Map known Postgres errors to friendly messages so raw DB errors
// ("invalid input syntax for type uuid", constraint names) never reach users.
const sendError = (res, err, fallbackStatus = 400) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  switch (err?.code) {
    case "22P02": // invalid_text_representation (bad uuid / number)
    case "22007": // invalid_datetime_format
    case "22008": // datetime_field_overflow
      return res.status(400).json({ success: false, message: "Invalid input" });
    case "23505": // unique_violation
      return res.status(409).json({ success: false, message: "That already exists" });
    case "23503": // foreign_key_violation
      return res.status(400).json({ success: false, message: "Referenced record not found" });
    case "23514": // check_violation
      return res.status(400).json({ success: false, message: "Invalid value" });
  }
  if (err?.code || fallbackStatus >= 500) {
    // DB / unexpected error — log it, don't leak internals
    console.error(err);
    return res.status(500).json({ success: false, message: "Something went wrong" });
  }
  // plain Error thrown deliberately by a service with a user-facing message
  return res.status(fallbackStatus).json({ success: false, message: err.message });
};

module.exports = { HttpError, sendError };
