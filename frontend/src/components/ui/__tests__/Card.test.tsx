import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../Card';

describe('Card', () => {
  it('should render card with children', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <div>Content</div>
      </Card>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have default card styles', () => {
    const { container } = render(
      <Card>
        <div>Content</div>
      </Card>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow');
  });
});
