
import * as fs from "fs"
import * as path from "path"
import got from "got"

import { calculateRequestSize, calculateResponseSize } from 'puppeteer-bandwidth-calculator';

import { GenerateFingerprint, LaunchBrowser } from "playwright-anti-fingerprinter";

import pageClass from "./page.js"

import { dirname } from 'path';
import { createRequire } from 'module';

import { fileURLToPath } from 'url';

let __dirname = dirname(fileURLToPath(import.meta.url));
let require = createRequire(import.meta.url);

let extensions = fs.readdirSync(path.join(__dirname, "/defaultExtensions"))
    .map((v) => v = path.join(__dirname, "/defaultExtensions/", v))
    .map((v) => v = require(v))

function fingerprintGenerator() {
    return GenerateFingerprint("firefox", {
        webgl_vendor: (e) => e.includes("Google Inc."),
        webgl_renderer: (e) => true,
        language: (e) => e.includes("en"),
        userAgent: (e) => e.includes("Windows"),
        viewport: (e) => e.width > 1000 && e.height > 800 && e.width < 2000 && e.height < 2000,
        cpu: (e) => e <= 24 && e >= 4,
        memory: (e) => true,
        compatibleMediaMime: (e) => e.audio.includes("aac") && e.video["mp4"] && e.video.mp4.length > 0,
        canvas: (e) => true,
    })
}

async function shouldProxyRequest(page, request) {
    return 2;
    try {
        let acceptedCookies = ["DEVICE_INFO", "VISITOR_INFO1_LIVE", "GPS"]

        let page_url = page.url()
        let url = request.url()
        let currentCookies = await page.context().cookies()
        let type = request.resourceType()

        if (url.startsWith("data:image")) return 1
        if (url.includes("gstatic")) return 1

        let isLoggedIn = false

        for (let cookie of currentCookies) {
            if (acceptedCookies.includes(cookie.name)) {
                isLoggedIn = true
                break
            }
        }

        if (!isLoggedIn && url.includes("googlevideo.com") && !page_url.includes("/shorts/")) return 3

        if (request.method() == "GET") {
            let isDocument = type == "document" || type == "script" || type == "manifest" || type == "stylesheet"

            //if (bannedResourceTypes.includes(type)) return 3
            //if (url.includes("fonts.")) return 3

            if (isDocument && type == "document") return 2
            if (isDocument) return 1
        }

        return 2
    } catch (err) {
        console.error(err)
        return 3
    }
}

class YoutubeSelfbotBrowser {
    opts = {}
    eventStore = {}
    context = {}
    extra = {}
    ipInfo = {}
    #firstPageCreated = false

    constructor(opts, extra) {
        this.opts = opts
        this.extra = extra
    }

    isConnected() { return this.context.isConnected(...arguments) }
    pages() { return this.context.browserContexts(...arguments) }
    process() { return this.context.process(...arguments) }
    target() { return this.context.target(...arguments) }
    targets() { return this.context.targets(...arguments) }
    userAgent() { return this.context.userAgent(...arguments) }
    version() { return this.context.version(...arguments) }
    waitForTarget() { return this.context.waitForTarget(...arguments) }
    wsEndpoint() { return this.context.wsEndpoint(...arguments) }
    close() { return this.context.close(...arguments) }
    addCookies() { return this.context.addCookies(...arguments) }

    async setup() {
        return new Promise(async (resolve, reject) => {
            let fingerprint = this.extra.fingerprint || {
                ...fingerprintGenerator(),
                proxy: this.extra.proxy
            }

            this.fingerprint = fingerprint;

            let opts = {
                ...this.opts,
                ...this.extra,
                serviceWorkers: "block",
                bypassCSP: true,
            }

            const { browser, ipInfo } = await LaunchBrowser("firefox", opts, fingerprint)

            this.browser = browser
            this.context = browser
<<<<<<< HEAD
=======
            //this.context = await browser.newContext(opts)
>>>>>>> 1b511ef864a1fdc96550b893b373c4ecc4a19212
            this.ipInfo = ipInfo

            this.context.setDefaultTimeout(this.extra.timeout)
            this.context.setDefaultNavigationTimeout(this.extra.timeout)

            //await (await this.context.newPage()).goto("about:blank") // making initial page

            for (let extension of extensions) {
                if (await extension.verify(this.extra)) {
                    await this.context.addInitScript(extension.code).catch(reject)
                }
            }

            await this.context.addInitScript(() => {
                localStorage.setItem('volume', `0`);
            }).catch(reject)

            resolve()
        })
    }

    clearStorage() {
        return new Promise(async (resolve, reject) => {
            try {
                const [page] = await Promise.all([
                    this.context.waitForEvent('page'),
                    (await this.context.pages())[0].evaluate(() => window.open('about:blank'))
                ]);
                //const page = await this.context.newPage()

                await page.context().clearCookies();

                await page.goto("https://www.rumble.com");
                await page.evaluate(() => localStorage.clear());

                await page.close();

                resolve();
            } catch (err) {
                reject(err);
            }
        })
    }

    on(name, event) {
        this.eventStore[name] = event
    }

    emit() {
        let args = Object.values(arguments)

        let name = args.shift()
        let event = this.eventStore[name]

        if (event) {
            event(...args)
        }
    }

    async newPage() {
        const [page] = await Promise.all([
            this.context.waitForEvent('page'),
            (await this.context.pages())[0].evaluate(() => window.open('about:blank'))
        ]);

        //const page = await this.context.newPage()

        if (!this.#firstPageCreated) {
            this.#firstPageCreated = true;
            (await this.context.pages())[0].close()
        }

        let pgClass = new pageClass(page, this.extra, this)
        await pgClass.initPage()

        page.on("response", async (res) => {
            let req = res.request()
            let url = await req.url()

            let isVideo = url.includes("hugh.cdn.rumble.cloud/video") || url.includes("hugh.cdn.rumble.cloud/live")

            if (isVideo) {
                if (pgClass.__onContinue) {
                    pgClass.__onContinue()
                    pgClass.__onContinue = undefined
                }
            }

            let shouldCalculateRequestSize = await shouldProxyRequest(page, req) == 2

            if (shouldCalculateRequestSize) {
                this.emit("bandwith", pgClass.id, "download", await calculateRequestSize(req))
                this.emit("bandwith", pgClass.id, "upload", await calculateResponseSize(res))
            }
        })

        return pgClass
    }
}

export default YoutubeSelfbotBrowser;