#!/usr/bin/env node
/**
 * Generate Secure Secrets for Production
 * 
 * Usage: node generate-secrets.js
 * 
 * Generates secure random strings for:
 * - JWT_SECRET (64 character hex string)
 * - ADMIN_PASSWORD suggestion
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function generateJWTSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function generatePassword(length = 16) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const all = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function main() {
  console.log('\n🔐 Capital Reclaim - Secure Secret Generator');
  console.log('='.repeat(50));
  console.log('\n⚠️  IMPORTANT: Keep these secrets safe!');
  console.log('⚠️  Do NOT commit them to version control!\n');
  
  const jwtSecret = generateJWTSecret();
  const password16 = generatePassword(16);
  const password20 = generatePassword(20);
  
  console.log('\n📋 Generated Secrets:\n');
  console.log('1️⃣  JWT_SECRET (64 characters):');
  console.log(`   ${jwtSecret}\n`);
  
  console.log('2️⃣  ADMIN_PASSWORD (16 characters) - Suggested:');
  console.log(`   ${password16}\n`);
  
  console.log('3️⃣  ADMIN_PASSWORD (20 characters) - Extra secure:');
  console.log(`   ${password20}\n`);
  
  console.log('\n📝 Add to your backend/.env file:\n');
  console.log(`ADMIN_EMAIL=your-admin@yourdomain.com`);
  console.log(`ADMIN_PASSWORD=${password16}`);
  console.log(`JWT_SECRET=${jwtSecret}\n`);
  
  console.log('✅ Copy the values above to your .env file\n');
  
  rl.question('Press Enter to exit...', () => {
    rl.close();
  });
}

main();

