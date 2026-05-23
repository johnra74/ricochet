import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { encode } from '../encoding/codec.js';
import type { Payload } from '../types/index.js';

function makePayload(): Payload {
  return {
    version: 1,
    board: { width: 800, height: 600 },
    target: { x: 400, y: 300, radius: 20 },
    maxRicochets: 5,
    shapes: [],
    allowedWalls: ['top', 'bottom', 'left', 'right'],
  };
}

function setLocation(search: string) {
  Object.defineProperty(window, 'location', {
    value: {
      search,
      origin: 'http://localhost',
      pathname: '/',
      href: `http://localhost/${search}`,
    },
    writable: true,
    configurable: true,
  });
}

// We dynamically import App inside each test so window.location is set first
async function renderApp() {
  // Clear module cache to re-evaluate parseMode() with fresh window.location
  const module = await import('../App.js?t=' + Date.now());
  const App = module.default;
  return render(<App />);
}

describe('App routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders creator page when no ?g param is present', async () => {
    setLocation('');
    const App = (await import('../App.js')).default;
    render(<App />);
    // Creator page shows "Creator" in logo-sub
    expect(screen.getByText('Creator')).toBeInTheDocument();
  });

  it('renders player page with Fire! button when ?g has a valid encoded payload', async () => {
    const encoded = encode(makePayload());
    setLocation(`?g=${encoded}`);
    // Use a fresh import to get a fresh parseMode() call
    vi.resetModules();
    const App = (await import('../App.js')).default;
    render(<App />);
    expect(screen.getByText('Fire!')).toBeInTheDocument();
  });

  it('renders creator page when ?g is valid but ?edit=1 is also set', async () => {
    const encoded = encode(makePayload());
    setLocation(`?g=${encoded}&edit=1`);
    vi.resetModules();
    const App = (await import('../App.js')).default;
    render(<App />);
    expect(screen.getByText('Creator')).toBeInTheDocument();
  });

  it('renders error page when ?g is corrupted', async () => {
    setLocation('?g=this-is-not-valid-lz-data!!');
    vi.resetModules();
    const App = (await import('../App.js')).default;
    render(<App />);
    expect(screen.getByText('Invalid Game Link')).toBeInTheDocument();
  });
});
