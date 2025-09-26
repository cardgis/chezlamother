import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function GET() {
  try {
    const testEmail = 'alexandrenasalan1@outlook.fr'; // Envoi vers votre propre email
    
    console.log('=== TEST EMAIL SIMPLE SENDGRID ===');
    
    // Email simple sans template
    const requestBody = {
      personalizations: [{ 
        to: [{ email: testEmail }]
      }],
      from: { 
        email: "alexandrenasalan1@outlook.fr", 
        name: "Chez La Mother Test" 
      },
      subject: "Test Reset Password - Chez La Mother",
      content: [{
        type: "text/plain",
        value: `
Bonjour,

Ceci est un email de test pour vérifier que SendGrid fonctionne.

Lien de réinitialisation : https://chezlamother.vercel.app/auth/reset-password?token=TEST123

Cordialement,
L'équipe Chez La Mother
        `
      }]
    };
    
    console.log('📧 Envoi email simple:', JSON.stringify(requestBody, null, 2));
    
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Status:', sendGridResponse.status);
    
    const responseText = await sendGridResponse.text();
    console.log('📊 Response:', responseText || 'Empty (normal for 202)');

    return NextResponse.json({
      success: sendGridResponse.ok,
      status: sendGridResponse.status,
      response: responseText || 'Empty response',
      message: 'Email simple envoyé - vérifiez votre boîte alexandrenasalan1@outlook.fr (et spams)',
      testType: 'Simple email without template'
    });
    
  } catch (error) {
    console.error('❌ Erreur test email simple:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}