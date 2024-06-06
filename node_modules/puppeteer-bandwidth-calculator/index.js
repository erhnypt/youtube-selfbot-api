`
GET /path/to/resource HTTP/1.1
Host: example.com
User-Agent: Your-User-Agent
Accept: text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate
Connection: keep-alive
`

async function calculateRequestSize(request) {
    let postData = await request.postData()
    let headers = await (request.allHeaders ? request.allHeaders() : request.headers())
    let method = await request.method()
    let url = new URL(await request.url())

    let message = `${method.toUpperCase()} ${url.hostname + url.pathname + url.search} HTTP/1.1 \r\n`

    for (const [key, value] of Object.entries(headers)) {
        message += `${key}: ${value}\r\n`
    }

    if (postData) {
        message += '\r\n'
        message += postData
    }

    return Buffer.from(message, 'utf-8').length
}

async function calculateResponseSize(response) {
    let status = await response.status()

    if (status >= 300 && status < 400) {
        return 0
    }

    try {
        let body = await (response.body ? response.body() : response.buffer())
        let headers = await (response.allHeaders ? response.allHeaders() : response.headers())
    
        let message = `HTTP/1.1 ${response.status()} OK\r\n`
    
        for (const [key, value] of Object.entries(headers)) {
            message += `${key}: ${value}\r\n`
        }
    
        message += '\r\n'
        message += body
    
        return Buffer.from(message, 'utf-8').length
    } catch(err) {
        return 0
    }
}

export { calculateRequestSize, calculateResponseSize }