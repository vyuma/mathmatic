import { useState, useCallback } from "react";
import {
  getMathExpressionAtPosition,
  replaceMathExpression,
} from "../utils/mathUtils";

export interface MathEditingState {
  isEditing: boolean;
  latex: string;
  position: { x: number; y: number };
  isInline: boolean;
  originalExpression?: {
    start: number;
    end: number;
    latex: string;
    isInline: boolean;
  };
}

export interface UseMathEditingReturn {
  mathEditingState: MathEditingState;
  startMathEditing: (
    latex: string,
    position: { x: number; y: number },
    isInline: boolean,
    content?: string,
    cursorPos?: number
  ) => void;
  stopMathEditing: () => void;
  updateMathLatex: (latex: string) => void;
  completeMathEditing: (content: string, newLatex: string) => string;
  focusMathEditor: () => void;
}

/**
 * Custom hook for managing math editing state across components
 */
export const useMathEditing = (): UseMathEditingReturn => {
  const [mathEditingState, setMathEditingState] = useState<MathEditingState>({
    isEditing: false,
    latex: "",
    position: { x: 0, y: 0 },
    isInline: true,
  });

  const startMathEditing = useCallback(
    (
      latex: string,
      position: { x: number; y: number },
      isInline: boolean,
      content?: string,
      cursorPos?: number
    ) => {
      let originalExpression;

      // If content and cursor position are provided, check for existing math expression
      if (content && cursorPos !== undefined) {
        const existingMath = getMathExpressionAtPosition(content, cursorPos);
        if (existingMath) {
          originalExpression = {
            start: existingMath.start,
            end: existingMath.end,
            latex: existingMath.latex,
            isInline: existingMath.isInline,
          };
        }
      }

      setMathEditingState({
        isEditing: true,
        latex,
        position,
        isInline,
        originalExpression,
      });
    },
    []
  );

  const stopMathEditing = useCallback(() => {
    setMathEditingState((prev) => ({
      ...prev,
      isEditing: false,
      originalExpression: undefined,
    }));
  }, []);

  const updateMathLatex = useCallback((latex: string) => {
    setMathEditingState((prev) => ({
      ...prev,
      latex,
    }));
  }, []);

  const completeMathEditing = useCallback(
    (content: string, newLatex: string): string => {
      const { originalExpression, isInline } = mathEditingState;

      if (originalExpression) {
        // Replace existing math expression
        return replaceMathExpression(content, {
          ...originalExpression,
          raw: originalExpression.isInline 
            ? `$${originalExpression.latex}$` 
            : `$$${originalExpression.latex}$$`
        }, newLatex);
      } else {
        // This shouldn't happen in the preview click scenario, but handle it gracefully
        const delimiter = isInline ? "$" : "$$";
        const mathText = isInline
          ? `${delimiter}${newLatex}${delimiter}`
          : `\n${delimiter}\n${newLatex}\n${delimiter}\n`;

        // Append to end of content as fallback
        return content + mathText;
      }
    },
    [mathEditingState]
  );

  const focusMathEditor = useCallback(() => {
    // This will be used by external components to trigger focus
    // The actual focusing is handled by the MathEditor component
    setMathEditingState((prev) => ({
      ...prev,
      // Trigger a re-render to ensure focus is applied
    }));
  }, []);

  return {
    mathEditingState,
    startMathEditing,
    stopMathEditing,
    updateMathLatex,
    completeMathEditing,
    focusMathEditor,
  };
};