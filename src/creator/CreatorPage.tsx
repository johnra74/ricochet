import { useState } from 'react'
import { useCreatorState } from '../hooks/useCreatorState.js'
import BoardCanvas from './BoardCanvas.js'
import Toolbar from './Toolbar.js'
import AboutModal from '../shared/AboutModal.js'
import type { Payload } from '../types/index.js'

interface CreatorPageProps {
  initialPayload?: Payload | null;
  onTest: (payload: Payload, onValidate: () => void) => void;
}

export default function CreatorPage({ initialPayload, onTest }: CreatorPageProps) {
  const { state, dispatch, getPayload } = useCreatorState(initialPayload);
  const [showAbout, setShowAbout] = useState(false);

  const handleTest = () => {
    onTest(getPayload(), () => dispatch({ type: 'MARK_VALIDATED' }));
  };

  return (
    <div className="creator-page">
      <header className="page-header">
        <div className="logo">
          <img src="/logo.png" alt="Ricochet" className="logo-img" />
          <span className="logo-sub">Creator</span>
        </div>
        <div className="header-info">Design a level, then validate it to unlock sharing.</div>
        <button className="btn-about" onClick={() => setShowAbout(true)} title="About Ricochet">?</button>
      </header>
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      <div className="creator-body">
        <Toolbar state={state} dispatch={dispatch} onTest={handleTest} />
        <BoardCanvas state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
