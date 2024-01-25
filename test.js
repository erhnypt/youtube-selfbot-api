import selfbot from "./index.js"
import { readFileSync, writeFileSync } from "fs"

let opts = JSON.parse(readFileSync("./env.json"))
let cookies = JSON.parse(readFileSync("./cookies.json"))

let proxy = "direct://"

let used = 0;

//console.log(new URL("https://www.youtube.com/api/stats/playback?ns=yt&el=detailpage&cpn=DHASfzhCV2zAWqIX&ver=2&cmt=0.12&fmt=247&fs=0&rt=751.967&euri&lact=429&cl=600620165&mos=0&volume=100&cbr=Firefox&cbrver=119.0&c=WEB&cver=2.20240123.06.00&cplayer=UNIPLAYER&cos=Windows&cosver=10.0&cplatform=DESKTOP&hl=en_US&cr=US&len=1301.341&fexp=v1%2C23983296%2C2730%2C18618%2C2602%2C73492%2C54572%2C73455%2C153832%2C23131%2C53633%2C84737%2C26360%2C8869%2C1089%2C6271%2C133212%2C26306282%2C4054%2C1930%2C5181%2C9369%2C1556%2C1141%2C8128%2C1265%2C395%2C9806%2C4683%2C9954%2C2008%2C7097%2C1314%2C677%2C345%2C5448%2C4833%2C1492%2C3001%2C1473%2C1598%2C24%2C3436%2C1908%2C2%2C2350&rtn=759&afmt=251&muted=0&docid=R83W2XR3IC8&ei=M2GyZeGaN_u_6dsP-YCj4A8&plid=AAYPxRuzIcLexyfh&of=uFqy5fq4OH88GZXDouBvew&vm=CAEQARgEOjJBSHFpSlRLaTdPQldMM3RmRWNKcl9EQU4tZGpkbC1WT3hGS0IwdTlSMGtPd0RXbkpzZ2JnQVBta0tESzhTRl96ZWF1UFI1YmwyVks4b1ZvRkF4c1IybmlkMUxacjhVM0h5VkZaZmN6QWF3bU9ublRWVnNPQTBtTllDLUJXUXB0clluT0dVbllrOWVsUmRTLTR6bkJ6aHN4TDZaa2gC"))

async function run(){
    let bot = new selfbot({
        autoSkipAds: true, 
        timeout: 0,
        
        proxy,
        headless: false,
    })

    let browser = await bot.launch()
    let page = await browser.newPage()
    //let googleContext = await page.setupGoogle();
    //await googleContext.login(opts)

    await page.clearCookies()

    browser.on("bandwith", (_, id, bandwidth) => {
        used += bandwidth

        //console.log(used / (1024 * 1024))
    })

    await browser.clearStorage()

    // normal test

    //let watcherContext = await page.gotoVideo("direct", "efpwEe6CvtI")
    //console.log(page.videoInfo)

    // livestream test

    /*let googleContext = await page.setupGoogle()
    await googleContext.login(opts, cookies)
    writeFileSync("./cookies.json", JSON.stringify(await page.getCookies()))*/

    let watcherContext = await page.gotoVideo("direct", "https://www.youtube.com/watch?v=NHFV0hyCgzA")

    console.log("done 1")

    //await watcherContext.comment("This is so cool!!")

    console.log("done final")

    /*(setInterval(async () => {
        console.log(await watcherContext.time(), await watcherContext.duration(), await watcherContext.time() / await watcherContext.duration())

    }, 500)()*/
}

run()
//run()
//run()