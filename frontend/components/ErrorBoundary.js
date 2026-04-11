import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`ErrorBoundary caught an error in ${this.props.componentName || "Component"}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <div className="font-semibold mb-1">Error Rendering {this.props.componentName || "Component"}</div>
          <div className="text-xs break-words opacity-80">{this.state.error?.message || "An unknown library error occurred."}</div>
        </div>
      );
    }

    return this.props.children;
  }
}
