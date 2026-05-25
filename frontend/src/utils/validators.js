/**
 * SweetFlow ERP — Shared Form Validators
 * Centralised validation rules used across all pages.
 */

// ── Phone ──────────────────────────────────────────────────────────────────
// Accepts Indian mobile numbers: 10 digits, optional +91 / 0 prefix
export const validatePhone = (value) => {
  if (!value) return 'Phone number is required.';
  const cleaned = value.replace(/[\s\-()]/g, '');
  if (!/^(\+91|0)?[6-9]\d{9}$/.test(cleaned))
    return 'Enter a valid 10-digit Indian mobile number.';
  return '';
};

export const validatePhoneOptional = (value) => {
  if (!value) return '';
  return validatePhone(value);
};

// ── Email ──────────────────────────────────────────────────────────────────
export const validateEmail = (value) => {
  if (!value) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Enter a valid email address (e.g. user@domain.com).';
  return '';
};

export const validateEmailOptional = (value) => {
  if (!value) return '';
  return validateEmail(value);
};

// ── GST Number ─────────────────────────────────────────────────────────────
// Indian GST format: 2-digit state + 10-char PAN + 1-char entity + Z + 1 checksum
export const validateGST = (value) => {
  if (!value) return 'GST number is required.';
  if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.toUpperCase()))
    return 'Enter a valid GST number (e.g. 19AABCS1234F1Z1).';
  return '';
};

// ── UPI ID ─────────────────────────────────────────────────────────────────
export const validateUPI = (value) => {
  if (!value) return 'UPI ID is required.';
  if (!/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(value))
    return 'Enter a valid UPI ID (e.g. merchant@ybl).';
  return '';
};

// ── Generic Required ───────────────────────────────────────────────────────
export const validateRequired = (value, label = 'This field') => {
  if (!value || !value.toString().trim()) return `${label} is required.`;
  return '';
};

// ── Name ───────────────────────────────────────────────────────────────────
export const validateName = (value, label = 'Name') => {
  if (!value || !value.trim()) return `${label} is required.`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters.`;
  if (value.trim().length > 80) return `${label} must be 80 characters or fewer.`;
  return '';
};

// ── Salary / Number ────────────────────────────────────────────────────────
export const validateSalary = (value) => {
  if (!value && value !== 0) return 'Salary is required.';
  if (isNaN(Number(value)) || Number(value) <= 0)
    return 'Enter a valid salary amount greater than 0.';
  return '';
};

// ── Tax Rate ───────────────────────────────────────────────────────────────
export const validateTaxRate = (value) => {
  const n = Number(value);
  if (value === '' || value === null || value === undefined) return 'Tax rate is required.';
  if (isNaN(n) || n < 0 || n > 100) return 'Tax rate must be between 0 and 100.';
  return '';
};

// ── Password ───────────────────────────────────────────────────────────────
export const validatePassword = (value) => {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return '';
};

// ── Brand / Shop Name ──────────────────────────────────────────────────────
export const validateBrandName = (value) => {
  if (!value || !value.trim()) return 'Brand name is required.';
  if (value.trim().length < 2) return 'Brand name must be at least 2 characters.';
  return '';
};
