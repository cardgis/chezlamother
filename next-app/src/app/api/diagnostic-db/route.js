import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('=== DIAGNOSTIC DATABASE_URL ===');
    
    const dbUrl = process.env.DATABASE_URL;
    console.log('DATABASE_URL existe:', !!dbUrl);
    console.log('DATABASE_URL longueur:', dbUrl?.length || 0);
    
    if (dbUrl) {
      // Masquer le mot de passe pour la sécurité
      const safeUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
      console.log('DATABASE_URL (sécurisée):', safeUrl);
      
      // Analyser l'URL
      try {
        const url = new URL(dbUrl.startsWith('postgres://') ? dbUrl : 'postgresql://' + dbUrl);
        console.log('Host:', url.hostname);
        console.log('Port:', url.port);
        console.log('Database:', url.pathname);
        console.log('Protocol:', url.protocol);
        
        return NextResponse.json({
          status: 'URL_PARSED',
          host: url.hostname,
          port: url.port || '5432',
          database: url.pathname,
          protocol: url.protocol,
          safeUrl: safeUrl
        });
        
      } catch (urlError) {
        console.error('Erreur parsing URL:', urlError.message);
        return NextResponse.json({
          status: 'URL_INVALID',
          error: urlError.message,
          safeUrl: safeUrl
        });
      }
    } else {
      console.log('❌ DATABASE_URL manquante');
      return NextResponse.json({
        status: 'MISSING',
        error: 'DATABASE_URL non configurée'
      });
    }
    
  } catch (error) {
    console.error('Erreur diagnostic:', error.message);
    return NextResponse.json({
      status: 'ERROR',
      error: error.message
    }, { status: 500 });
  }
}