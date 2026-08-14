const { execSync } = require('child_process');
const fs = require('fs');
try {
  const output = execSync('npx.cmd next lint', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('lint_output.txt', output);
} catch (error) {
  fs.writeFileSync('lint_output.txt', error.stdout || error.message);
}
