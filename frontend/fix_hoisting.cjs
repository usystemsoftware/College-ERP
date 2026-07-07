const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Fix: const fetchSomething = async () => {
  // to: async function fetchSomething() {
  const regex = /const\s+([a-zA-Z0-9_]+)\s*=\s*async\s*\(([^)]*)\)\s*=>\s*\{/g;
  if (regex.test(content)) {
    content = content.replace(regex, 'async function $1($2) {');
    changed = true;
  }

  // Also fix non-async: const getSomething = () => {
  // to: function getSomething() {
  // Wait, that might match too many things like inline click handlers if they are named, but usually they are on one line.
  // We'll just stick to the specific ones that were reported: fetchCategories, fetchData, fetchDashboard, fetchResults, fetchFaculties, fetchMyIncidents, fetchConsentStatus, fetchStudents.
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed hoisted async functions in:', file);
  }
});
