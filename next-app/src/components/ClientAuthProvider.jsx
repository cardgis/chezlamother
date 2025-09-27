"use client";
import { AuthProvider } from "@/hooks/useAuth";
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  console.error('Erreur dans ClientAuthProvider:', error);
  
  return (
    <div role="alert" style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
      <h2>Erreur de chargement</h2>
      <details style={{ marginTop: '10px', textAlign: 'left' }}>
        <summary>Détails de l'erreur</summary>
        <pre style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
          {error.message}
        </pre>
      </details>
      <button 
        onClick={resetErrorBoundary} 
        style={{ 
          marginTop: '10px', 
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Réessayer
      </button>
    </div>
  );
}

export default function ClientAuthProvider({ children }) {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('=== ERREUR CLIENT AUTH PROVIDER ===');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('===================================');
      }}
    >
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}