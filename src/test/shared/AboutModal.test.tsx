import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AboutModal from '../../shared/AboutModal.js';

describe('AboutModal', () => {
  it('renders the logo image', () => {
    render(<AboutModal onClose={vi.fn()} />);
    const logo = screen.getByAltText('Ricochet');
    expect(logo).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText(/Design a puzzle/i)).toBeInTheDocument();
  });

  it('renders the "What is this?" section', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText('What is this?')).toBeInTheDocument();
  });

  it('renders the "Creating a level" section', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText('Creating a level')).toBeInTheDocument();
  });

  it('renders the "Playing a level" section', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText('Playing a level')).toBeInTheDocument();
  });

  it('renders the "Physics" section', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('renders the "Keyboard shortcuts" section', () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(<AboutModal onClose={onClose} />);
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(<AboutModal onClose={onClose} />);
    const backdrop = container.querySelector('.modal-backdrop');
    expect(backdrop).toBeInTheDocument();
    await userEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it('does not call onClose when the card content is clicked', async () => {
    const onClose = vi.fn();
    const { container } = render(<AboutModal onClose={onClose} />);
    const card = container.querySelector('.about-card');
    expect(card).toBeInTheDocument();
    await userEvent.click(card!);
    expect(onClose).not.toHaveBeenCalled();
  });
});
