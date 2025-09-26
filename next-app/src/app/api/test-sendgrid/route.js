import { NextResponse } from 'next/server';

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    console.log('=== TEST EMAIL SENDGRID ===');
    console.log('Email destinataire:', email);
    
    const templateId = "d-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf";
    const testUrl = "https://chezlamother.vercel.app/test-reset";
    
    const requestBody = {
      personalizations: [{ 
        to: [{ email: email }],
        dynamic_template_data: {
          resetUrl: testUrl,
          userEmail: email,
          userName: email.split('@')[0],
          siteName: "Chez La Mother"
        }
      }],
      from: { 
        email: "alexandrenasalan1@outlook.fr", 
        name: "Chez La Mother" 
      },
      template_id: templateId
    };
    
    console.log('📧 Payload SendGrid:', JSON.stringify(requestBody, null, 2));
    
    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Status:', sendGridResponse.status);
    console.log('📊 Headers:', JSON.stringify(Object.fromEntries(sendGridResponse.headers.entries()), null, 2));
    
    const responseText = await sendGridResponse.text();
    console.log('📊 Response:', responseText || 'Empty (normal for 202)');

    return NextResponse.json({
      success: sendGridResponse.ok,
      status: sendGridResponse.status,
      response: responseText || 'Empty response',
      payload: requestBody
    });
    
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  // Test rapide avec un email par défaut
  const testEmail = 'nasalangiscard@gmail.com';
  
  try {
    console.log('=== TEST EMAIL SENDGRID (GET) ===');
    console.log('Email destinataire:', testEmail);
    
    const templateId = "d-4a2f20d2dfac4ed4b3c0f2d85bf5d2cf";
    const testUrl = "https://chezlamother.vercel.app/test-reset";
    
    const requestBody = {
      personalizations: [{ 
        to: [{ email: testEmail }],
        dynamic_template_data: {
          resetUrl: testUrl,
          userEmail: testEmail,
          userName: testEmail.split('@')[0],
          siteName: "Chez La Mother"
        }
      }],
      from: { 
        email: "alexandrenasalan1@outlook.fr", 
        name: "Chez La Mother" 
      },
      template_id: templateId
    };
    
    console.log('📧 Payload SendGrid:', JSON.stringify(requestBody, null, 2));
    
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
      payload: requestBody,
      accountType: 'Free account limitations may apply',
      possibleIssues: [
        'Template ID might not exist',
        'Sender email not verified in SendGrid',
        'Daily sending limit reached (100 emails/day for free)',
        'Domain authentication required',
        'Email landing in spam folder'
      ]
    });
    
  } catch (error) {
    console.error('❌ Erreur test email:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}