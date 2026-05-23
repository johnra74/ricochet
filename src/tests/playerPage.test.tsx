import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlayerPage from '../player/PlayerPage.js'
import type { Payload } from '../types/index.js'

// Stub SVG methods missing from jsdom
beforeAll(() => {
  if (!('getTotalLength' in SVGElement.prototype)) {
    Object.defineProperty(SVGElement.prototype, 'getTotalLength', {
      value: vi.fn(() => 100),
      writable: true,
      configurable: true,
    })
  }
})

const PAYLOAD: Payload = {
  version: 1,
  board: { width: 400, height: 300 },
  target: { x: 350, y: 150, radius: 20 },
  maxRicochets: 5,
  shapes: [],
  allowedWalls: ['left', 'top', 'right', 'bottom'],
}

describe('PlayerPage', () => {
  it('renders Fire! button in aiming phase', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    expect(screen.getByText('Fire!')).toBeInTheDocument()
  })

  it('shows max ricochets in HUD', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    expect(screen.getByText(/\/ 5/)).toBeInTheDocument()
  })

  it('shows Aim & Fire status initially', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    expect(screen.getByText('Aim & Fire')).toBeInTheDocument()
  })

  it('shows Test Mode label when isTestMode=true', () => {
    render(<PlayerPage payload={PAYLOAD} isTestMode />)
    expect(screen.getByText('Test Mode')).toBeInTheDocument()
  })

  it('does not show Test Mode label in player mode', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    expect(screen.queryByText('Test Mode')).not.toBeInTheDocument()
  })

  it('shows test-mode banner when isTestMode=true', () => {
    render(<PlayerPage payload={PAYLOAD} isTestMode />)
    expect(screen.getByText(/Validation mode/i)).toBeInTheDocument()
  })

  it('shows Edit button when onBackToEditor is provided', () => {
    render(<PlayerPage payload={PAYLOAD} isTestMode onBackToEditor={vi.fn()} />)
    expect(screen.getByText('✏ Edit')).toBeInTheDocument()
  })

  it('calls onBackToEditor when Edit button is clicked', () => {
    const onBackToEditor = vi.fn()
    render(<PlayerPage payload={PAYLOAD} isTestMode onBackToEditor={onBackToEditor} />)
    fireEvent.click(screen.getByText('✏ Edit'))
    expect(onBackToEditor).toHaveBeenCalledOnce()
  })

  it('shows Create your own link in player mode (not test mode)', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    expect(screen.getByText('✏ Create your own game')).toBeInTheDocument()
  })

  it('does not show Create your own link in test mode', () => {
    render(<PlayerPage payload={PAYLOAD} isTestMode />)
    expect(screen.queryByText('✏ Create your own game')).not.toBeInTheDocument()
  })

  it('opens About modal when ? button is clicked', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    fireEvent.click(screen.getByTitle('About Ricochet'))
    // About modal should appear (check for text inside it)
    expect(screen.getByText(/What is this\?/i)).toBeInTheDocument()
  })

  it('Fire button becomes disabled while animating after fire', () => {
    render(<PlayerPage payload={PAYLOAD} />)
    const fireBtn = screen.getByText('Fire!')
    fireEvent.click(fireBtn)
    // After firing, phase becomes 'animating', button should be disabled
    expect(fireBtn).toBeDisabled()
  })
})
