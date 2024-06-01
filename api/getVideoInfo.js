import rumble_core from "rumble-core";

async function getVideoInfo(id, proxy, cookies) {
    /*let agent = ytdl.createAgent((cookies || []).filter((cookie) => cookie.domain == ".youtube.com"))
    let info = await ytdl.getBasicInfo(id, agent)*/
    let info = await rumble_core.getInfo(id, {
        /*headers: {
            cookies:
        }*/
    })

    let format = rumble_core.chooseFormat(info.video.formats, {
        quality: "lowest"
    })

    return {
        viewCount: parseInt(info.video.views),
        duration: parseFloat(info.video.duration) || Infinity,
        uploadDate: new Date(info.video.uploadDate),
        isShort: (format.width / format.height) < 1,
        url: `https://rumble.com/${info.video.pageURL}`,
        isLive: info.video.live,
        title: info.video.title,
        format: {
            size: format.size || Infinity,
            mbps: (format.bitrate / 1e+6 / 10 + 0.00183) * 1.25,
            mbpm: (format.bitrate / 1e+6 + 0.11) * 1.25 * 60,
            width: format.width,
            height: format.height,
            aspect_ratio: format.width / format.height,
        },

        id: id,
    }
}

export default getVideoInfo