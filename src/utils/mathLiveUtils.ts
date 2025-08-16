// MathLive utility functions and initialization

import { MathfieldElement } from 'mathlive';

// Check if MathLive is properly loaded
export function isMathLiveLoaded(): boolean {
  try {
    return typeof MathfieldElement !== 'undefined' && 
           typeof customElements.get('math-field') !== 'undefined';
  } catch (error) {
    console.error('Error checking MathLive availability:', error);
    return false;
  }
}

// Initialize MathLive with error handling
export function initializeMathLive(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Check if already loaded
      if (isMathLiveLoaded()) {
        resolve(true);
        return;
      }

      // Wait for MathLive to be available
      const checkInterval = setInterval(() => {
        if (isMathLiveLoaded()) {
          clearInterval(checkInterval);
          resolve(true);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        console.error('MathLive failed to load within timeout');
        resolve(false);
      }, 5000);

    } catch (error) {
      console.error('Error initializing MathLive:', error);
      resolve(false);
    }
  });
}

// Safe MathField creation with error handling
export function createSafeMathField(): MathfieldElement | null {
  try {
    if (!isMathLiveLoaded()) {
      console.error('MathLive is not loaded');
      return null;
    }

    const mathfield = document.createElement('math-field') as MathfieldElement;
    return mathfield;
  } catch (error) {
    console.error('Error creating MathField:', error);
    return null;
  }
}

// Validate LaTeX string
export function validateLatex(latex: string): { isValid: boolean; error?: string } {
  try {
    if (!latex || typeof latex !== 'string') {
      return { isValid: false, error: 'Invalid LaTeX input' };
    }

    // Basic LaTeX validation
    const openBraces = (latex.match(/\{/g) || []).length;
    const closeBraces = (latex.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      return { isValid: false, error: 'Mismatched braces in LaTeX' };
    }

    // Check for common LaTeX errors
    const invalidPatterns = [
      /\\[a-zA-Z]+\s*\{[^}]*$/,  // Unclosed command
      /\$\$[^$]*\$(?!\$)/,       // Mismatched display math delimiters
      /\$[^$]*\$\$/,             // Mismatched inline math delimiters
    ];

    for (const pattern of invalidPatterns) {
      if (pattern.test(latex)) {
        return { isValid: false, error: 'Invalid LaTeX syntax' };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Error validating LaTeX' };
  }
}

// Safe LaTeX rendering test
export function testLatexRendering(latex: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      if (!isMathLiveLoaded()) {
        resolve(false);
        return;
      }

      const testField = createSafeMathField();
      if (!testField) {
        resolve(false);
        return;
      }

      // Test rendering in a temporary element
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      tempContainer.appendChild(testField);
      document.body.appendChild(tempContainer);

      try {
        testField.value = latex;
        // If we get here without error, rendering succeeded
        document.body.removeChild(tempContainer);
        resolve(true);
      } catch (error) {
        console.error('LaTeX rendering test failed:', error);
        document.body.removeChild(tempContainer);
        resolve(false);
      }
    } catch (error) {
      console.error('Error testing LaTeX rendering:', error);
      resolve(false);
    }
  });
}

// Get MathLive version info
export function getMathLiveInfo(): { version?: string; loaded: boolean } {
  try {
    const loaded = isMathLiveLoaded();
    return {
      loaded,
      version: loaded ? 'unknown' : undefined // MathLive doesn't expose version easily
    };
  } catch (error) {
    return { loaded: false };
  }
}