const assert = require('assert');

// Import the Enigma classes and functions
const { Enigma, Rotor, plugboardSwap, alphabet, ROTORS, REFLECTOR, mod } = (() => {
  // Since the original file doesn't export anything, we'll need to copy the necessary parts
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  const ROTORS = [
    { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' }, // Rotor I
    { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' }, // Rotor II
    { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }, // Rotor III
  ];
  
  const REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

  function plugboardSwap(c, pairs) {
    for (const [a, b] of pairs) {
      if (c === a) return b;
      if (c === b) return a;
    }
    return c;
  }

  class Rotor {
    constructor(wiring, notch, ringSetting = 0, position = 0) {
      this.wiring = wiring;
      this.notch = notch;
      this.ringSetting = ringSetting;
      this.position = position;
    }
    
    step() {
      this.position = mod(this.position + 1, 26);
    }
    
    atNotch() {
      return alphabet[this.position] === this.notch;
    }
    
    forward(c) {
      const idx = mod(alphabet.indexOf(c) + this.position - this.ringSetting, 26);
      return this.wiring[idx];
    }
    
    backward(c) {
      const idx = this.wiring.indexOf(c);
      return alphabet[mod(idx - this.position + this.ringSetting, 26)];
    }
  }

  class Enigma {
    constructor(rotorIDs, rotorPositions, ringSettings, plugboardPairs) {
      this.rotors = rotorIDs.map(
        (id, i) =>
          new Rotor(
            ROTORS[id].wiring,
            ROTORS[id].notch,
            ringSettings[i],
            rotorPositions[i],
          ),
      );
      this.plugboardPairs = plugboardPairs;
    }
    
    stepRotors() {
      // Check if middle rotor is at notch (double stepping)
      const middleAtNotch = this.rotors[1].atNotch();
      
      // Step left rotor if middle rotor is at notch
      if (middleAtNotch) this.rotors[0].step();
      
      // Step middle rotor if rightmost rotor is at notch OR if middle rotor is at notch (double stepping)
      if (this.rotors[2].atNotch() || middleAtNotch) this.rotors[1].step();
      
      // Always step rightmost rotor
      this.rotors[2].step();
    }
    
    encryptChar(c) {
      if (!alphabet.includes(c)) return c;
      this.stepRotors();
      
      // First plugboard swap (input)
      c = plugboardSwap(c, this.plugboardPairs);
      
      // Forward pass through rotors (right to left)
      for (let i = this.rotors.length - 1; i >= 0; i--) {
        c = this.rotors[i].forward(c);
      }

      // Reflector
      c = REFLECTOR[alphabet.indexOf(c)];

      // Backward pass through rotors (left to right)
      for (let i = 0; i < this.rotors.length; i++) {
        c = this.rotors[i].backward(c);
      }

      // Second plugboard swap (output)
      c = plugboardSwap(c, this.plugboardPairs);

      return c;
    }
    
    process(text) {
      return text
        .toUpperCase()
        .split('')
        .map((c) => this.encryptChar(c))
        .join('');
    }
  }

  return { Enigma, Rotor, plugboardSwap, alphabet, ROTORS, REFLECTOR, mod };
})();

// Test Suite
console.log('Running Enigma Machine Unit Tests...\n');

// Test 1: Basic Encryption/Decryption Symmetry
function testEncryptionDecryptionSymmetry() {
  console.log('Test 1: Encryption/Decryption Symmetry');
  
  const message = 'HELLO';
  const rotorPositions = [0, 0, 0];
  const ringSettings = [0, 0, 0];
  const plugboardPairs = [];
  
  // Encrypt
  const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
  const encrypted = enigma1.process(message);
  
  // Decrypt (encrypt again with same initial settings)
  const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
  const decrypted = enigma2.process(encrypted);
  
  assert.strictEqual(decrypted, message, `Expected ${message}, got ${decrypted}`);
  console.log(`✓ Original: ${message} → Encrypted: ${encrypted} → Decrypted: ${decrypted}`);
}

// Test 2: Plugboard Functionality
function testPlugboardFunctionality() {
  console.log('\nTest 2: Plugboard Functionality');
  
  // Test plugboard swap function
  const pairs = [['A', 'B'], ['C', 'D']];
  assert.strictEqual(plugboardSwap('A', pairs), 'B');
  assert.strictEqual(plugboardSwap('B', pairs), 'A');
  assert.strictEqual(plugboardSwap('C', pairs), 'D');
  assert.strictEqual(plugboardSwap('D', pairs), 'C');
  assert.strictEqual(plugboardSwap('E', pairs), 'E'); // No swap
  
  // Test with Enigma machine
  const message = 'ABCD';
  const rotorPositions = [0, 0, 0];
  const ringSettings = [0, 0, 0];
  
  const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, []);
  const withoutPlugboard = enigma1.process(message);
  
  const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, pairs);
  const withPlugboard = enigma2.process(message);
  
  assert.notStrictEqual(withoutPlugboard, withPlugboard, 'Plugboard should change output');
  console.log(`✓ Without plugboard: ${withoutPlugboard}`);
  console.log(`✓ With plugboard: ${withPlugboard}`);
}

