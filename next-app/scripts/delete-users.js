// Script pour supprimer Alex et Nasalan de la base de données
import { Pool } from 'pg';

// URL Neon directe
const NEON_DB_URL = 'postgres://default:UpPh5bCk6iSZ@ep-snowy-union-a4t26bx0-pooler.us-east-1.aws.neon.tech/verceldb?pgbouncer=true&connect_timeout=15&sslmode=require';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
});

async function deleteUsers() {
  console.log('🗑️ Suppression des utilisateurs Alex et Nasalan...\n');

  try {
    const client = await pool.connect();
    
    // Afficher les utilisateurs avant suppression
    console.log('👥 Utilisateurs avant suppression:');
    const beforeResult = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
    beforeResult.rows.forEach(user => {
      console.log(`  - ID: ${user.id} | ${user.name} (${user.email}) | Rôle: ${user.role}`);
    });
    
    // Supprimer Alex et Nasalan
    const deleteResult = await client.query(`
      DELETE FROM users 
      WHERE email IN ($1, $2)
      RETURNING id, name, email
    `, ['alex@chezlamother.sn', 'nasalan@example.com']);
    
    console.log('\n✅ Utilisateurs supprimés:');
    deleteResult.rows.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });
    
    // Afficher les utilisateurs restants
    console.log('\n👥 Utilisateurs restants:');
    const afterResult = await client.query('SELECT id, name, email, role FROM users ORDER BY id');
    if (afterResult.rows.length === 0) {
      console.log('  - Aucun utilisateur dans la base de données');
    } else {
      afterResult.rows.forEach(user => {
        console.log(`  - ID: ${user.id} | ${user.name} (${user.email}) | Rôle: ${user.role}`);
      });
    }
    
    client.release();
    
    console.log('\n🎯 Prochaines étapes:');
    console.log('1. Allez sur https://chezlamother.sn/auth/register');
    console.log('2. Inscrivez-vous avec vos vrais identifiants');
    console.log('3. Connectez-vous ensuite sur /auth/login');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

deleteUsers().then(() => {
  console.log('\n✅ Suppression terminée');
  process.exit(0);
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});