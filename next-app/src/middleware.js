import { NextResponse } from 'next/server';

export function middleware(request) {
  // Ajouter les headers CORS pour les cookies
  const response = NextResponse.next();
  
  // Permettre les credentials dans les réponses
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  // Debug des cookies dans le middleware
  const cookies = request.headers.get('cookie');
  if (cookies && cookies.includes('accessToken')) {
    console.log('🍪 Middleware: Cookies JWT détectés');
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*'
};