import { Component } from 'react';

/* ══════════════════════════════════════════════════════════════════════
   ERROR BOUNDARY

   React unmounts the entire tree when a render throws, which is why one
   bad component takes the whole page to blank white in production — in
   development you get an overlay instead, so the failure looks far less
   severe than it is.

   Wrapping each section means a throw costs you that section and nothing
   else: the rest of the page keeps working, and the console still gets
   the real stack.

   Must be a class. There is no hook equivalent for componentDidCatch.
   ══════════════════════════════════════════════════════════════════════ */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    // Kept as console.error on purpose: it is what a deployed site's
    // error reporting picks up, and what shows in a visitor's console.
    console.error(`[${this.props.name || 'section'}] crashed:`, error, info?.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.silent) return null;

    return (
      <div className="eb-fallback" role="status">
        <p>This section didn’t load.</p>
        <button onClick={() => this.setState({ failed: false })}>Try again</button>
      </div>
    );
  }
}
