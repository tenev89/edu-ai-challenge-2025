/**
 * Validation Library
 * A robust validation library for JavaScript that supports primitive and complex data types
 */

// Base Validator class that all other validators will extend
class Validator {
  constructor() {
    this.rules = [];
    this.customMessage = null;
  }

  /**
   * Adds a validation rule
   * @param {Function} rule - Validation function that returns boolean
   * @param {string} message - Error message for this rule
   * @returns {Validator} - Returns this for chaining
   */
  addRule(rule, message) {
    this.rules.push({ rule, message });
    return this;
  }

  /**
   * Sets a custom error message
   * @param {string} message - Custom error message
   * @returns {Validator} - Returns this for chaining
   */
  withMessage(message) {
    this.customMessage = message;
    return this;
  }

  /**
   * Validates a value against all rules
   * @param {any} value - Value to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(value) {
    const errors = [];
    
    for (const { rule, message } of this.rules) {
      if (!rule(value)) {
        errors.push(this.customMessage || message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// String Validator
class StringValidator extends Validator {
  constructor() {
    super();
    this.addRule(
      value => typeof value === 'string',
      'Value must be a string'
    );
  }

  /**
   * Adds minimum length validation
   * @param {number} length - Minimum length
   * @returns {StringValidator} - Returns this for chaining
   */
  minLength(length) {
    this.addRule(
      value => value.length >= length,
      `String must be at least ${length} characters long`
    );
    return this;
  }

  /**
   * Adds maximum length validation
   * @param {number} length - Maximum length
   * @returns {StringValidator} - Returns this for chaining
   */
  maxLength(length) {
    this.addRule(
      value => value.length <= length,
      `String must be at most ${length} characters long`
    );
    return this;
  }

  /**
   * Adds pattern validation
   * @param {RegExp} pattern - Regular expression pattern
   * @returns {StringValidator} - Returns this for chaining
   */
  pattern(pattern) {
    this.addRule(
      value => pattern.test(value),
      'String does not match required pattern'
    );
    return this;
  }
}

// Number Validator
class NumberValidator extends Validator {
  constructor() {
    super();
    this.addRule(
      value => typeof value === 'number' && !isNaN(value),
      'Value must be a valid number'
    );
  }

  /**
   * Adds minimum value validation
   * @param {number} min - Minimum value
   * @returns {NumberValidator} - Returns this for chaining
   */
  min(min) {
    this.addRule(
      value => value >= min,
      `Number must be greater than or equal to ${min}`
    );
    return this;
  }

  /**
   * Adds maximum value validation
   * @param {number} max - Maximum value
   * @returns {NumberValidator} - Returns this for chaining
   */
  max(max) {
    this.addRule(
      value => value <= max,
      `Number must be less than or equal to ${max}`
    );
    return this;
  }
}

// Boolean Validator
class BooleanValidator extends Validator {
  constructor() {
    super();
    this.addRule(
      value => typeof value === 'boolean',
      'Value must be a boolean'
    );
  }
}

// Date Validator
class DateValidator extends Validator {
  constructor() {
    super();
    this.addRule(
      value => value instanceof Date && !isNaN(value),
      'Value must be a valid date'
    );
  }

  /**
   * Adds minimum date validation
   * @param {Date} minDate - Minimum date
   * @returns {DateValidator} - Returns this for chaining
   */
  minDate(minDate) {
    this.addRule(
      value => value >= minDate,
      `Date must be after ${minDate.toISOString()}`
    );
    return this;
  }

  /**
   * Adds maximum date validation
   * @param {Date} maxDate - Maximum date
   * @returns {DateValidator} - Returns this for chaining
   */
  maxDate(maxDate) {
    this.addRule(
      value => value <= maxDate,
      `Date must be before ${maxDate.toISOString()}`
    );
    return this;
  }
}

// Object Validator
class ObjectValidator extends Validator {
  /**
   * @param {Object} schema - Object containing field validators
   */
  constructor(schema) {
    super();
    this.schema = schema;
  }

  /**
   * Validates an object against the schema
   * @param {Object} value - Object to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(value) {
    if (typeof value !== 'object' || value === null) {
      return {
        isValid: false,
        errors: ['Value must be an object']
      };
    }

    const errors = {};
    let isValid = true;

    for (const [field, validator] of Object.entries(this.schema)) {
      const result = validator.validate(value[field]);
      if (!result.isValid) {
        errors[field] = result.errors;
        isValid = false;
      }
    }

    return {
      isValid,
      errors: Object.keys(errors).length > 0 ? errors : []
    };
  }
}

// Array Validator
class ArrayValidator extends Validator {
  /**
   * @param {Validator} itemValidator - Validator for array items
   */
  constructor(itemValidator) {
    super();
    this.itemValidator = itemValidator;
    this.addRule(
      value => Array.isArray(value),
      'Value must be an array'
    );
  }

  /**
   * Validates an array and its items
   * @param {Array} value - Array to validate
   * @returns {Object} - Validation result with isValid and errors
   */
  validate(value) {
    const baseValidation = super.validate(value);
    if (!baseValidation.isValid) {
      return baseValidation;
    }

    const errors = [];
    let isValid = true;

    for (let i = 0; i < value.length; i++) {
      const result = this.itemValidator.validate(value[i]);
      if (!result.isValid) {
        errors.push({
          index: i,
          errors: result.errors
        });
        isValid = false;
      }
    }

    return {
      isValid,
      errors
    };
  }
}

// Schema Builder
class Schema {
  /**
   * Creates a string validator
   * @returns {StringValidator}
   */
  static string() {
    return new StringValidator();
  }

  /**
   * Creates a number validator
   * @returns {NumberValidator}
   */
  static number() {
    return new NumberValidator();
  }

  /**
   * Creates a boolean validator
   * @returns {BooleanValidator}
   */
  static boolean() {
    return new BooleanValidator();
  }

  /**
   * Creates a date validator
   * @returns {DateValidator}
   */
  static date() {
    return new DateValidator();
  }

  /**
   * Creates an object validator
   * @param {Object} schema - Object containing field validators
   * @returns {ObjectValidator}
   */
  static object(schema) {
    return new ObjectValidator(schema);
  }

  /**
   * Creates an array validator
   * @param {Validator} itemValidator - Validator for array items
   * @returns {ArrayValidator}
   */
  static array(itemValidator) {
    return new ArrayValidator(itemValidator);
  }
}

// Example usage
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/).withMessage('Postal code must be 5 digits'),
  country: Schema.string()
});

const userSchema = Schema.object({
  id: Schema.string().withMessage('ID must be a string'),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number(),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema,
  metadata: Schema.object({})
});

// Export the Schema class
module.exports = Schema; 