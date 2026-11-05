import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'state.js']) {
  await copyFile(file, `dist/${file}`);
}
console.log('Build berhasil: dist/');
