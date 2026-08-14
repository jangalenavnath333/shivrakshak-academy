const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('npx.cmd tsc --noEmit', { encoding: 'utf-8' });
  fs.writeFileSync('ts_output.txt', output);
} catch (error) {
  fs.writeFileSync('ts_output.txt', error.stdout || error.message);
}
