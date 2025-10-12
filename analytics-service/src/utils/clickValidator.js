const Joi = require('joi');

/**
 * Kattintás adatok validációs séma
 */
const clickDataSchema = Joi.object({
  shortCode: Joi.string()
    .length(6)
    .pattern(/^[A-Za-z0-9]{6}$/)
    .required()
    .messages({
      'string.length': 'Rövid kód pontosan 6 karakter kell legyen',
      'string.pattern.base': 'Rövid kód csak betűket és számokat tartalmazhat',
      'any.required': 'Rövid kód megadása kötelező'
    }),
  
  userAgent: Joi.string()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.max': 'User agent túl hosszú (max 500 karakter)'
    }),
  
  ipAddress: Joi.string()
    .ip()
    .optional()
    .allow('')
    .messages({
      'string.ip': 'Érvényes IP címet adj meg'
    }),
  
  referer: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Érvényes referer URL-t adj meg'
    }),
  
  timestamp: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Érvényes ISO dátum formátumot adj meg'
    })
});

/**
 * Validálja a kattintás adatokat
 * @param {object} clickData - A validálandó kattintás adatok
 * @returns {object} {isValid: boolean, error?: string}
 */
function validateClickData(clickData) {
  const { error, value } = clickDataSchema.validate(clickData, {
    abortEarly: false,
    stripUnknown: true
  });
  
  if (error) {
    const errorMessage = error.details
      .map(detail => detail.message)
      .join(', ');
    
    return {
      isValid: false,
      error: errorMessage
    };
  }

  return {
    isValid: true,
    data: value
  };
}

/**
 * Sanitizálja a kattintás adatokat
 * @param {object} clickData - A sanitizálandó adatok
 * @returns {object} Sanitizált adatok
 */
function sanitizeClickData(clickData) {
  const sanitized = { ...clickData };
  
  if (sanitized.userAgent) {
    sanitized.userAgent = sanitized.userAgent.substring(0, 500);
  }
  
  if (sanitized.ipAddress) {
    sanitized.ipAddress = sanitized.ipAddress.split(':')[0];
  }
  
  return sanitized;
}

module.exports = {
  validateClickData,
  sanitizeClickData
};
