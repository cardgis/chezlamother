import { NextResponse } from 'next/server';
import { 
  verifyAccessToken, 
  verifyRefreshToken, 
  generateAccessToken,
  getTokenFromRequest,
  getRefreshTokenFromRequest,
  createAuthCookies 
} from '@/utils/jwt';

export const runtime = "nodejs";

export async function GET(request) {
  try {
    console.log('=== VÉRIFICATION TOKEN ===');
    
    // Debug des headers et cookies
    const cookies = request.headers.get('cookie');
    console.log('Cookies reçus:', cookies);
    
    // Essayer de récupérer l'access token
    const accessToken = getTokenFromRequest(request);
    console.log('Access token extrait:', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
    
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        console.log('✅ Access token valide pour:', payload.email);
        
        return NextResponse.json({
          valid: true,
          user: {
            id: payload.userId,
            email: payload.email,
            role: payload.role
          }
        });
        
      } catch (accessError) {
        console.log('⚠️ Access token expiré ou invalide:', accessError.message);
        
        // Access token expiré, essayer le refresh token
        const refreshToken = getRefreshTokenFromRequest(request);
        console.log('Refresh token extrait:', refreshToken ? refreshToken.substring(0, 20) + '...' : 'null');
        
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
                role: payload.role
              }
            });
            
            // Mettre à jour le cookie access token
            const [accessCookie] = createAuthCookies(newAccessToken, refreshToken);
            response.headers.set('Set-Cookie', accessCookie);
            
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