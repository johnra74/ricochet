import { useState } from 'react'
import { decode } from './encoding/codec.js'
import CreatorPage from './creator/CreatorPage.js'
import PlayerPage from './player/PlayerPage.js'
import type { Payload } from './types/index.js'

type AppMode = 'creator' | 'player' | 'error'

interface UrlState {
  mode: AppMode;
  payload: Payload | null;
  error: string | null;
}

interface TestMode {
  payload: Payload;
  onValidate: () => void;
}

function parseMode(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('g');
  const editMode = params.has('edit');

  if (!encoded) return { mode: 'creator', payload: null, error: null };

  try {
    const payload = decode(encoded);
    return { mode: editMode ? 'creator' : 'player', payload, error: null };
  } catch (err) {
    return { mode: 'error', payload: null, error: (err as Error).message };
  }
}

export default function App() {
  const [urlState] = useState<UrlState>(parseMode);
  // testMode: null | { payload, onValidate }
  const [testMode, setTestMode] = useState<TestMode | null>(null);

  if (urlState.mode === 'error') {
    return (
      <div className="error-page">
        <div className="error-card">
          <div className="error-icon">⚠</div>
          <div className="error-title">Invalid Game Link</div>
          <div className="error-msg">{urlState.error}</div>
          <a href="/" className="btn btn-primary">Create a New Game</a>
        </div>
      </div>
    );
  }

  // Pure player mode (loaded from a shared URL) - no creator involved
  if (urlState.mode === 'player' && urlState.payload) {
    return <PlayerPage payload={urlState.payload} />;
  }

  // Creator mode: keep CreatorPage mounted so its state (incl. `validated`) survives
  // while the test-mode PlayerPage is overlaid on top.
  return (
    <>
      <div className={testMode ? 'app-hidden' : 'app-fill'}>
        <CreatorPage
          initialPayload={urlState.payload}
          onTest={(payload, onValidate) => setTestMode({ payload, onValidate })}
        />
      </div>
      {testMode && (
        <PlayerPage
          payload={testMode.payload}
          isTestMode
          onBackToEditor={() => setTestMode(null)}
          onWin={testMode.onValidate}
        />
      )}
    </>
  );
}
