import React, { Suspense, lazy } from 'react';

// Lazy load the MathField component to reduce initial bundle size
const MathFieldComponent = lazy(() => 
  import('./MathField').then(module => ({ default: module.MathField }))
);

interface LazyMathFieldProps {
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}

// Loading fallback component
const MathFieldSkeleton: React.FC = () => (
  <div 
    className="math-field-skeleton"
    style={{
      width: '100%',
      height: '40px',
      backgroundColor: '#f0f0f0',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '14px',
      border: '1px solid #ddd',
    }}
  >
    Loading math editor...
  </div>
);

export const LazyMathField: React.FC<LazyMathFieldProps> = (props) => {
  return (
    <Suspense fallback={<MathFieldSkeleton />}>
      <MathFieldComponent {...props} />
    </Suspense>
  );
};

// Also export a preload function for eager loading when needed
export const preloadMathField = () => {
  import('./MathField');
};