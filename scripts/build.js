const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');

async function build() {
  await fs.mkdir(output, { recursive: true });
  await fs.copyFile(path.join(root, 'server.js'), path.join(output, 'server.js'));
  await fs.cp(path.join(root, 'public'), path.join(output, 'public'), { recursive: true, force: true });
  console.log('Built SFY into dist/. Run it with npm run start:prod.');
}

build().catch((error) => {
  console.error('SFY build failed:', error);
  process.exitCode = 1;
});
