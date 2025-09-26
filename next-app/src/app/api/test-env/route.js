import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('=== TEST ENVIRONNEMENT VERCEL ===');
    console.log('SENDGRID_API_KEY existe:', !!process.env.SENDGRID_API_KEY);
    console.log('SENDGRID_API_KEY début:', process.env.SENDGRID_API_KEY?.substring(0, 10));
    console.log('SENDGRID_API_KEY fin:', process.env.SENDGRID_API_KEY?.substring(-10));
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL existe:', !!process.env.DATABASE_URL);
    console.log('==================================');
    
    // Test rapide SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'test@example.com' }] // Email bidon pour test
        }],
        from: {
          email: 'alexandrenasalan1@outlook.fr',
          name: 'Test'
        },
        subject: 'Test',
        content: [{
          type: 'text/plain',
          value: 'Test'
        }]
      })
    });
    
    console.log('SendGrid Status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.log('SendGrid Error:', errorText);
    }
    
    return NextResponse.json({
      apiKeyExists: !!process.env.SENDGRID_API_KEY,
      apiKeyStart: process.env.SENDGRID_API_KEY?.substring(0, 10),
      sendGridStatus: response.status,
      sendGridOk: response.ok
    });
    
  } catch (error) {
    console.error('Test error:', error.message);
    return NextResponse.json({
      error: error.message
    }, { status: 500 });
  }
}