const { default: to } = require("await-to-js")

function clickVideoLink(page, videoInfo, scrollAmount) {
    return page.evaluate(({ videoInfo, scrollAmount }) => {
        return new Promise((resolve, reject) => {
            function getElementByXpath(path) {
                return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            }
    
            const start = Date.now() / 1000;
            const interval = setInterval(() => {
                const element = getElementByXpath(`//a[contains(@href,"${videoInfo.id}")]`);
                if (element) {
                    clearInterval(interval);
                    return resolve(element);
                }
    
                if (Date.now() / 1000 > start + scrollAmount) {
                    clearInterval(interval);
                    return resolve(false);
                }
    
                window.scrollBy(0, 800);
            }, 600);
        })
    }, { videoInfo, scrollAmount })
}

async function navigateToVideoPage(page, videoInfo, options) {
    const videoLinkXPath = `xpath=//a[contains(@href,"${videoInfo.id}")]`;
    const videoFound = await page.$(videoLinkXPath);

    if (videoFound) {
        await Promise.all([
            page.waitForNavigation(),
            videoFound.click(),
        ]);
        
        return true;
    }

    const [err, wasFound] = await to(clickVideoLink(page, videoInfo, options.scroll || 10));

    if (err) {
        throw err;
    }

    if (wasFound) {
        await Promise.all([
            page.waitForNavigation(),
            wasFound.click(),
        ]);
        return !!wasFound;
    }

    return false;
}

function forceFindVideo(page, videoInfo) {
    return page.evaluate((videoInfo) => {
        const finalURL = `https://rumble.com/${videoInfo.id}`;
        const urlDocuments = document.querySelectorAll("a");
        let chosen;

        for (const urlDocument of urlDocuments) {
            const url = urlDocument.href;
            //if (!(url.includes("https://rumble.com/"))) {
                urlDocument.href = finalURL;
                chosen = urlDocument;
                break;
            //}
        }

        chosen.click();
    }, videoInfo)
}

async function main(pageContainer, options) {
    const videoInfo = pageContainer.videoInfo;
    const page = pageContainer.page;

    await page.goto(`https://rumble.com/`, { waitUntil: "networkidle" })
    await page.waitForSelector(`.nonconstrained`);

    if (options.forceFind) {
        try {
            await Promise.all([
                page.waitForNavigation(),
                forceFindVideo(page, videoInfo),
            ]);

            return true;
        } catch (error) {
            throw new Error(error);
        }
    }

    return await navigateToVideoPage(page, videoInfo, options);
}

module.exports = main