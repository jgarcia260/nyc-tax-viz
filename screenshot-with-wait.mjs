import puppeteer from 'puppeteer';

const url = process.argv[2];
const outputPath = process.argv[3];
const waitTime = parseInt(process.argv[4] || '10000');

console.log(`📸 Screenshotting: ${url}`);
console.log(`⏱️  Waiting ${waitTime}ms for content to load...`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });

// Listen for console messages
page.on('console', msg => console.log('PAGE LOG:', msg.text()));

await page.goto(url, { waitUntil: 'networkidle0' });

// Wait for the specified time
await page.waitForTimeout(waitTime);

await page.screenshot({ path: outputPath, fullPage: false });
await browser.close();

console.log(`✅ Screenshot saved to: ${outputPath}`);
