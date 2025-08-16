// TypeScript declarations for MathLive custom elements

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<import('mathlive').MathfieldElement>;
        },
        HTMLElement
      >;
    }
  }
}

// Re-export MathLive types for convenience
export type { MathfieldElement, MathfieldOptions } from 'mathlive';