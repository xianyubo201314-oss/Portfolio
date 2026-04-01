const scrape = require('website-scraper').default;
const PuppeteerPlugin = require('website-scraper-puppeteer');
const path = require('path');

class MyPlugin {
  apply(registerAction) {
    registerAction('beforeRequest', async ({resource, requestOptions}) => {
      // Allow framer modules to be requested
      return {requestOptions};
    });

    registerAction('generateFilename', ({resource}) => {
      // By default it might rename framer files to weird paths
      // Keep everything in a flat assets folder or keep original extension
      const url = new URL(resource.url);
      const ext = path.extname(url.pathname) || '.html';
      const basename = path.basename(url.pathname, ext);
      
      if (resource.url.includes('framerusercontent.com/sites/')) {
        return { filename: `js/${basename}${ext}` };
      }
      return null; // use default
    });
  }
}

const options = {
  urls: [
    'https://jackiezhang.co.za/',
    'https://jackiezhang.co.za/about',
    'https://jackiezhang.co.za/work'
  ],
  directory: path.join(__dirname, 'dist_latest'),
  recursive: true,
  maxRecursiveDepth: 1,
  urlFilter: (url) => {
    // Also scrape the scripts
    return url.startsWith('https://jackiezhang.co.za') || url.startsWith('https://framerusercontent.com');
  },
  plugins: [
    new PuppeteerPlugin({
      launchOptions: { headless: 'new' },
      scrollToBottom: { timeout: 10000, viewportN: 10 } 
    })
  ]
};

scrape(options).then((result) => {
  console.log("Successfully scraped with puppeteer!");
}).catch((err) => {
  console.error("An error occurred", err);
});
