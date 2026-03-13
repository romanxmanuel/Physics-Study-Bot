import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';

const indexPath = fileURLToPath(new URL('./index.html', import.meta.url));
const html = readFileSync(indexPath, 'utf8');

writeFileSync(indexPath, html, 'utf8');
console.log('index.html preserved. The current source of truth is index.html itself.');
