const Joi = require('joi');

/**
 * URL validációs séma
 */
const urlSchema = Joi.string()
  .uri({ 
    scheme: ['http', 'https'],
    allowRelative: false 
  })
  .required()
  .messages({
    'string.uri': 'Érvényes URL-t adj meg (http:// vagy https://)',
    'any.required': 'URL megadása kötelező',
    'string.empty': 'URL nem lehet üres'
  });

/**
 * Validálja az URL-t
 * @param {string} url - A validálandó URL
 * @returns {object} {isValid: boolean, error?: string}
 */
function validateUrl(url) {
  const { error, value } = urlSchema.validate(url);
  
  if (error) {
    return {
      isValid: false,
      error: error.details[0].message
    };
  }

  if (value.length > 2048) {
    return {
      isValid: false,
      error: 'Az URL túl hosszú (max 2048 karakter)'
    };
  }

  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  if (value.startsWith(baseUrl)) {
    return {
      isValid: false,
      error: 'Nem lehet rövidített URL-t rövidíteni'
    };
  }

  return {
    isValid: true,
    url: value
  };
}

/**
 * Normalizálja az URL-t (opcionális)
 * @param {string} url - Az URL
 * @returns {string} Normalizált URL
 */
function normalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    
    urlObj.hash = '';
    urlObj.hostname = urlObj.hostname.toLowerCase();
    
    return urlObj.toString();
  } catch (error) {
    return url;
  }
}

module.exports = {
  validateUrl,
  normalizeUrl
};
