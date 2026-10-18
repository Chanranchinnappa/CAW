import React from 'react';

interface Props {
  children: React.ReactNode;
  /** What failed, shown to the person (for example "The staff portal"). */
  label: string;
  onReset?: () => void;
}

/** Keeps one broken panel from blanking the whole site. */
export class ErrorBoundary extends React.Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`${this.props.label} crashed`, error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="m-6 rounded-xl border border-[color:var(--t-borderstrong)] bg-[color:var(--t-panel)] p-6 text-sm text-[color:var(--t-fg2)]">
        <p className="font-semibold text-[color:var(--t-fg)]">{this.props.label} hit a problem.</p>
        <p className="mt-1 text-[color:var(--t-muted)]">Nothing you saved was lost. Try again, or reload the page.</p>
        <button
          onClick={() => {
            this.setState({ failed: false });
            this.props.onReset?.();
          }}
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-black hover:bg-amber-400"
        >
          Try again
        </button>
      </div>
    );
  }
}
