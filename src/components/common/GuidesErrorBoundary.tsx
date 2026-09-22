import { Component, type ErrorInfo, type ReactNode } from 'react';
import logger from '../../utils/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class GuidesErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Guides error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ maxWidth: 720, margin: '80px auto', padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Unable to load this guide</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Refresh the page to try again.</p>
          <button type="button" onClick={() => window.location.reload()}>Reload</button>
        </main>
      );
    }
    return this.props.children;
  }
}
