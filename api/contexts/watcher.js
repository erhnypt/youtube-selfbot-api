
let videoStates = ["PLAYING", "PAUSED", "FINISHED"]

class watcherContext {
    #page = {}
    #parent = {}
    #extra = {}
    #browser = {}

    constructor(page, parent, extra, browser) {
        this.#page = page
        this.#parent = parent
        this.#extra = extra
        this.#browser = browser
    }

    setup() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.#page.waitForSelector(`.rumbles-vote-pill-up`, {visible: true}).catch(reject);

                let playerElement = await this.#page.waitForSelector(`video`).catch(reject)
                this.#parent.last_video_request = Date.now()

                let lastState

                let videoStateChanged = (newState) => {
                    this.#browser.emit("videoStateChanged", lastState, videoStates[newState])
                    lastState = videoStates[newState]
                }

                const hasVideoStateChanged = await this.#page.evaluate(() => !!window.videoStateChanged);
                if (!hasVideoStateChanged) {
                    await this.#page.exposeFunction("videoStateChanged", videoStateChanged).catch(reject)
                } else {
                    await playerElement.evaluate(p => {
                        p.removeEventListener('onStateChange', videoStateChanged)
                    }).catch(reject)
                }

                await playerElement.evaluate(p => {
                    p.addEventListener("pause", (event) => {
                        videoStateChanged(1)
                    });

                    p.addEventListener("play", (event) => {
                        videoStateChanged(0)
                    });
                    
                    p.addEventListener("ended", (event) => {
                        videoStateChanged(2)
                    });
                }).catch(reject)

                let resolutions = await this.resolutions();
                let resolutionChosen = resolutions.sort((a, b) => a - b)[0]

                await this.setResolution(resolutionChosen)

                this.#parent.__onContinue = resolve

