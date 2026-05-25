import { QRCodeSVG } from 'qrcode.react'
import type { SimResult } from '../types/index.js'

// I — Interface Segregation: only the props this component actually renders
interface ResultOverlayProps {
  result: SimResult;
  maxRicochets: number;
  isTestMode: boolean;
  onReset: () => void;
  onBackToEditor?: () => void;
  onShare?: () => void;
  shareUrl?: string | null;
  copied?: boolean;
  remixUrl?: string | null;
}

export default function ResultOverlay({
  result,
  maxRicochets,
  isTestMode,
  onReset,
  onBackToEditor,
  onShare,
  shareUrl,
  copied,
  remixUrl,
}: ResultOverlayProps) {
  const won = result.outcome === 'win';

  return (
    <div className={`result-overlay ${won ? 'win' : 'lose'}`}>
      <div className="result-card">
        <div className="result-title">{won ? 'Target Hit!' : 'Out of Ricochets!'}</div>
        <div className="result-detail">
          {result.ricochetCount} / {maxRicochets} ricochets used
        </div>
        {isTestMode && won && shareUrl && (
          <div className="share-section">
            <div className="share-block">
              <input className="share-url" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <button className="btn btn-share-game" onClick={onShare}>
                {copied ? 'Copied!' : 'Copy URL'}
              </button>
            </div>
            <div className="qr-container">
              <QRCodeSVG value={shareUrl} size={256} bgColor="#ffffff" fgColor="#0d0f14" level="M" />
            </div>
          </div>
        )}
        <div className="result-actions">
          <button className="btn btn-retry" onClick={onReset}>Try Again</button>
          {onBackToEditor && (
            <button className="btn btn-edit" onClick={onBackToEditor}>✏ Edit</button>
          )}
        </div>
        {!isTestMode && (
          <div className="make-your-own">
            <p className="make-your-own-label">Want to create your own puzzle?</p>
            <div className="make-your-own-actions">
              <a href={remixUrl ?? '/'} className="btn btn-remix">Remix this level</a>
              <a href="/" className="btn btn-back">Start fresh</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
