# JavaScript Validation Library

A robust, type-safe validation library for JavaScript that supports both primitive and complex data types. This library provides a fluent interface for creating validation schemas and validating data structures.

## Features

- Type-safe validation for primitive types (string, number, boolean, date)
- Support for complex types (arrays and objects)
- Fluent API for chaining validation rules
- Custom error messages
- Nested object validation
- Array validation with item type checking
- Regular expression pattern matching
- Length and range constraints
- Comprehensive test coverage

## Installation

```bash
npm install js-validation-library
```

## Quick Start

```javascript
const Schema = require('./validator');

// Create a simple schema
const userSchema = Schema.object({
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).max(120)
});

// Validate data
const result = userSchema.validate({
  name: "John Doe",
  email: "john@example.com",
  age: 30
});

console.log(result.isValid); // true
console.log(result.errors); // []
```

## API Documentation

### Schema Builder

The `Schema` class provides static methods to create validators for different types:

```javascript
// String validator
Schema.string()

// Number validator
Schema.number()

// Boolean validator
Schema.boolean()

// Date validator
Schema.date()

// Object validator
Schema.object(schema)

// Array validator
Schema.array(itemValidator)
```

### String Validator

```javascript
const validator = Schema.string()
  .minLength(2)
  .maxLength(50)
  .pattern(/^[A-Z]+$/)
  .withMessage('Custom error message');
```

Available methods:
- `minLength(length)`: Minimum string length
- `maxLength(length)`: Maximum string length
- `pattern(regex)`: Regular expression pattern
- `withMessage(message)`: Custom error message

### Number Validator

```javascript
const validator = Schema.number()
  .min(0)
  .max(100)
  .withMessage('Must be a number between 0 and 100');
```

Available methods:
- `min(value)`: Minimum value
- `max(value)`: Maximum value
- `withMessage(message)`: Custom error message

### Boolean Validator

```javascript
const validator = Schema.boolean()
  .withMessage('Must be a boolean value');
```

### Date Validator

```javascript
const validator = Schema.date()
  .minDate(new Date('2023-01-01'))
  .maxDate(new Date('2023-12-31'));
```

Available methods:
- `minDate(date)`: Minimum date
- `maxDate(date)`: Maximum date
- `withMessage(message)`: Custom error message

### Array Validator

```javascript
const validator = Schema.array(Schema.string())
  .withMessage('Must be an array of strings');
```

### Object Validator

```javascript
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/),
  country: Schema.string()
});

const userSchema = Schema.object({
  name: Schema.string(),
  age: Schema.number(),
  address: addressSchema
});
```

## Complex Example

Here's a complete example showing how to validate a complex user object:

```javascript
const Schema = require('./validator');

// Define address schema
const addressSchema = Schema.object({
  street: Schema.string(),
  city: Schema.string(),
  postalCode: Schema.string().pattern(/^\d{5}$/),
  country: Schema.string()
});

// Define user schema
const userSchema = Schema.object({
  id: Schema.string(),
  name: Schema.string().minLength(2).maxLength(50),
  email: Schema.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: Schema.number().min(0).max(120),
  isActive: Schema.boolean(),
  tags: Schema.array(Schema.string()),
  address: addressSchema
});

// Example data
const userData = {
  id: "12345",
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  isActive: true,
  tags: ["developer", "designer"],
  address: {
    street: "123 Main St",
    city: "Boston",
    postalCode: "12345",
    country: "USA"
  }
};

// Validate data
const result = userSchema.validate(userData);

if (result.isValid) {
  console.log('Validation successful');
} else {
  console.log('Validation failed:', result.errors);
}
```

## Running Tests

The library includes a comprehensive test suite. To run the tests:

1. Install dependencies:
```bash
npm install
```

2. Run tests:
```bash
npm test
```

## Error Handling

The validation result object has the following structure:

```javascript
{
  isValid: boolean,
  errors: Array<string> | Object
}
```

For object validation, the errors object will contain field-specific errors:

```javascript
{
  isValid: false,
  errors: {
    name: ['Name is required'],
    email: ['Invalid email format'],
    age: ['Age must be a number']
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License 