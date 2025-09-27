import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/utils/jwt';

export const runtime = "nodejs";

export async function POST() {
  try {
    console.log('=== DÉCONNEXION ===');
    
    // Créer la réponse
    const response = NextResponse.json({ 
      success: true,
      message: 'Déconnexion réussie'
    });
    
    // Supprimer les cookies d'authentification avec la méthode NextJS
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    
    console.log('✅ Cookies supprimés');
    console.log('=== FIN DÉCONNEXION ===');
    
    return response;
    
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' }, 
      { status: 500 }
    );
  }
}