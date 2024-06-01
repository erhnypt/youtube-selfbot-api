import selfbot from "./index.js"
import { readFileSync, writeFileSync } from "fs"

let opts = JSON.parse(readFileSync("./env.json"))
let cookies = JSON.parse(readFileSync("./cookies.json"))

let proxy = "socks5://Bloxxy213:BloxxyEMaiWomp_session-jhkc7Uum_lifetime-30m_streaming-1@geo.iproyal.com:32325"

let used = 0;

async function run(){
    let bot = new selfbot({
        autoSkipAds: true, 
        timeout: 0,
        
        proxy,
        headless: false,

        userDataDir: "./test/"
    })


    let browser = await bot.launch()
    let page = await browser.newPage()
    //let navigator = await page.setupNavigator();

    await page.clearCookies()

    browser.on("bandwith", (_, id, bandwidth) => {
        used += bandwidth

        //console.log(used / (1024 * 1024))
    })

    await browser.clearStorage()

    // normal test

    console.time("going to video")
    let watcherContext = await page.gotoVideo("direct", "v4vzt7q")
    console.timeEnd("going to video")

    //await watcherContext.comment("Nice video bro")
}
run()