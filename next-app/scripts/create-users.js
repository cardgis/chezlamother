// Script pour créer Alex (admin) et Nasalan (user) avec mots de passe sécurisés
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// URL Neon directe
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

async function createUsers() {
  console.log('🔐 Création des utilisateurs avec mots de passe hashés...\n');

  try {
    const client = await pool.connect();
    
    // Supprimer les utilisateurs existants si présents
    await client.query('DELETE FROM users WHERE email IN ($1, $2)', [
      'alex@chezlamother.sn',
      'nasalan@example.com'
    ]);
    
    console.log('🧹 Anciens utilisateurs supprimés');
    
    // Hasher les mots de passe
    const alexPassword = await bcrypt.hash('Admin123!', 12);
    const nasalanPassword = await bcrypt.hash('User123!', 12);
    
    console.log('🔒 Mots de passe hashés générés');
    
    // Créer Alex (Admin)
    const alexResult = await client.query(`
      INSERT INTO users (name, email, password, role, phone, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, role, phone
    `, [
      'Alex',
      'alex@chezlamother.sn',
      alexPassword,
      'admin',
      '+221701234567'
    ]);
    
    console.log('✅ Admin Alex créé:', {
      ...alexResult.rows[0],
      credentials: 'alex@chezlamother.sn / Admin123!'
    });
    
    // Créer Nasalan (User)
    const nasalanResult = await client.query(`
      INSERT INTO users (name, email, password, role, phone, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, name, email, role, phone
    `, [
      'Nasalan',
      'nasalan@example.com',
      nasalanPassword,
      'client',
      '+221701234568'
    ]);
    
    console.log('✅ User Nasalan créé:', {
      ...nasalanResult.rows[0],
      credentials: 'nasalan@example.com / User123!'
    });
    
    client.release();
    
    console.log('\n🎯 Identifiants de connexion:');
    console.log('👨‍💼 ADMIN Alex:');
    console.log('   Email: alex@chezlamother.sn');
    console.log('   Password: Admin123!');
    console.log('');
    console.log('👤 USER Nasalan:');
    console.log('   Email: nasalan@example.com');
    console.log('   Password: User123!');
    console.log('');
    console.log('🔗 Testez sur: https://chezlamother.sn/auth/login');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createUsers().then(() => {
  console.log('\n✅ Création des utilisateurs terminée');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});