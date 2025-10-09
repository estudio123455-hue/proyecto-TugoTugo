// Script para generar NEXTAUTH_SECRET
const crypto = require('crypto');

const secret = crypto.randomBytes(32).toString('base64');

console.log('\n===========================================');
console.log('NEXTAUTH_SECRET generado:');
console.log('===========================================\n');
console.log(secret);
console.log('\n===========================================');
console.log('Copia este valor y agrégalo a tu archivo .env.local:');
console.log('NEXTAUTH_SECRET="' + secret + '"');
console.log('===========================================\n');
