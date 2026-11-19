/** The card around the sign-in, forgot and reset screens. */
export function AuthCard({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="login">
      <div className="login-card">
        <div className="login-mark" aria-hidden>
          <svg viewBox="0 0 120 120" width="64" height="64">
            <path d="M60 6 L106 22 V60 C106 88 86 106 60 114 C34 106 14 88 14 60 V22 Z" fill="currentColor" />
            <path d="M60 30 l4.4 9 9.9 1.4 -7.2 7 1.7 9.8 -8.8 -4.6 -8.8 4.6 1.7 -9.8 -7.2 -7 9.9 -1.4 z" fill="var(--gold)" />
          </svg>
        </div>
        <h1>{title}</h1>
        <p className="muted">{note}</p>
        {children}
      </div>
    </div>
  );
}
