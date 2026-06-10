const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const original = content;
      // Change `const fetchSomething = async () => {` to `async function fetchSomething() {`
      content = content.replace(/const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(\)\s*=>\s*\{/g, 'async function $1() {');
      
      // Change `const fetchSomething = () => {` to `function fetchSomething() {` (only if it starts with fetch to be safe, or just everything?)
      // Actually, many React components are `const MyComponent = () => {`. We ONLY want to replace lowercase functions to avoid breaking components.
      content = content.replace(/const\s+([a-z][a-zA-Z0-9_]+)\s*=\s*async\s*\(\)\s*=>\s*\{/g, 'async function $1() {');
      
      // Let's specifically target fetch* and get* and load*
      content = content.replace(/const\s+((?:fetch|get|load|handle)[a-zA-Z0-9_]*)\s*=\s*async\s*\(\)\s*=>\s*\{/g, 'async function $1() {');
      content = content.replace(/const\s+((?:fetch|get|load)[a-zA-Z0-9_]*)\s*=\s*\(\)\s*=>\s*\{/g, 'function $1() {');
      
      if (original !== content) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