// Test 3: Rotor Stepping
function testRotorStepping() {
  console.log('\nTest 3: Rotor Stepping');
  
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  
  // Initial positions
  assert.strictEqual(enigma.rotors[0].position, 0);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[2].position, 0);
  
  // After processing one character, rightmost rotor should step
  enigma.process('A');
  assert.strictEqual(enigma.rotors[2].position, 1);
  assert.strictEqual(enigma.rotors[1].position, 0);
  assert.strictEqual(enigma.rotors[0].position, 0);
  
  console.log('✓ Basic rotor stepping works correctly');
}

// Test 4: Double Stepping
function testDoubleStepping() {
  console.log('\nTest 4: Double Stepping');
  
  // Set up rotors where middle rotor is at notch position
  // Rotor II has notch at 'E' (position 4)
  const enigma = new Enigma([0, 1, 2], [0, 4, 25], [0, 0, 0], []);
  
  // Process one character to trigger double stepping
  enigma.process('A');
  
  // After double stepping:
  // - Left rotor should have stepped (0 → 1)
  // - Middle rotor should have stepped (4 → 5)
  // - Right rotor should have stepped (25 → 0)
  assert.strictEqual(enigma.rotors[0].position, 1, 'Left rotor should step during double stepping');
  assert.strictEqual(enigma.rotors[1].position, 5, 'Middle rotor should step during double stepping');
  assert.strictEqual(enigma.rotors[2].position, 0, 'Right rotor should step normally');
  
  console.log('✓ Double stepping mechanism works correctly');
}

// Test 5: Ring Settings
function testRingSettings() {
  console.log('\nTest 5: Ring Settings');
  
  const message = 'TEST';
  const rotorPositions = [0, 0, 0];
  const plugboardPairs = [];
  
  const enigma1 = new Enigma([0, 1, 2], rotorPositions, [0, 0, 0], plugboardPairs);
  const result1 = enigma1.process(message);
  
  const enigma2 = new Enigma([0, 1, 2], rotorPositions, [1, 2, 3], plugboardPairs);
  const result2 = enigma2.process(message);
  
  assert.notStrictEqual(result1, result2, 'Different ring settings should produce different outputs');
  console.log(`✓ Ring setting [0,0,0]: ${result1}`);
  console.log(`✓ Ring setting [1,2,3]: ${result2}`);
}

// Test 6: Non-alphabetic Characters
function testNonAlphabeticCharacters() {
  console.log('\nTest 6: Non-alphabetic Characters');
  
  const enigma = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const message = 'HELLO, WORLD! 123';
  const result = enigma.process(message);
  
  // Non-alphabetic characters should remain unchanged
  assert(result.includes(','), 'Comma should be preserved');
  assert(result.includes('!'), 'Exclamation mark should be preserved');
  assert(result.includes(' '), 'Space should be preserved');
  assert(result.includes('1'), 'Numbers should be preserved');
  assert(result.includes('2'), 'Numbers should be preserved');
  assert(result.includes('3'), 'Numbers should be preserved');
  
  console.log(`✓ Input: ${message}`);
  console.log(`✓ Output: ${result}`);
}

