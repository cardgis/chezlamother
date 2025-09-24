export async function GET() {
  try {
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      NEON_PRISMA_URL: process.env.NEON_PRISMA_URL ? 'SET' : 'NOT_SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
      NEON_PGDATABASE: process.env.NEON_PGDATABASE ? 'SET' : 'NOT_SET',
    };

    // Détecter quelle URL est utilisée
    const connectionString = process.env.DATABASE_URL || process.env.NEON_PRISMA_URL || process.env.POSTGRES_URL;
    
    let urlAnalysis = {
      used: 'NONE',
      hostname: 'N/A',
      valid: false,
      actualUrls: {
        DATABASE_URL: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/\/\/.*@/, '//***@') : null,
        NEON_PRISMA_URL: process.env.NEON_PRISMA_URL ? process.env.NEON_PRISMA_URL.replace(/\/\/.*@/, '//***@') : null,
        POSTGRES_URL: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.replace(/\/\/.*@/, '//***@') : null,
      }
    };

    if (connectionString) {
      try {
        const url = new URL(connectionString);
        urlAnalysis = {
          used: process.env.DATABASE_URL ? 'DATABASE_URL' : 
                process.env.NEON_PRISMA_URL ? 'NEON_PRISMA_URL' : 'POSTGRES_URL',
          hostname: url.hostname,
          protocol: url.protocol,
          database: url.pathname,
          valid: true
        };
      } catch (error) {
        urlAnalysis = {
          used: 'INVALID_URL',
          error: error.message,
          connectionString: connectionString.substring(0, 50) + '...',
          valid: false
        };
      }
    }

    return new Response(JSON.stringify({
      success: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      environmentVariables: envVars,
      connectionAnalysis: urlAnalysis,
      message: 'Debug des variables d\'environnement'
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}