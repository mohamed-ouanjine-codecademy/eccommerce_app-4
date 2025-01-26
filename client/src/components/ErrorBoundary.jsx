// /client/src/components/ErrorBoundary.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary:', error, errorInfo);
    // Add Sentry/Rollbar integration here
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4">
          <Alert variant="danger">
            <h3>Something went wrong</h3>
            <p>We're working to fix this issue. Please try again later.</p>
            <Button onClick={this.handleReset}>Try Again</Button>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component-specific boundary
export const withErrorBoundary = (Component) => (props) => (
  <ErrorBoundary>
    <Component {...props} />
  </ErrorBoundary>
);