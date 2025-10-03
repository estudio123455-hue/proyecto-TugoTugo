import bcrypt from 'bcryptjs'

async function main() {
  const password = 'password123'
  const hash = await bcrypt.hash(password, 10)
  
  console.log('\n🔐 Password Hash:')
  console.log(hash)
  console.log('\n📋 SQL para crear admin en producción:')
  console.log(`
INSERT INTO "User" (id, email, name, password, role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@tuapp.com',
  'Admin',
  '${hash}',
  'ADMIN',
  NOW(),
  NOW(),
  NOW()
);
  `)
}

main()
