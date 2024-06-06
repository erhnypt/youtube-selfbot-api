import { chromium } from 'playwright';
import { calculateRequestSize, calculateResponseSize } from "./index.js";

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();

  const page = await context.newPage();

  page.on('request', async (request) => {
    console.log("Request size: " + await calculateRequestSize(request) + " bytes")
  });

  page.on('response', async (response) => {
    console.log("Response size: " + await calculateResponseSize(response) + " bytes")
  });

  await page.goto('https://www.youtube.com');
})();
