// Test du flow complet de réinitialisation de mot de passe
async function testPasswordResetFlow() {
  const testEmail = 'nasalangiscard@gmail.com';
  
  console.log('🧪 TEST DU FLOW RESET PASSWORD COMPLET');
  console.log('=====================================');
  
  try {
    // 1. Test de l'envoi d'email de réinitialisation
    console.log('1️⃣ Test envoi email de réinitialisation...');
    const resetResponse = await fetch('https://chezlamother.vercel.app/api/auth/send-reset-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    const resetData = await resetResponse.json();
    console.log('Response envoi email:', resetData);
    
    if (!resetData.success) {
      console.error('❌ Échec envoi email:', resetData.error);
      return;
    }
    
    console.log('✅ Email de réinitialisation envoyé avec succès');
    
    // 2. Test de validation avec un faux token
    console.log('\n2️⃣ Test validation token invalide...');
    const invalidTokenResponse = await fetch('https://chezlamother.vercel.app/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        token: 'fake-token-123', 
        password: 'NewPassword123!' 
      })
    });
    
    const invalidData = await invalidTokenResponse.json();
    console.log('Response token invalide:', invalidData);
    
    if (invalidData.success) {
      console.error('❌ PROBLÈME: Token invalide accepté!');
    } else {
      console.log('✅ Token invalide correctement rejeté');
    }
    
    console.log('\n🎯 FLOW DE TEST TERMINÉ');
    console.log('📧 Vérifiez maintenant votre email pour tester le vrai lien!');
    
  } catch (error) {
    console.error('❌ Erreur du test:', error);
  }
}

// Lancer le test
testPasswordResetFlow();