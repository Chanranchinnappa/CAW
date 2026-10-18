// Usage: node worker/hash-password.mjs <username> "<password>"
// Prints the value to put in the STAFF_USERS secret for that person. The password itself is never stored.
import { deriveLoginKey, storedVerifier } from './loginKey.js';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Usage: node worker/hash-password.mjs <username> "<password>"');
  process.exit(1);
}
console.log(JSON.stringify({ [username.toLowerCase()]: await storedVerifier(await deriveLoginKey(username, password)) }));
