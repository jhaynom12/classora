const fs = require('fs');
const path = require('path');
const envText = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = envText.split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^#=]+)=\s*['"]?(.*)['"]?$/);
  if (match) acc[match[1].trim()] = match[2].trim();
  return acc;
}, {});
const key = env.GOOGLE_AI_API_KEY;
console.log('apiKey set:', !!key);
if (!key) process.exit(1);
(async () => {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json'
      }
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log(text);
  } catch (err) {
    console.error('fetch err', err.message || err);
  }
})();
