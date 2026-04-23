const https = require('https');

https.get({
  hostname: 'generativelanguage.googleapis.com',
  path: '/v1beta/models',
  headers: { 'x-goog-api-key': 'AIzaSyDOIp3Lb0MZM5F5zW1VBr-iKXYukaUSyC8' }
}, r => {
  let d = '';
  r.on('data', c => d += c);
  r.on('end', () => {
    const j = JSON.parse(d);
    console.log('✅ Available Gemini Models:\n');
    j.models.forEach(m => console.log(`  • ${m.name}`));
  });
});
