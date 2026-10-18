// One-command setup for the staff API.  Run from the project folder:  npm run worker:setup
// It deploys the Worker, makes the session secret itself, and asks you for the staff password
// (typing is hidden). Nothing is printed or saved to a file.
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const isWin = process.platform === 'win32';

const run = (args, { input, capture } = {}) =>
  new Promise((resolve, reject) => {
    const p = spawn(isWin ? 'npx.cmd' : 'npx', ['wrangler', ...args], {
      cwd: here,
      shell: isWin,
      stdio: [input ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit', capture ? 'pipe' : 'inherit'],
    });
    let out = '';
    if (capture) {
      p.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
      p.stderr.on('data', (d) => { out += d; process.stderr.write(d); });
    }
    if (input) p.stdin.end(input);
    p.on('exit', (code) => (code === 0 ? resolve(out) : reject(new Error(`wrangler ${args[0]} failed (exit ${code})`))));
  });

const askHidden = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(question)) process.stdout.write(s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer); });
  });

console.log('\n1/3  Deploying the staff API. If a browser opens, sign in to Cloudflare and approve.\n');
const out = await run(['deploy'], { capture: true });
const url = (out.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/i) || [])[0];

console.log('\n2/3  Creating the session secret.\n');
await run(['secret', 'put', 'SESSION_SECRET'], { input: randomBytes(32).toString('hex') });

console.log('\n3/3  Staff password. Pick a long one. Typing is hidden.\n');
let pw = '';
while (pw.length < 8) {
  pw = (await askHidden('Staff password (8+ characters): ')).trim();
  if (pw.length < 8) console.log('Too short. Try again.');
}
await run(['secret', 'put', 'STAFF_PASSWORD'], { input: pw });

console.log('\nDone.');
if (url) console.log(`Staff API address: ${url}\nMake sure .env.production in the project folder has: VITE_STAFF_API_URL=${url}`);
