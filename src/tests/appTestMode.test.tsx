/**
 * Tests the App test-mode overlay (lines 65-72 in App.tsx):
 * clicking "Validate & Share" in the creator shows a PlayerPage overlay.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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
  })
}

describe('App — test mode overlay', () => {
  beforeEach(() => setLocation(''))
  afterEach(() => vi.restoreAllMocks())

  it('shows PlayerPage overlay after clicking Validate & Share', async () => {
    vi.resetModules()
    const App = (await import('../App.js')).default
    render(<App />)

    // Creator page is showing
    expect(screen.getByText('Creator')).toBeInTheDocument()

    // Click the test/validate button in the toolbar
    const testBtn = screen.getByText(/Validate & Share/i)
    fireEvent.click(testBtn)

    // The PlayerPage test-mode overlay should now be visible
    expect(screen.getByText('Test Mode')).toBeInTheDocument()
    expect(screen.getByText('Fire!')).toBeInTheDocument()
  })

  it('returns to creator when onBackToEditor is called (Edit button)', async () => {
    vi.resetModules()
    const App = (await import('../App.js')).default
    render(<App />)

    // Enter test mode
    fireEvent.click(screen.getByText(/Validate & Share/i))
    expect(screen.getByText('Test Mode')).toBeInTheDocument()

    // Click the Edit button to go back
    const editBtn = screen.getByText('✏ Edit')
    fireEvent.click(editBtn)

    // Test mode overlay should be gone
    expect(screen.queryByText('Test Mode')).not.toBeInTheDocument()
  })
})
