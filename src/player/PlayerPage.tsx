import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePlayerState } from '../hooks/usePlayerState.js'
import { useAnimationLoop } from '../hooks/useAnimationLoop.js'
import { simulate } from '../physics/simulate.js'
import { encode } from '../encoding/codec.js'
import PlayerBoard from './PlayerBoard.js'
import ResultOverlay from './ResultOverlay.js'
import AboutModal from '../shared/AboutModal.js'
import type { Payload } from '../types/index.js'

interface PlayerPageProps {
  payload: Payload;
  isTestMode?: boolean;
  onBackToEditor?: () => void;
  onWin?: () => void;
}

export default function PlayerPage({ payload, isTestMode = false, onBackToEditor, onWin }: PlayerPageProps) {
  const { state, dispatch, setStart, setAngle, aimAt } = usePlayerState(payload);
  const { startPoint, angleRad, phase, result } = state;
  const [copied, setCopied] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleFire = () => {
    if (phase !== 'aiming' || !startPoint) return;
    const simResult = simulate(startPoint, angleRad, payload);
    dispatch({ type: 'FIRE', result: simResult });
  };

  const onProgress = useCallback(
    ({ frac, ballPos }: { frac: number; ballPos: { x: number; y: number } }) =>
      dispatch({ type: 'ANIM_PROGRESS', frac, ballPos }),
    [dispatch]
  );

  const onComplete = useCallback(() => dispatch({ type: 'ANIM_DONE' }), [dispatch]);

  useAnimationLoop(result?.path, phase === 'animating', onProgress, onComplete);

  useEffect(() => {
    if (phase === 'result' && result?.outcome === 'win' && isTestMode && onWin) {
      onWin();
    }
  }, [phase, result, isTestMode, onWin]);

  const previewResult = useMemo(() => {
    if (!isTestMode || phase !== 'aiming' || !startPoint) return null;
    return simulate(startPoint, angleRad, payload);
  }, [isTestMode, phase, startPoint, angleRad, payload]);

  const shareUrl = isTestMode
    ? `${window.location.origin}${window.location.pathname}?g=${encode(payload)}`
    : null;

  const remixUrl = !isTestMode
    ? `${window.location.pathname}?g=${encode(payload)}&edit=1`
    : null;

  const handleShare = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [shareUrl]);

  const handleReset = () => { dispatch({ type: 'RESET' }); setCopied(false); };

  return (
    <div className="player-page">
      <header className="page-header">
        <div className="logo">
          <img src="/logo.png" alt="Ricochet" className="logo-img" />
          {isTestMode && <span className="logo-sub">Test Mode</span>}
        </div>
        <div className="player-hud">
          <div className="hud-item">
            <span className="hud-label">Ricochets</span>
            <span className="hud-value">
              {phase === 'result' && result ? result.ricochetCount : '-'}
              <span className="hud-max"> / {payload.maxRicochets}</span>
            </span>
          </div>
          <div className="hud-item">
            <span className="hud-label">Status</span>
            <span className="hud-value hud-status">
              {phase === 'aiming' && 'Aim & Fire'}
              {phase === 'animating' && 'In flight…'}
              {phase === 'result' && (result?.outcome === 'win' ? 'Win!' : 'Miss!')}
            </span>
          </div>
        </div>
        {onBackToEditor && (
          <button className="btn btn-edit" onClick={onBackToEditor}>
            ✏ Edit
          </button>
        )}
        <button className="btn-about" onClick={() => setShowAbout(true)} title="About Ricochet">?</button>
      </header>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      {isTestMode && (
        <div className="test-mode-banner">
          Validation mode - hit the target to unlock the share link.
        </div>
      )}

      <div className="player-body">
        <PlayerBoard
          payload={payload}
          playerState={state}
          setStart={setStart}
          setAngle={setAngle}
          aimAt={aimAt}
          previewResult={previewResult}
        />

        <div className="player-controls">
          <div className="controls-hint">
            <p>Drag <strong>S</strong> along the wall to set start position.</p>
            <p>Drag the arrow or click the board to aim.</p>
            {!isTestMode && (
              <div className="create-own-sidebar">
                <a href="/" className="create-own-link">✏ Create your own game</a>
              </div>
            )}
          </div>
          <button
            className="btn btn-fire"
            onClick={handleFire}
            disabled={phase !== 'aiming'}
          >
            Fire!
          </button>
          {phase === 'result' && (
            <button className="btn btn-retry" onClick={handleReset}>
              ↩ Try Again
            </button>
          )}
        </div>
      </div>

      {phase === 'result' && result && (
        <ResultOverlay
          result={result}
          maxRicochets={payload.maxRicochets}
          isTestMode={isTestMode}
          onReset={handleReset}
          onBackToEditor={onBackToEditor}
          onShare={handleShare}
          shareUrl={shareUrl}
          copied={copied}
          remixUrl={remixUrl}
        />
      )}
    </div>
  );
}
