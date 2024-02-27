let sleep = (ms) => new Promise(r => setTimeout(r, ms))

async function text(el) {
    return await el.evaluate(e => (e.innerText || e.value).trim())
}

class navigatorContext {
    #page = {}
    #parent = {}
    #extra = {}
    currentAccount = {}
    #browser = {}

    constructor(page, parent, extra, browser) {
        this.#page = page
        this.#parent = parent
        this.#extra = extra
        this.#browser = browser
    }

    setup() {
        return new Promise(async (resolve) => {
            await this.#page.goto(`https://rumble.com/account/profile`)

            let emailBox = await this.#page.$(`li > input[type=email]`)

            if (!emailBox) {
                this.currentAccount = {
                    email: "",
                    password: "",
                    cookies: [],
                    formatted_cookies: "",
                    loggedIn: false,
                }
            } else {
                let currentEmail = await text(emailBox)
                let currentCookies = await this.#parent.getCookies()

                this.currentAccount = {
                    email: currentEmail,
                    password: "",
                    cookies: currentCookies,
                    formatted_cookies: await this.#parent.getFormattedCookies(),
                    loggedIn: true,
                }
            }

            resolve(this.currentAccount)
        })
    }

    async login(accountInfo = {}, cookies) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.#page.goto(`https://rumble.com/account/profile`, {waitUntil: "networkidle"})
                let el = await this.#page.$(`li > input[type=email]`)

                if (typeof cookies == "string" || typeof cookies == "object") {
                    await this.#parent.clearCookies()
                    await this.#parent.setCookies(cookies)
                    await this.#page.goto(`https://rumble.com/account/profile`, {waitUntil: "networkidle"})

                    el = await this.#page.$(`li > input[type=email]`)
                }

                let emailBox = (await this.#page.$$(`#login-username`))[0]
                let currentEmail

                if (!emailBox) {
                    currentEmail = await text(el)
                }

                if (emailBox || currentEmail !== accountInfo.email) {
                    if ((!accountInfo.email && !accountInfo.username) || !accountInfo.password) {
                        this.#browser.emit("loginFailed", this.#parent.id, {
                            header: "No account information given",
                            instructions: "Please provide both email and password for the account",
                        })

                        return reject("No account information given")
                    }

                    await this.#page.waitForSelector(`#login-username`)

                    // email

                    await this.#page.click(`#login-username`)
                    await sleep(1000)
                    await this.#page.type(`#login-username`, accountInfo.username || accountInfo.email, { delay: 75 })

                    // password

                    await this.#page.click(`#login-password`)
                    await sleep(1000)
                    await this.#page.type(`#login-password`, accountInfo.password, { delay: 75 })

                    // continue

                    await this.#page.click(`.login-button`)

                    await Promise.race([
                        this.#page.waitForSelector(`.login-form-error`, {state: "visible"}),
                        this.#page.waitForSelector(`li > input[type=email]`),
                    ])

                    let pInc = (await this.#page.$$(`.login-form-error`));

                    if (pInc[0]) {
                        await sleep(500)
                        let instructions = await text(pInc[0])

                        this.#browser.emit("loginFailed", this.#parent.id, {
                            header: "wrong password or username",
                            instructions,
                        })

                        return reject("wrong password or username")
                    }

                    this.currentAccount = {
                        ...accountInfo,
                        cookies: await this.#parent.getCookies(),
                        formatted_cookies: await this.#parent.getFormattedCookies(),
                        loggedIn: true,
                    }

                    resolve(this.currentAccount)
                } else {
                    this.currentAccount = {
                        email: currentEmail,
                        password: "",
                        cookies: await this.#parent.getCookies(),
                        formatted_cookies: await this.#parent.getFormattedCookies(),
                        loggedIn: true,
                    }
                }

                resolve(this.currentAccount)
            } catch (err) {
                reject(err)
            }
        })
    }

    async logout() {
        await this.#parent.clearCookies()
        this.currentAccount = {
            email: "",
            password: "",
            cookies: [],
            formatted_cookies: "",
            loggedIn: false,
        }

        return this.currentAccount
    }
}

export default navigatorContext