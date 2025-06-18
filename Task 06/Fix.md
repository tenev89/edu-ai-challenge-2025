# Enigma Machine Bug Fix Report

## Bugs Identified and Fixed

### Bug 1: Missing Second Plugboard Swap (Critical)
**Issue**: The `encryptChar` method only applied the plugboard swap once at the beginning of the encryption process, but failed to apply it again at the end.

**Root Cause**: In a real Enigma machine, the electrical signal passes through the plugboard **twice**:
1. Before entering the rotors (input)
2. After exiting the rotors (output)

**Impact**: This bug prevented the Enigma from being symmetric. Encrypting and then "decrypting" the same message with identical settings would not return the original text.

**Fix**: Added the missing second plugboard swap at the end of the `encryptChar` method:
```javascript
// Second plugboard swap (output) - THIS WAS MISSING!
c = plugboardSwap(c, this.plugboardPairs);
```

### Bug 2: Incorrect Double-Stepping Logic
**Issue**: The `stepRotors` method didn't properly implement the famous "double stepping" mechanism of the Enigma machine.

**Root Cause**: When the middle rotor reaches its notch position, it should cause both itself AND the left rotor to step. The original code only stepped the left rotor in this case.

**Impact**: This would cause incorrect rotor positioning, leading to wrong encryption/decryption results in certain rotor positions.

**Fix**: Updated the stepping logic to properly handle double stepping:
```javascript
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
```

## Result
After applying these fixes, the Enigma machine now correctly implements the symmetric encryption/decryption behavior where encrypting a message and then encrypting the result again with the same settings returns the original message.