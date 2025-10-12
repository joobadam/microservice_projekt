/**
 * Rövid kód validátor
 */

/**
 * Validálja a rövid kódot
 * @param {string} code - A validálandó kód
 * @returns {boolean} true ha érvényes
 */
function isValidShortCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  if (code.length !== 6) {
    return false;
  }
  
  const validPattern = /^[A-Za-z0-9]{6}$/;
  return validPattern.test(code);
}

/**
 * Sanitizálja a rövid kódot (eltávolítja a nem kívánatos karaktereket)
 * @param {string} code - A sanitizálandó kód
 * @returns {string} Sanitizált kód
 */
function sanitizeShortCode(code) {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  return code.replace(/[^A-Za-z0-9]/g, '');
}

module.exports = {
  isValidShortCode,
  sanitizeShortCode
};
