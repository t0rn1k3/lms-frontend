/**
 * Form validation helpers.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function validateEmail(email) {
  if (!email || typeof email !== "string") return "Email is required";
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Enter a valid email address";
  return null;
}

export function validatePassword(password, { required = true, minLength = MIN_PASSWORD_LENGTH } = {}) {
  if (!password || typeof password !== "string") {
    return required ? "Password is required" : null;
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }
  return null;
}

export function validateName(name, { required = true } = {}) {
  if (!name || typeof name !== "string") {
    return required ? "Name is required" : null;
  }
  const trimmed = name.trim();
  if (!trimmed && required) return "Name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  return null;
}

export function validateProfileForm({ name, email, password }) {
  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  if (password) {
    const pwdErr = validatePassword(password, { required: false });
    if (pwdErr) errors.password = pwdErr;
  }
  return Object.keys(errors).length ? errors : null;
}

export function validateLoginForm({ email, password }) {
  const errors = {};
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const pwdErr = validatePassword(password);
  if (pwdErr) errors.password = pwdErr;
  return Object.keys(errors).length ? errors : null;
}

export function validateRegisterForm({ name, email, password }) {
  const errors = {};
  const nameErr = validateName(name);
  if (nameErr) errors.name = nameErr;
  const emailErr = validateEmail(email);
  if (emailErr) errors.email = emailErr;
  const pwdErr = validatePassword(password);
  if (pwdErr) errors.password = pwdErr;
  return Object.keys(errors).length ? errors : null;
}