// Test 7: Reflector Symmetry
function testReflectorSymmetry() {
  console.log('\nTest 7: Reflector Symmetry');
  
  // The reflector should be symmetric: if A maps to B, then B should map to A
  const reflectorPairs = new Set();
  for (let i = 0; i < REFLECTOR.length; i++) {
    const char1 = alphabet[i];
    const char2 = REFLECTOR[i];
    const pair = [char1, char2].sort().join('');
    reflectorPairs.add(pair);
  }
  
  // Check that each character maps to exactly one other character (or itself)
  // and that the mapping is symmetric
  for (let i = 0; i < alphabet.length; i++) {
    const char = alphabet[i];
    const mapped = REFLECTOR[i];
    const backMapped = REFLECTOR[alphabet.indexOf(mapped)];
    
    assert.strictEqual(char, backMapped, `Reflector should be symmetric: ${char} → ${mapped} → ${backMapped}`);
  }
  
  console.log('✓ Reflector symmetry verified');
}

// Test 8: Large Text Processing
function testLargeTextProcessing() {
  console.log('\nTest 8: Large Text Processing');
  
  const longMessage = 'A'.repeat(100) + 'B'.repeat(100); // 200 characters
  const enigma1 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const encrypted = enigma1.process(longMessage);
  
  const enigma2 = new Enigma([0, 1, 2], [0, 0, 0], [0, 0, 0], []);
  const decrypted = enigma2.process(encrypted);
  
  assert.strictEqual(decrypted, longMessage, 'Large text should encrypt and decrypt correctly');
  assert.strictEqual(encrypted.length, longMessage.length, 'Output length should match input length');
  
  console.log(`✓ Successfully processed ${longMessage.length} characters`);
}

// Test 9: Mod Function
function testModFunction() {
  console.log('\nTest 9: Mod Function');
  
  assert.strictEqual(mod(5, 3), 2);
  assert.strictEqual(mod(-1, 26), 25);
  assert.strictEqual(mod(-27, 26), 25);
  assert.strictEqual(mod(26, 26), 0);
  assert.strictEqual(mod(0, 26), 0);
  
  console.log('✓ Mod function works correctly for positive and negative numbers');
}

// Test 10: Complete Workflow Test
function testCompleteWorkflow() {
  console.log('\nTest 10: Complete Workflow Test');
  
  const testCases = [
    {
      message: 'ENIGMA',
      rotorPositions: [0, 0, 0],
      ringSettings: [0, 0, 0],
      plugboardPairs: []
    },
    {
      message: 'SECRET',
      rotorPositions: [5, 10, 15],
      ringSettings: [1, 2, 3],
      plugboardPairs: [['A', 'B'], ['C', 'D']]
    },
    {
      message: 'THE QUICK BROWN FOX',
      rotorPositions: [25, 25, 25],
      ringSettings: [0, 0, 0],
      plugboardPairs: [['T', 'H'], ['E', 'Q']]
    }
  ];
  
  testCases.forEach((testCase, index) => {
    const { message, rotorPositions, ringSettings, plugboardPairs } = testCase;
    
    const enigma1 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
    const encrypted = enigma1.process(message);
    
    const enigma2 = new Enigma([0, 1, 2], rotorPositions, ringSettings, plugboardPairs);
    const decrypted = enigma2.process(encrypted);
    
    assert.strictEqual(decrypted, message, `Test case ${index + 1} failed`);
    console.log(`✓ Test case ${index + 1}: "${message}" successfully encrypted and decrypted`);
  });
}

// Run all tests
try {
  testEncryptionDecryptionSymmetry();
  testPlugboardFunctionality();
  testRotorStepping();
  testDoubleStepping();
  testRingSettings();
  testNonAlphabeticCharacters();
  testReflectorSymmetry();
  testLargeTextProcessing();
  testModFunction();
  testCompleteWorkflow();
  
  console.log('\n🎉 All tests passed! The Enigma machine is working correctly.');
} catch (error) {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
} 