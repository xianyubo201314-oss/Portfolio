const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'dist_netlify');
const files = fs.readdirSync(dir);

// For Netlify, the scraper saved about as `index_1.html` and work as `index_2.html`
// Netlify expects standard paths, so we'll rename them to about.html and work.html
// And rewrite the links inside all HTML files to point to /about and /work instead of index_1.html and index_2.html

let aboutFile = 'index_1.html';
let workFile = 'index_2.html';

// Actually, let's figure out which one is which
const content1 = fs.readFileSync(path.join(dir, 'index_1.html'), 'utf8');
const content2 = fs.readFileSync(path.join(dir, 'index_2.html'), 'utf8');

if (content1.includes('framerusercontent.com/sites/684hnbMBXBVbej1PQ2QXEz/kBRZh4Rf5')) {
    // index_1 is about
    aboutFile = 'index_1.html';
    workFile = 'index_2.html';
} else {
    aboutFile = 'index_2.html';
    workFile = 'index_1.html';
}

console.log(`Renaming ${aboutFile} to about.html`);
fs.renameSync(path.join(dir, aboutFile), path.join(dir, 'about.html'));

console.log(`Renaming ${workFile} to work.html`);
fs.renameSync(path.join(dir, workFile), path.join(dir, 'work.html'));

const htmlFiles = ['index.html', 'about.html', 'work.html'];

for (const file of htmlFiles) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace relative links that website-scraper made
    content = content.replace(new RegExp(aboutFile, 'g'), '/about');
    content = content.replace(new RegExp(workFile, 'g'), '/work');
    content = content.replace(/href="index\.html"/g, 'href="/"');
    
    fs.writeFileSync(filePath, content);
}

console.log('Fixed paths for Netlify!');
