declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<React.HTMLAttributes<MathfieldElement>, MathfieldElement> & {
      children?: React.ReactNode;
      // Add other MathfieldElement specific attributes here if not already in HTMLAttributes
      // Example: "virtual-keyboard-mode"?: "manual" | "onfocus" | "off";
      // "smart-mode"?: boolean;
      // "read-only"?: boolean;
    };
  }
}
