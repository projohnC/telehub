import { Component } from "react";

/**
 * Prevents a runtime error in any child from turning the whole app into a
 * blank white screen. Renders a small fallback with a reload/home button.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface the error in the console so it's still debuggable.
    console.error("[ErrorBoundary]", error, info);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm opacity-70 mb-6">
            The page hit an unexpected error. You can try reloading or head back home.
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-white text-black text-sm"
            >
              Reload
            </button>
            <a
              href="/"
              onClick={this.handleReset}
              className="px-4 py-2 rounded border border-white/30 text-sm"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
