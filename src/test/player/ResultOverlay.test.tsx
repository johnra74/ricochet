import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResultOverlay from '../../player/ResultOverlay.js';
import type { SimResult } from '../../types/index.js';

const winResult: SimResult = { path: [], outcome: 'win', ricochetCount: 2 };
const loseResult: SimResult = { path: [], outcome: 'lose', ricochetCount: 5 };

describe('ResultOverlay', () => {
  describe('win result', () => {
    it('shows "Target Hit!" title', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      expect(screen.getByText('Target Hit!')).toBeInTheDocument();
    });

    it('shows win CSS class on overlay', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      expect(container.firstChild).toHaveClass('win');
    });
  });

  describe('lose result', () => {
    it('shows "Out of Ricochets!" title', () => {
      render(
        <ResultOverlay
          result={loseResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      expect(screen.getByText('Out of Ricochets!')).toBeInTheDocument();
    });

    it('shows lose CSS class on overlay', () => {
      const { container } = render(
        <ResultOverlay
          result={loseResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      expect(container.firstChild).toHaveClass('lose');
    });
  });

  it('displays ricochet count correctly', () => {
    render(
      <ResultOverlay
        result={winResult}
        maxRicochets={5}
        isTestMode={false}
        onReset={vi.fn()}
      />
    );
    expect(screen.getByText(/2 \/ 5 ricochets used/i)).toBeInTheDocument();
  });

  it('Try Again button calls onReset', async () => {
    const onReset = vi.fn();
    render(
      <ResultOverlay
        result={winResult}
        maxRicochets={5}
        isTestMode={false}
        onReset={onReset}
      />
    );
    await userEvent.click(screen.getByText('Try Again'));
    expect(onReset).toHaveBeenCalledOnce();
  });

  describe('test mode + win', () => {
    it('shows share block with URL input and Copy URL button', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={vi.fn()}
        />
      );
      expect(screen.getByDisplayValue('https://example.com/game?g=abc123')).toBeInTheDocument();
      expect(screen.getByText('Copy URL')).toBeInTheDocument();
    });

    it('Copy URL button calls onShare', async () => {
      const onShare = vi.fn();
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={onShare}
        />
      );
      await userEvent.click(screen.getByText('Copy URL'));
      expect(onShare).toHaveBeenCalledOnce();
    });

    it('shows Copied! text when copied is true', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com"
          copied={true}
          onShare={vi.fn()}
        />
      );
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    it('renders a QR code SVG when shareUrl is provided', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={vi.fn()}
        />
      );
      expect(container.querySelector('.qr-container')).not.toBeNull();
      expect(container.querySelector('.qr-container svg')).not.toBeNull();
    });

    it('QR code SVG has size 256', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={vi.fn()}
        />
      );
      const svg = container.querySelector('.qr-container svg');
      expect(svg?.getAttribute('width')).toBe('256');
      expect(svg?.getAttribute('height')).toBe('256');
    });

    it('URL input and QR code are siblings inside .share-section', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={vi.fn()}
        />
      );
      const section = container.querySelector('.share-section');
      expect(section?.querySelector('.share-block')).not.toBeNull();
      expect(section?.querySelector('.qr-container')).not.toBeNull();
    });

    it('does not render QR code on lose in test mode', () => {
      const { container } = render(
        <ResultOverlay
          result={loseResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com/game?g=abc123"
          onShare={vi.fn()}
        />
      );
      expect(container.querySelector('.qr-container')).toBeNull();
    });

    it('does not render QR code without shareUrl', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
        />
      );
      expect(container.querySelector('.qr-container')).toBeNull();
    });

    it('does not show make-your-own section in test mode', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={true}
          onReset={vi.fn()}
          shareUrl="https://example.com"
        />
      );
      expect(screen.queryByText(/Want to create your own puzzle/i)).not.toBeInTheDocument();
    });
  });

  describe('non-test mode', () => {
    it('shows make-your-own section', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      expect(screen.getByText(/Want to create your own puzzle/i)).toBeInTheDocument();
    });

    it('shows Remix this level link', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
          remixUrl="/?g=abc&edit=1"
        />
      );
      const remixLink = screen.getByText('Remix this level');
      expect(remixLink).toBeInTheDocument();
      expect(remixLink).toHaveAttribute('href', '/?g=abc&edit=1');
    });

    it('shows Start fresh link pointing to /', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
        />
      );
      const freshLink = screen.getByText('Start fresh');
      expect(freshLink).toBeInTheDocument();
      expect(freshLink).toHaveAttribute('href', '/');
    });

    it('does not show share block in non-test mode', () => {
      render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
          shareUrl="https://example.com"
        />
      );
      expect(screen.queryByDisplayValue('https://example.com')).not.toBeInTheDocument();
    });

    it('does not render QR code in non-test mode', () => {
      const { container } = render(
        <ResultOverlay
          result={winResult}
          maxRicochets={5}
          isTestMode={false}
          onReset={vi.fn()}
          shareUrl="https://example.com"
        />
      );
      expect(container.querySelector('.qr-container')).toBeNull();
    });
  });
});
