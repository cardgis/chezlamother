import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  verifyAccessToken, 
  verifyRefreshToken, 
  generateAccessToken
} from '@/utils/jwt';

export const runtime = "nodejs";

export async function GET(request) {
  try {
    console.log('=== VÉRIFICATION TOKEN ===');
    
    // Récupérer les cookies avec la méthode NextJS
    const cookieStore = await cookies();
    
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    console.log('Access token extrait:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    console.log('Refresh token extrait:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');
    
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        console.log('✅ Access token valide pour:', payload.email);
        
        return NextResponse.json({
          valid: true,
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role,
            name: payload.name || null
          }
        });
        
      } catch (accessError) {
        console.log('⚠️ Access token expiré ou invalide:', accessError.message);
        
        // Access token expiré, essayer le refresh token
        if (refreshToken) {
          try {
            const payload = verifyRefreshToken(refreshToken);
            console.log('✅ Refresh token valide, génération nouveau access token...');
            
            // Générer un nouvel access token
            const newAccessToken = generateAccessToken({
              userId: payload.userId,
              email: payload.email,
              role: payload.role
            });
            
            const response = NextResponse.json({
              valid: true,
              refreshed: true,
              user: {
                id: payload.userId,
                email: payload.email,
                role: payload.role,
                name: payload.name || null
              }
            });
            
            // Mettre à jour le cookie access token
            const isProduction = process.env.NODE_ENV === 'production';
            response.cookies.set('accessToken', newAccessToken, {
              httpOnly: true,
              secure: isProduction,
              sameSite: 'lax',
              path: '/',
              maxAge: 30 * 60, // 30 minutes
            });
            
            console.log('✅ Token rafraîchi pour:', payload.email);
            console.log('=== FIN VÉRIFICATION TOKEN ===');
            
            return response;
            
          } catch (refreshError) {
            console.log('❌ Refresh token invalide ou expiré');
          }
        }
      }
    }
    
    console.log('❌ Aucun token valide trouvé');
    console.log('=== FIN VÉRIFICATION TOKEN ===');
    
    return NextResponse.json({
      valid: false,
      message: 'Non authentifié'
    }, { status: 401 });
    
  } catch (error) {
    console.error('=== ERREUR VÉRIFICATION TOKEN ===');
    console.error('Message:', error.message);
    console.error('==================================');
    
    return NextResponse.json({
      valid: false,
      error: 'Erreur lors de la vérification'
    }, { status: 500 });
  }
}