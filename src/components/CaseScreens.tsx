import './CaseScreens.css';

/** Elegant, obviously-empty slot for the cases that have no assets yet. */
export function PlaceholderMockup({ index }: { index: string }) {
  return (
    <div className="devices devices--placeholder" aria-hidden="true">
      <div className="devices__slot">
        <span className="devices__slot-index">{index}</span>
        <span className="devices__slot-label">Case study slot</span>
        <span className="devices__slot-hint">Replace with project imagery</span>
        <svg className="devices__slot-grid" viewBox="0 0 100 62" preserveAspectRatio="none">
          <defs>
            <pattern id={`grid-${index}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0 L0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="62" fill={`url(#grid-${index})`} />
        </svg>
      </div>
    </div>
  );
}
