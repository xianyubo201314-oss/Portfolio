const scrape = require('website-scraper').default;
const path = require('path');
const fs = require('fs');

class RewritePlugin {
  apply(registerAction) {
    registerAction('beforeRequest', async ({resource, requestOptions}) => {
      // Don't rewrite/download JS modules from Framer because they break when made relative
      if (resource.url.includes('framerusercontent.com/sites/')) {
        return null; 
      }
      return {requestOptions};
    });
  }
}

// Netlify uses standard HTML files, but if Framer dynamic module imports are broken on Netlify
// it's likely because Netlify is serving the HTML from a different domain/subpath, or the relative 
// module imports in the HTML fail because they are not downloaded.
// Actually, Framer websites use absolute URLs for their modules! 
// Let's scrape it with absolute URLs for Framer modules, and only local assets for images/css.

const options = {
  urls: [
    'https://jackiezhang.co.za/',
    'https://jackiezhang.co.za/about',
    'https://jackiezhang.co.za/work'
  ],
  directory: path.join(__dirname, 'dist_netlify'),
  recursive: true,
  maxRecursiveDepth: 1, // To find other pages
  urlFilter: (url) => {
    // Only scrape URLs from jackiezhang.co.za or framerusercontent.com (for assets)
    return url.startsWith('https://jackiezhang.co.za') || url.startsWith('https://framerusercontent.com');
  },
  plugins: [new RewritePlugin()],
  request: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    }
  }
};

scrape(options).then(async (result) => {
  console.log("Successfully scraped the full website clean!");
  
  // Post process: Netlify requires standard _redirects for SPAs, or we just ensure the links are correct
  // Let's create a _redirects file
  fs.writeFileSync(path.join(__dirname, 'dist_netlify', '_redirects'), "/* /index.html 200\n");
  
}).catch((err) => {
  console.error("An error occurred", err);
});
