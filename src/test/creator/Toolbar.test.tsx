import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toolbar from '../../creator/Toolbar.js';
import type { CreatorState, CreatorAction } from '../../hooks/useCreatorState.js';
import type { Dispatch } from 'react';
import { DEFAULT_BOARD, DEFAULT_TARGET, DEFAULT_MAX_RICOCHETS, DEFAULT_ALLOWED_WALLS, MOBILE_BOARD } from '../../constants.js';

function makeState(overrides: Partial<CreatorState> = {}): CreatorState {
  return {
    board: { ...DEFAULT_BOARD },
    target: { ...DEFAULT_TARGET },
    maxRicochets: DEFAULT_MAX_RICOCHETS,
    allowedWalls: [...DEFAULT_ALLOWED_WALLS],
    shapes: [],
    selectedId: null,
    activeTool: 'select',
    ghost: null,
    history: [],
    validated: false,
    ...overrides,
  };
}

describe('Toolbar', () => {
  it('renders all 5 tool buttons', () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    expect(screen.getByTitle('Select')).toBeInTheDocument();
    expect(screen.getByTitle('Rectangle')).toBeInTheDocument();
    expect(screen.getByTitle('Triangle')).toBeInTheDocument();
    expect(screen.getByTitle('Circle')).toBeInTheDocument();
    expect(screen.getByTitle('Move Target')).toBeInTheDocument();
  });

  it('clicking a tool button dispatches SET_TOOL', async () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    await userEvent.click(screen.getByTitle('Rectangle'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_TOOL', tool: 'rect' });
  });

  it('active tool button has "active" class', () => {
    const state = makeState({ activeTool: 'rect' });
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={state} dispatch={dispatch} onTest={vi.fn()} />);
    const rectBtn = screen.getByTitle('Rectangle');
    expect(rectBtn.className).toContain('active');
  });

  it('inactive tool buttons do not have "active" class', () => {
    const state = makeState({ activeTool: 'rect' });
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={state} dispatch={dispatch} onTest={vi.fn()} />);
    const selectBtn = screen.getByTitle('Select');
    expect(selectBtn.className).not.toContain('active');
  });

  it('Desktop preset button dispatches SET_BOARD with DEFAULT_BOARD dimensions', async () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    await userEvent.click(screen.getByTitle(`${DEFAULT_BOARD.width}×${DEFAULT_BOARD.height}`));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BOARD', updates: DEFAULT_BOARD });
  });

  it('Mobile preset button dispatches SET_BOARD with MOBILE_BOARD dimensions', async () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    await userEvent.click(screen.getByTitle(`${MOBILE_BOARD.width}×${MOBILE_BOARD.height}`));
    expect(dispatch).toHaveBeenCalledWith({ type: 'SET_BOARD', updates: MOBILE_BOARD });
  });

  it('Board width input dispatches SET_BOARD when changed', () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    const inputs = screen.getAllByRole('spinbutton');
    // First input is width (W), second is height (H), third is max ricochets
    const widthInput = inputs[0];
    fireEvent.change(widthInput, { target: { value: '600' } });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_BOARD', updates: expect.objectContaining({ width: 600 }) })
    );
  });

  it('Max ricochets input dispatches SET_MAX_RICOCHETS when changed', () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    const ricochetInput = screen.getByDisplayValue(String(DEFAULT_MAX_RICOCHETS));
    fireEvent.change(ricochetInput, { target: { value: '8' } });
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_MAX_RICOCHETS', value: 8 })
    );
  });

  it('wall toggle buttons are rendered for all 4 walls', () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    // Wall buttons show first letter of wall name
    expect(screen.getByTitle(/top wall/i)).toBeInTheDocument();
    expect(screen.getByTitle(/bottom wall/i)).toBeInTheDocument();
    expect(screen.getByTitle(/left wall/i)).toBeInTheDocument();
    expect(screen.getByTitle(/right wall/i)).toBeInTheDocument();
  });

  it('clicking a wall button dispatches TOGGLE_WALL', async () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={vi.fn()} />);
    const topBtn = screen.getByTitle(/top wall/i);
    await userEvent.click(topBtn);
    expect(dispatch).toHaveBeenCalledWith({ type: 'TOGGLE_WALL', wall: 'top' });
  });

  it('last remaining wall button is disabled', () => {
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    const state = makeState({ allowedWalls: ['left'] });
    render(<Toolbar state={state} dispatch={dispatch} onTest={vi.fn()} />);
    const leftBtn = screen.getByTitle('At least one wall must be allowed');
    expect(leftBtn).toBeDisabled();
  });

  it('Validate & Share button calls onTest', async () => {
    const onTest = vi.fn();
    const dispatch = vi.fn() as Dispatch<CreatorAction>;
    render(<Toolbar state={makeState()} dispatch={dispatch} onTest={onTest} />);
    await userEvent.click(screen.getByText(/Validate & Share/i));
    expect(onTest).toHaveBeenCalledOnce();
  });
});
