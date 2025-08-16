import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MarkdownPreview } from '../components/MarkdownPreview';

describe('MarkdownPreview Basic Tests', () => {
  it('renders without crashing', () => {
    const { container } = render(<MarkdownPreview content="# Hello World" />);
    expect(container).toBeTruthy();
  });

  it('renders markdown content', () => {
    const { container } = render(<MarkdownPreview content="# Hello World" />);
    const heading = container.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading?.textContent).toBe('Hello World');
  });

  it('renders empty state', () => {
    const { container } = render(<MarkdownPreview content="" />);
    const emptyState = container.querySelector('.preview-empty');
    expect(emptyState).toBeTruthy();
  });
});