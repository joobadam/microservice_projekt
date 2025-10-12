/**
 * Rövid kód generátor
 * 6 karakteres random string (betűk + számok)
 */

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Generál egy 6 karakteres rövid kódot
 * @returns {string} 6 karakteres rövid kód
 */
function generateShortCode() {
  let result = '';
  const charactersLength = CHARACTERS.length;
  
  for (let i = 0; i < 6; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}

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

module.exports = {
  generateShortCode,
  isValidShortCode
};
