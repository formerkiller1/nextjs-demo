const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.WEBHOOK_SECRET || '';
const APP_DIR = '/srv/nextjs-app';
const LOG_FILE = path.join(APP_DIR, 'webhook.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  console.log(line.trim());
  fs.appendFileSync(LOG_FILE, line);
}

function verifySignature(payload, signature) {
  if (!SECRET) return true;
  const expected = 'sha256=' + crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function deploy() {
  try {
    log('🚀 Starting deployment...');
    execSync('git pull origin master', { cwd: APP_DIR, stdio: 'pipe' });
    log('✅ Code pulled successfully');
    execSync('docker compose up -d --build web', { cwd: APP_DIR, stdio: 'pipe' });
    log('✅ Docker containers rebuilt and started');
    log('🎉 Deployment finished successfully');
  } catch (err) {
    log(`❌ Deployment failed: ${err.message}`);
    throw err;
  }
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405);
    return res.end('Method Not Allowed');
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const sig = req.headers['x-hub-signature-256'] || '';
    if (!verifySignature(body, sig)) {
      log('⚠️ Invalid signature');
      res.writeHead(401);
      return res.end('Invalid signature');
    }

    try {
      const payload = JSON.parse(body);
      const event = req.headers['x-github-event'];
      log(`📩 Received ${event} event from ${payload.repository?.full_name}`);

      if (event === 'push' && payload.ref === 'refs/heads/master') {
        deploy();
        res.writeHead(200);
        res.end('Deployment triggered');
      } else {
        log(`⏭️ Ignored event: ${event} ref=${payload.ref}`);
        res.writeHead(200);
        res.end('Ignored');
      }
    } catch (err) {
      log(`❌ Error: ${err.message}`);
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  });
});

server.listen(PORT, () => log(`🟢 Webhook server listening on port ${PORT}`));