import puppeteer from "puppeteer";
import { calculateRequestSize, calculateResponseSize } from "./index.js";

(async () => {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  page.on('request', async (request) => {
    console.log("Request size: " + await calculateRequestSize(request) + " bytes")
  });

  page.on('response', async (response) => {
    console.log("Response size: " + await calculateResponseSize(response) + " bytes")
  });

  await page.goto('https://www.youtube.com');
})();
