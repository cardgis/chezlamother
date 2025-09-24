// Script pour récupérer les utilisateurs existants et les recréer
import { Pool } from 'pg';

// URL Neon directe (même configuration que les autres APIs)
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function checkAndRecoverUsers() {
  console.log('🔍 Vérification des utilisateurs dans la base de données...\n');

  try {
    const client = await pool.connect();
    
    // Vérifier la structure de la table users
    console.log('📋 Structure de la table users:');
    const structure = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Récupérer tous les utilisateurs existants
    console.log('\n👥 Utilisateurs existants:');
    const users = await client.query('SELECT id, name, email, role, phone, "createdAt" FROM users ORDER BY id');
    
    if (users.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      
      // Créer les utilisateurs par défaut
      console.log('\n🔧 Création des utilisateurs par défaut...');
      
      // Alex - Admin
      const alexResult = await client.query(`
        INSERT INTO users (name, email, password, role, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role
      `, [
        'Alex',
        'alex@chezlamother.sn', 
        '$2b$10$example.hash.for.demo.password', // Hash temporaire - vous devrez le changer
        'admin',
        '+221701234567'
      ]);
      
      console.log('✅ Admin créé:', alexResult.rows[0]);
      
      // Nasalan - User  
      const nasalanResult = await client.query(`
        INSERT INTO users (name, email, password, role, phone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role
      `, [
        'Nasalan',
        'nasalan@example.com',
        '$2b$10$example.hash.for.demo.password', // Hash temporaire - vous devrez le changer
        'client',
        '+221701234568'
      ]);
      
      console.log('✅ User créé:', nasalanResult.rows[0]);
      
    } else {
      console.log(`📊 ${users.rows.length} utilisateur(s) trouvé(s):`);
      users.rows.forEach(user => {
        console.log(`  - ID: ${user.id} | ${user.name} (${user.email}) | Rôle: ${user.role} | Créé: ${user.createdAt}`);
      });
    }
    
    client.release();
    
    console.log('\n🔐 Instructions pour l\'authentification:');
    console.log('1. Les mots de passe doivent être hashés avec bcrypt');
    console.log('2. Vérifiez que les APIs auth utilisent la même connexion PostgreSQL');
    console.log('3. Testez sur /auth/login avec les identifiants corrects');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Détails:', error.message);
  }
}

checkAndRecoverUsers().then(() => {
  console.log('\n✅ Vérification terminée');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});