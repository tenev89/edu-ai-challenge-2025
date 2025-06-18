/**
 * Unit tests for the validation library
 * Using Jest as the testing framework
 */

const Schema = require('./validator');

describe('String Validator', () => {
  test('validates basic string', () => {
    const validator = Schema.string();
    expect(validator.validate('test').isValid).toBe(true);
    expect(validator.validate(123).isValid).toBe(false);
  });

  test('validates string length constraints', () => {
    const validator = Schema.string().minLength(2).maxLength(5);
    expect(validator.validate('ab').isValid).toBe(true);
    expect(validator.validate('a').isValid).toBe(false);
    expect(validator.validate('abcdef').isValid).toBe(false);
  });

  test('validates string pattern', () => {
    const validator = Schema.string().pattern(/^[A-Z]+$/);
    expect(validator.validate('ABC').isValid).toBe(true);
    expect(validator.validate('abc').isValid).toBe(false);
  });

  test('validates custom error message', () => {
    const validator = Schema.string().withMessage('Custom error');
    const result = validator.validate(123);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Custom error');
  });
});

describe('Number Validator', () => {
  test('validates basic number', () => {
    const validator = Schema.number();
    expect(validator.validate(123).isValid).toBe(true);
    expect(validator.validate('123').isValid).toBe(false);
    expect(validator.validate(NaN).isValid).toBe(false);
  });

  test('validates number range', () => {
    const validator = Schema.number().min(0).max(100);
    expect(validator.validate(50).isValid).toBe(true);
    expect(validator.validate(-1).isValid).toBe(false);
    expect(validator.validate(101).isValid).toBe(false);
  });

  test('validates custom error message for number', () => {
    const validator = Schema.number().withMessage('Must be a number');
    const result = validator.validate('not a number');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Must be a number');
  });
});

describe('Boolean Validator', () => {
  test('validates boolean values', () => {
    const validator = Schema.boolean();
    expect(validator.validate(true).isValid).toBe(true);
    expect(validator.validate(false).isValid).toBe(true);
    expect(validator.validate('true').isValid).toBe(false);
    expect(validator.validate(1).isValid).toBe(false);
  });
});

describe('Date Validator', () => {
  test('validates date values', () => {
    const validator = Schema.date();
    expect(validator.validate(new Date()).isValid).toBe(true);
    expect(validator.validate('2023-01-01').isValid).toBe(false);
    expect(validator.validate(new Date('invalid')).isValid).toBe(false);
  });

  test('validates date range', () => {
    const minDate = new Date('2023-01-01');
    const maxDate = new Date('2023-12-31');
    const validator = Schema.date().minDate(minDate).maxDate(maxDate);
    
    expect(validator.validate(new Date('2023-06-15')).isValid).toBe(true);
    expect(validator.validate(new Date('2022-12-31')).isValid).toBe(false);
    expect(validator.validate(new Date('2024-01-01')).isValid).toBe(false);
  });
});

describe('Array Validator', () => {
  test('validates array of strings', () => {
    const validator = Schema.array(Schema.string());
    expect(validator.validate(['a', 'b', 'c']).isValid).toBe(true);
    expect(validator.validate([1, 2, 3]).isValid).toBe(false);
    expect(validator.validate('not an array').isValid).toBe(false);
  });

  test('validates array of numbers', () => {
    const validator = Schema.array(Schema.number());
    expect(validator.validate([1, 2, 3]).isValid).toBe(true);
    expect(validator.validate(['1', '2', '3']).isValid).toBe(false);
  });

  test('reports errors for invalid array items', () => {
    const validator = Schema.array(Schema.number());
    const result = validator.validate([1, '2', 3]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].index).toBe(1);
  });
});

describe('Object Validator', () => {
  test('validates simple object', () => {
    const schema = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });

    expect(schema.validate({
      name: 'John',
      age: 30
    }).isValid).toBe(true);

    expect(schema.validate({
      name: 'John',
      age: '30'
    }).isValid).toBe(false);
  });

  test('validates nested objects', () => {
    const addressSchema = Schema.object({
      street: Schema.string(),
      city: Schema.string()
    });

    const userSchema = Schema.object({
      name: Schema.string(),
      address: addressSchema
    });

    expect(userSchema.validate({
      name: 'John',
      address: {
        street: '123 Main St',
        city: 'Boston'
      }
    }).isValid).toBe(true);

    expect(userSchema.validate({
      name: 'John',
      address: {
        street: 123,
        city: 'Boston'
      }
    }).isValid).toBe(false);
  });

  test('reports errors for invalid object fields', () => {
    const schema = Schema.object({
      name: Schema.string(),
      age: Schema.number()
    });

    const result = schema.validate({
      name: 123,
      age: '30'
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('age');
  });
});

describe('Complex Schema Validation', () => {
  const addressSchema = Schema.object({
    street: Schema.string(),
    city: Schema.string(),
    postalCode: Schema.string().pattern(/^\d{5}$/),
    country: Schema.string()
  });

  const userSchema = Schema.object({
    id: Schema.string(),
    name: Schema.string().minLength(2).maxLength(50),
    email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    age: Schema.number().min(0).max(120),
    isActive: Schema.boolean(),
    tags: Schema.array(Schema.string()),
    address: addressSchema
  });

  test('validates complex valid data', () => {
    const validUser = {
      id: '12345',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      isActive: true,
      tags: ['developer', 'designer'],
      address: {
        street: '123 Main St',
        city: 'Boston',
        postalCode: '12345',
        country: 'USA'
      }
    };

    expect(userSchema.validate(validUser).isValid).toBe(true);
  });

  test('validates complex invalid data', () => {
    const invalidUser = {
      id: 12345, // should be string
      name: 'J', // too short
      email: 'invalid-email',
      age: 150, // too old
      isActive: 'yes', // should be boolean
      tags: [1, 2, 3], // should be strings
      address: {
        street: 123, // should be string
        city: 'Boston',
        postalCode: '123', // invalid format
        country: 'USA'
      }
    };

    const result = userSchema.validate(invalidUser);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('id');
    expect(result.errors).toHaveProperty('name');
    expect(result.errors).toHaveProperty('email');
    expect(result.errors).toHaveProperty('age');
    expect(result.errors).toHaveProperty('isActive');
    expect(result.errors).toHaveProperty('tags');
    expect(result.errors).toHaveProperty('address');
  });
}); 