// VALIDASI EMAIL
export const isEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

// VALIDASI NOMOR HP (Indonesia)
export const isPhone = (value: string): boolean => {
  return /^(?:\+62|62|0)[0-9]{9,13}$/.test(value);
};

// VALIDASI IDENTIFIER (EMAIL ATAU HP)
export const isValidIdentifier = (value: string): boolean => {
  return isEmail(value) || isPhone(value);
};

// VALIDASI PASSWORD
export const isValidPassword = (value: string): boolean => {
  return value.length >= 6;
};