import { MIN_BOARD, DEFAULT_BOARD, MOBILE_BOARD } from '../constants.js'
import type { CreatorState, CreatorAction, ToolName } from '../hooks/useCreatorState.js'
import type { Dispatch } from 'react'
import type { WallName, Board } from '../types/index.js'

interface ToolDef {
  id: ToolName;
  label: string;
  icon: string;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select', icon: '↖' },
  { id: 'rect', label: 'Rectangle', icon: '▭' },
  { id: 'triangle', label: 'Triangle', icon: '△' },
  { id: 'circle', label: 'Circle', icon: '○' },
  { id: 'target', label: 'Move Target', icon: '◎' },
];

interface BoardPreset {
  label: string;
  board: Board;
  icon: string;
}

interface ToolbarProps {
  state: CreatorState;
  dispatch: Dispatch<CreatorAction>;
  onTest: () => void;
}

export default function Toolbar({ state, dispatch, onTest }: ToolbarProps) {
  const { activeTool, board, maxRicochets } = state;

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-label">Tools</div>
        <div className="tool-buttons">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
              onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
              title={t.label}
            >
              <span className="tool-icon">{t.icon}</span>
              <span className="tool-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-label">Board Size</div>
        <div className="board-presets">
          {([
            { label: 'Desktop', board: DEFAULT_BOARD, icon: '🖥' },
            { label: 'Mobile', board: MOBILE_BOARD, icon: '📱' },
          ] as BoardPreset[]).map(({ label, board: preset, icon }) => {
            const active = board.width === preset.width && board.height === preset.height;
            return (
              <button
                key={label}
                className={`preset-btn ${active ? 'active' : ''}`}
                onClick={() => dispatch({ type: 'SET_BOARD', updates: preset })}
                title={`${preset.width}×${preset.height}`}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>
        <div className="field-row">
          <label>W</label>
          <input
            type="number"
            value={board.width}
            min={MIN_BOARD}
            max={1600}
            onChange={(e) => dispatch({ type: 'SET_BOARD', updates: { width: Math.max(MIN_BOARD, +e.target.value) } })}
          />
        </div>
        <div className="field-row">
          <label>H</label>
          <input
            type="number"
            value={board.height}
            min={MIN_BOARD}
            max={1200}
            onChange={(e) => dispatch({ type: 'SET_BOARD', updates: { height: Math.max(MIN_BOARD, +e.target.value) } })}
          />
        </div>
      </div>

      <div className="toolbar-section">
        <div className="toolbar-label">Max Ricochets</div>
        <input
          type="number"
          value={maxRicochets}
          min={1}
          max={50}
          className="max-rico-input"
          onChange={(e) => dispatch({ type: 'SET_MAX_RICOCHETS', value: Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)) })}
        />
      </div>

      <div className="toolbar-section">
        <div className="toolbar-label">Starting Walls</div>
        <div className="wall-grid">
          {(['top', 'left', 'right', 'bottom'] as WallName[]).map((wall) => {
            const on = state.allowedWalls.includes(wall);
            const isLast = on && state.allowedWalls.length === 1;
            return (
              <button
                key={wall}
                className={`wall-btn wall-${wall} ${on ? 'on' : 'off'}`}
                onClick={() => dispatch({ type: 'TOGGLE_WALL', wall })}
                disabled={isLast}
                title={isLast ? 'At least one wall must be allowed' : `${on ? 'Restrict' : 'Allow'} ${wall} wall`}
              >
                {wall[0].toUpperCase()}
              </button>
            );
          })}
        </div>
        <div className="wall-hint">Toggle walls players can start from.</div>
      </div>

      <div className="toolbar-section toolbar-hint">
        <div className="hint-text">
          <strong>Tips</strong>
          <ul>
            <li>Drag to place shapes</li>
            <li>Click shape to select</li>
            <li>Drag handles to resize/rotate</li>
            <li>Del to remove selected</li>
            <li>Ctrl+Z to undo</li>
          </ul>
        </div>
      </div>

      <div className="toolbar-actions">
        <button className="btn btn-test" onClick={onTest}>
          ▶ Validate &amp; Share
        </button>
      </div>
    </div>
  );
}
