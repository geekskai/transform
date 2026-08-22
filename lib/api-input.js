function validatePostTextInput(method, value, label) {
  if (method !== "POST") {
    return { message: "Method not allowed", ok: false, status: 405 };
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return { message: `${label} is required`, ok: false, status: 400 };
  }

  return { ok: true, value };
}

module.exports = { validatePostTextInput };
