interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="about-card" onClick={(e) => e.stopPropagation()}>
        <button className="about-close" onClick={onClose} aria-label="Close">✕</button>

        <img src="/logo.png" alt="Ricochet" className="about-logo" />
        <p className="about-tagline">Design a puzzle. Share it. See if they can solve it.</p>

        <section className="about-section">
          <h2>What is this?</h2>
          <p>
            Ricochet is a physics puzzle game. A <strong>creator</strong> places geometric
            obstacles and a target on a board, sets a maximum number of bounces, then shares a
            link. The <strong>player</strong> picks a starting point on the wall, adjusts the
            launch angle, and fires - trying to hit the target before running out of ricochets.
          </p>
        </section>

        <section className="about-section">
          <h2>Creating a level</h2>
          <ul>
            <li>Pick a <strong>tool</strong> from the left panel - Rectangle, Triangle, or Circle.</li>
            <li><strong>Click and drag</strong> on the board to place a shape.</li>
            <li><strong>Click a shape</strong> to select it, then drag its handles to resize or rotate.</li>
            <li>Use the <strong>Move Target</strong> tool to place the bullseye anywhere.</li>
            <li>Set <strong>Max Ricochets</strong> to control difficulty.</li>
            <li>Restrict <strong>Starting Walls</strong> to limit where the player can begin.</li>
            <li>Hit <strong>Test &amp; Share</strong>, solve your own puzzle, then copy the share link from the result screen.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Playing a level</h2>
          <ul>
            <li>Drag the <strong>S handle</strong> along the highlighted wall to choose your start point.</li>
            <li>Drag the <strong>arrow</strong> or click anywhere on the board to aim.</li>
            <li>Press <strong>Fire!</strong> - the ball travels in a straight line until it hits something.</li>
            <li>Hit the bullseye to win. Exceed the ricochet limit and you lose.</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Physics</h2>
          <p>
            The ball reflects using the standard mirror formula -
            <em> r = d − 2(d·n)n</em> - where <em>d</em> is the incoming direction and <em>n</em> is
            the surface normal. Every direction change (off a wall or a shape) counts as one
            ricochet. Corner hits average the two surface normals and count as a single ricochet.
          </p>
        </section>

        <section className="about-section about-section--last">
          <h2>Keyboard shortcuts</h2>
          <div className="about-keys">
            <span className="key">Del</span><span>Remove selected shape</span>
            <span className="key">Ctrl C</span><span>Copy selected shape</span>
            <span className="key">Ctrl V</span><span>Paste copied shape</span>
            <span className="key">Ctrl Z</span><span>Undo last action</span>
            <span className="key">Esc</span><span>Deselect / cancel</span>
          </div>
        </section>
      </div>
    </div>
  );
}