                await this.play()
            } catch (err) {
                reject(new Error(err))
            }
        })
    }

    async resolutions() {
        return new Promise(async (resolve, reject) => {
            let em = await this.#page.waitForSelector(`div[title="Playback settings"]`).catch(reject)
            await em.click().catch(reject)

            this.#page.evaluate(async () => {
                function convertBitrateAbbreviatedNumber(abbreviatedString) {
                    const abbreviations = {
                        mbps: 1048576,
                        kbps: 1024,
                    };
                
                    const combo = abbreviatedString.split(" ");
                    return abbreviations[combo[1]] * parseFloat(combo[0]);
                }

                let qualities = []
                let qualityList = Array.from(document.querySelector(`div[title="Playback settings"]`).children[1].children[2].childNodes);
                
                for(let qualityButton of qualityList){
                    let qualityText = Array.from(qualityButton.childNodes)[1].innerText.split(", ")
                    qualityText[0] = qualityText[0].split("x")

                    if(!qualityText[1]) continue;

                    qualities.push({
                        width: parseInt(qualityText[0][0]),
                        height: parseInt(qualityText[0][1]),
                        bitrate: convertBitrateAbbreviatedNumber(qualityText[1])
                    })
                }

                return qualities;
            }).then(resolve).catch(reject)
        })
    }

    async setResolution(quality) {
        return new Promise(async (resolve, reject) => {
            let em = await this.#page.waitForSelector(`div[title="Playback settings"]`).catch(reject)
            await em.click().catch(reject)

            this.#page.evaluate(async (quality) => {
                function convertBitrateAbbreviatedNumber(abbreviatedString) {
                    const abbreviations = {
                        mbps: 1048576,
                        kbps: 1024,
                    };
                
                    const combo = abbreviatedString.split(" ");
                    return abbreviations[combo[1]] * parseFloat(combo[0]);
                }


                let qualityList = Array.from(document.querySelector(`div[title="Playback settings"]`).children[1].children[2].childNodes);
                
                for(let qualityButton of qualityList){
                    let qualityText = Array.from(qualityButton.childNodes)[1].innerText.split(", ")
                    qualityText[0] = qualityText[0].split("x")

                    if(!qualityText[1]) continue;

                    if(quality.width == qualityText[0][0]
                        && quality.height == qualityText[0][1] 
                        && quality.bitrate == convertBitrateAbbreviatedNumber(qualityText[1])
                   ){
                       qualityButton.click();
                   }
                }
            }, quality).catch(reject).then(resolve)
        })
    }

    async pause() {
        return new Promise(async (resolve, reject) => {
            this.#page.evaluate(() => {
                let video = Array.from(document.querySelectorAll("video")).pop()
                video.pause()
            }).catch(reject).then(resolve)
        })
    }

    async play() {
        return new Promise(async (resolve, reject) => {
            this.#page.evaluate(() => {
                let video = Array.from(document.querySelectorAll("video")).pop()
                video.play()
            }).catch(reject).then(resolve)
        })
    }

    async seek(time) {
        return new Promise(async (resolve, reject) => {
            this.#page.evaluate((time) => {
                let video = Array.from(document.querySelectorAll("video")).pop()
                video.currentTime = time
            }, time).catch(reject).then(resolve)
        })
    }

    async time() {
        return new Promise(async (resolve, reject) => {
            this.#page.evaluate(() => {
                let video = Array.from(document.querySelectorAll("video")).pop()
                return video.currentTime
            }).catch(reject).then(resolve)
        })
    }

    async duration() {
        return new Promise(async (resolve, reject) => {
            this.#page.evaluate(() => {
                let video = Array.from(document.querySelectorAll("video")).pop()
                return video.duration
            }).catch(reject).then(resolve)
        })
    }

    async like() {
        return new Promise(async (resolve, reject) => {
            let em = await this.#page.waitForSelector(`button.rumbles-vote-pill-up.rumblers-vote-pill-button`).catch(reject)
            if (em) await em.click().catch(reject)

            resolve(!!em)
        })
    }

    async dislike() {
        return new Promise(async (resolve, reject) => {
            let em = await this.#page.waitForSelector(`button.rumbles-vote-pill-down.rumblers-vote-pill-button`).catch(reject)
            if (em) await em.click().catch(reject)

            resolve(!!em)
        })
    }

    async follow() {
        return new Promise(async (resolve, reject) => {
            let em = await this.#page.waitForSelector(`div.media-by-channel-container > div > div > button`).catch(reject)

            if (em) await em.click().catch(reject)

            resolve(!!em)
        })
    }

    async areCommentsLocked() {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(false)
            } catch (err) {
                reject(new Error(err))
            }
        })
    }

    async comment(message) {
        return new Promise(async (resolve, reject) => {
            if(await this.areCommentsLocked().catch(reject)){
                return reject(new Error("Unable to make comment because video has comments locked."))
            }

            try {
                if (this.#parent.videoInfo.isLive) {
                    let em = await this.#page.waitForSelector(`#chat-message-text-input`).catch(reject)
                    await em.click().catch(reject)

                    await this.#page.keyboard.type(message, 25).catch(reject)

                    let submit = await this.#page.waitForSelector(`.chat--send`).catch(reject)
                    await submit.click().catch(reject)
                } else {
                    let em = await this.#page.waitForSelector(`.comments-create-textarea`).catch(reject)
                    await em.click().catch(reject)

                    await this.#page.keyboard.type(message, 25).catch(reject)

                    let submit = await this.#page.waitForSelector(`.comments-add-comment`).catch(reject)
                    await submit.click().catch(reject)
                }

                resolve()
            } catch (err) {
                reject(new Error(err))
            }
        })
    }

    async isAdPlaying() {
        return new Promise(async (resolve, reject) => {
            await this.#page.evaluate(() => {
                let DirectBlockElements = [
                    ".ytp-ad-image-overlay",
                    ".ytp-ad-text-overlay",
                    "ytd-rich-item-renderer ytd-display-ad-renderer",
                    "ytd-player-legacy-desktop-watch-ads-renderer",
                    ".style-scope ytd-item-section-renderer #ad-badge",
                    "#player-ads",
                    "ytd-promoted-sparkles-web-renderer",
                    "ytd-search-pyv-renderer",
                    "#masthead-ad",
                    "ytd-carousel-ad-renderer",
                    "ytd-promoted-sparkles-text-search-renderer"
                ];

                let LoopAndBlockElements = [
                    [
                        ".test-class", "test-text"
                    ],
                    [
                        "ytd-item-section-renderer:nth-child(2)", `\nAd\n`
                    ],
                    [
                        "ytd-item-section-renderer:nth-child(3)", `\nAd\n`
                    ]
                ]

                let found

                let videoAdFoundVideo = document.querySelector(`.html5-video-player.ad-showing video`)
                if (videoAdFoundVideo) {
                    let video = document.querySelector("video")
                    let adskipBtn = Array.from(document.querySelectorAll(`[id^="ad-text:"]`))
                    adskipBtn = adskipBtn[adskipBtn.length - 2]
                    if (adskipBtn) {
                        let adTime = parseInt(adskipBtn.innerText)

                        if (adskipBtn.style.display !== "none") {
                            return {
                                type: "video",
                                currentTime: video.currentTime,
                                duration: video.duration || 0,
                                canSkip: false,
                                skipIn: adTime
                            }
                        } else {
                            return {
                                type: "video",
                                duration: video.duration || 0,
                                canSkip: true,
                            }
                        }
                    }
                }

                for (let i = 0; i < DirectBlockElements.length; i++) {
                    let currentElementToBlock = document.querySelector(DirectBlockElements[i]);
                    if (currentElementToBlock && currentElementToBlock.style.display !== "none") {
                        found = "small"
                    }
                }

                for (let i = 0; i < LoopAndBlockElements.length; i++) {
                    let currentLoopAndBlockElements = document.querySelector(LoopAndBlockElements[i][0])

                    let textToSearch = LoopAndBlockElements[i][1];
                    if (currentLoopAndBlockElements && currentLoopAndBlockElements.style.display !== "none") {
                        if (currentLoopAndBlockElements.innerText.includes(textToSearch)) {
                            found = "small"
                        }
                    }
                }

                return { type: found }
            }).catch(reject).then(resolve)
        })
    }

    async skipAd(force) {
        return new Promise(async (resolve, reject) => {
            return await this.#page.evaluate((force) => {
                let DirectBlockElements = [
                    ".ytp-ad-image-overlay",
                    ".ytp-ad-text-overlay",
                    "ytd-rich-item-renderer ytd-display-ad-renderer",
                    "ytd-player-legacy-desktop-watch-ads-renderer",
                    ".style-scope ytd-item-section-renderer #ad-badge",
                    "#player-ads",
                    "ytd-promoted-sparkles-web-renderer",
                    "ytd-search-pyv-renderer",
                    "#masthead-ad",
                    "ytd-carousel-ad-renderer",
                    "ytd-promoted-sparkles-text-search-renderer"
                ];

                let LoopAndBlockElements = [
                    [
                        ".test-class", "test-text"
                    ],
                    [
                        "ytd-item-section-renderer:nth-child(2)", `\nAd\n`
                    ],
                    [
                        "ytd-item-section-renderer:nth-child(3)", `\nAd\n`
                    ]
                ]

                let skipped = false

                if (force) {
                    let videoAdFoundVideo = document.querySelector(`.html5-video-player.ad-showing video`)
                    if (videoAdFoundVideo) {
                        videoAdFoundVideo.currentTime = isNaN(videoAdFoundVideo.duration) ? 0 : videoAdFoundVideo.duration;
                    }
                }

                let adskipBtn = document.querySelector(`.ytp-ad-skip-button-container`)
                if (adskipBtn) {
                    adskipBtn.click()
                    skipped = true
                } else {
                    for (let i = 0; i < DirectBlockElements.length; i++) {
                        let currentElementToBlock = document.querySelector(DirectBlockElements[i]);
                        if (currentElementToBlock && currentElementToBlock.style.display != "none") {
                            currentElementToBlock.style.display = "none"
                            skipped = true
                        }
                    }

                    for (let i = 0; i < LoopAndBlockElements.length; i++) {
                        let currentLoopAndBlockElements = document.querySelector(LoopAndBlockElements[i][0])

                        if (currentLoopAndBlockElements && currentLoopAndBlockElements.style.display != "none") {
                            if (currentLoopAndBlockElements.innerText.includes(LoopAndBlockElements[i][1])) {
                                currentLoopAndBlockElements.style.display = "none";
                                skipped = true
                            }
                        }
                    }
                }

                return skipped
            }, force).catch(reject).then(resolve)
        })
    }
}

export default watcherContext;