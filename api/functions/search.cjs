const { default: to } = require("await-to-js")

/*let filter_paths = {
    upload_date: {
        last_hour: `ytd-search-filter-group-renderer.style-scope:nth-child(1) > ytd-search-filter-renderer:nth-child(2) > a`,
        today: `ytd-search-filter-group-renderer.style-scope:nth-child(1) > ytd-search-filter-renderer:nth-child(4) > a`,
        this_week: `ytd-search-filter-group-renderer.style-scope:nth-child(1) > ytd-search-filter-renderer:nth-child(6) > a`,
        this_month: `ytd-search-filter-group-renderer.style-scope:nth-child(1) > ytd-search-filter-renderer:nth-child(8) > a`,
        this_year: `ytd-search-filter-group-renderer.style-scope:nth-child(1) > ytd-search-filter-renderer:nth-child(10) > a`,
    },
    license: {
        video: `ytd-search-filter-group-renderer.style-scope:nth-child(2) > ytd-search-filter-renderer:nth-child(2) > a`,
        channel: `ytd-search-filter-group-renderer.style-scope:nth-child(2) > ytd-search-filter-renderer:nth-child(4) > a`,
        playlist: `ytd-search-filter-group-renderer.style-scope:nth-child(2) > ytd-search-filter-renderer:nth-child(6) > a`,
        movie: `ytd-search-filter-group-renderer.style-scope:nth-child(2) > ytd-search-filter-renderer:nth-child(8) > a`,
    },
    duration: {
        under_4: `ytd-search-filter-group-renderer.style-scope:nth-child(3) > ytd-search-filter-renderer:nth-child(2) > a`,
        "4-20": `ytd-search-filter-group-renderer.style-scope:nth-child(3) > ytd-search-filter-renderer:nth-child(4) > a`,
        over_20: `ytd-search-filter-group-renderer.style-scope:nth-child(3) > ytd-search-filter-renderer:nth-child(6) > a`,
    },
    features: {
        live: `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(2) > a`,
        "4k": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(4) > a`,
        hd: `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(6) > a`,
        "subtitles/CC": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(8) > a`,
        "creative_commons": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(10) > a`,
        "360": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(12) > a`,
        "vr180": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(14) > a`,
        "3d": `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(16) > a`,
        hdr: `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(18) > a`,
        location: `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(20) > a`,
        purchased: `ytd-search-filter-group-renderer.style-scope:nth-child(4) > ytd-search-filter-renderer:nth-child(24) > a`,
    },
    sort_by: {
        relevance: `ytd-search-filter-group-renderer.style-scope:nth-child(5) > ytd-search-filter-renderer:nth-child(2) > a`,
        upload_date: `ytd-search-filter-group-renderer.style-scope:nth-child(5) > ytd-search-filter-renderer:nth-child(4) > a`,
        view_count: `ytd-search-filter-group-renderer.style-scope:nth-child(5) > ytd-search-filter-renderer:nth-child(5) > a`,
        rating: `ytd-search-filter-group-renderer.style-scope:nth-child(5) > ytd-search-filter-renderer:nth-child(6) > a`,
    },
}*/

async function gotoVideo(page, title) {
    await page.goto(`https://rumble.com/search/all?q=${encodeURIComponent(title)}`, { waitUntil: "networkidle" });
    await page.waitForSelector(`.padded-content`);
}

async function foundVideo(page){
    const [found] = await to(Promise.race([
        page.waitForSelector(".main-and-sidebar > .flex-1 > ol"),
        page.waitForSelector(".main-and-sidebar > .flex-1"),
    ]));

    if (await page.$(`.main-and-sidebar > .flex-1 > ol`)) {
        return true;
    }

    return false;
}

/*async function applyFilter(page, filterName, filterValue) {
    if (filterName !== "features") {
        const filtersButton = await page.waitForSelector(`button.yt-spec-button-shape-next--icon-trailing`);
        if (!filtersButton) return;

        await filtersButton.click();

        const filterPath = filter_paths[filterName][filterValue];
        if (!filterPath) {
            throw new Error(`${filterValue} is not a valid option for ${filterName}`);
        }

        const filterButton = await page.waitForSelector(filterPath);
        if (!filterButton) return;

        await Promise.all([
            new Promise((resolve) => {
                page.evaluate(() => {
                    return new Promise((resolve, reject) => {
                        let interval = setInterval(() => {
                            let filterContainer = document.querySelectorAll("#collapse")[0];
                            if (filterContainer && (filterContainer.ariaHidden == "true" || filterContainer.hidden)) {
                                clearInterval(interval);
                                resolve();
                            }
                        }, 1000);
                    });
                }).then(resolve).catch(reject);
            }),
            filterButton.click(),
        ]);
    } else {
        for (const featureName of filterValue) {
            const filtersButton = await page.waitForSelector(`button.yt-spec-button-shape-next--icon-trailing`);
            if (!filtersButton) return;

            await filtersButton.click();

            const filterPath = filter_paths.features[featureName];
            if (!filterPath) {
                throw new Error(`${featureName} is not a valid option for features`);
            }

            const filterButton = await page.waitForSelector(filterPath, { visible: true });
            if (!filterButton) return;

            await Promise.all([
                new Promise((resolve) => {
                    page.evaluate(() => {
                        return new Promise((resolve, reject) => {
                            let interval = setInterval(() => {
                                let filterContainer = document.querySelectorAll("#collapse")[0];
                                if (filterContainer && (filterContainer.ariaHidden == "true" || filterContainer.hidden)) {
                                    clearInterval(interval);
                                    resolve();
                                }
                            }, 1000);
                        });
                    }).then(resolve).catch(reject);
                }),
                filterButton.click(),
            ]);

            await page.waitForSelector(`#contents`);
            const found = await Promise.race([
                page.waitForSelector("ytd-video-renderer.style-scope"),
                page.waitForSelector(".promo-title"),
            ]);

            if (!found) {
                throw new Error("No video found for filter selection");
            }
        }
    }

    await page.waitForSelector(`#contents`);
    const found = await Promise.race([
        page.waitForSelector("ytd-video-renderer.style-scope"),
        page.waitForSelector(".promo-title"),
    ]);

    if (!found) {
        throw new Error("No video found for filter selection");
    }
}*/

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
        return true;
    }

    return false;
}

async function main(pageContainer, options) {
    const videoInfo = pageContainer.videoInfo;
    const title = options.title || videoInfo.title;
    const page = pageContainer.page;

    await gotoVideo(page, title);
    const canSearchVideo = await foundVideo(page);

    if (!canSearchVideo) {
        throw new Error("No video found for search");
    }

    /*if (options.filters) {
        for (const filterName in options.filters) {
            await applyFilter(page, filterName, options.filters[filterName]);
        }
    }*/

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