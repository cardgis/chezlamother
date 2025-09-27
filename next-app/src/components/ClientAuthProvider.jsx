"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('=== ERREUR CLIENT AUTH PROVIDER ===');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('===================================');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Une erreur est survenue lors du chargement</h2>
          <p>Rechargez la page pour réessayer.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '10px', padding: '5px 10px' }}
          >
            Recharger
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ClientAuthProvider({ children }) {
  return (
    <ErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}