# Bandwidth Usage Monitoring with Puppeteer and Playwright

This script allows you to monitor the bandwidth usage in bytes for HTTP requests and responses using Puppeteer and Playwright. It provides functions to calculate the size of HTTP request and response messages.

## Usage

### Installation

First, make sure you have Node.js installed on your system.

To install the necessary dependencies, run:

```bash
npm install puppeteer   # For Puppeteer
# OR
npm install playwright  # For Playwright
```

### Functions

# calculateRequestSize(request)
request: The Puppeteer or Playwright request object.

Calculates the size of an HTTP request message.

# calculateResponseSize(response)
response: The Puppeteer or Playwright response object.

Calculates the size of an HTTP response message.


Please note that the functions may not account for all possible variations in HTTP messages and may provide approximate sizes.

### Example usage

Using Puppeteer

```js
import puppeteer from 'puppeteer';
import { calculateRequestSize, calculateResponseSize } from 'puppeteer-bandwidth-calculator';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('request', async (request) => {
    const requestSize = await calculateRequestSize(request);

    console.log(`Request Size: ${requestSize} bytes`);
  });

  page.on('response', async (response) => {

    console.log(`Response Size: ${responseSize} bytes`);
  });

  await page.goto('https://www.youtube.com');

  await browser.close();
})();

```

Using Playwright

```js
// Can use chromium, firefox and WebKit

import { chromium } from 'playwright';
import { calculateRequestSize, calculateResponseSize } from 'puppeteer-bandwidth-calculator';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('request', async (request) => {
    const requestSize = await calculateRequestSize(request);

    console.log(`Request Size: ${requestSize} bytes`);
  });

  page.on('response', async (response) => {
    
    console.log(`Response Size: ${responseSize} bytes`);
  });

  await page.goto('https://www.youtube.com');

  await browser.close();
})();
```