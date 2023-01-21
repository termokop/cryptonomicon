let tickersHandlers = new Map()

export let invalidTickers = []

let copiedData = 'a' // some string to compire with "price"

let sharedWorker = new SharedWorker('./worker.js');
sharedWorker.port.onmessage = function(e) { 

    if(e.data.newPrice !== "-") {
        if(e.data.newPrice === copiedData.newPrice && e.data.currency === copiedData.currency) return // for do not see 6*times same price
        copiedData = e.data
        const handlers = tickersHandlers.get(e.data.currency) ?? []
        handlers.forEach(fn => fn(e.data.newPrice))
    } else {
        invalidTickers.push(e.data.currency)
    }
    console.log(e.data)
};





export const subscribeToTicker = (ticker,cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
    sharedWorker.port.postMessage({ticker: ticker, act: "subcribe"});
}

 export const unsubscribeFromTicker = ticker => {
     tickersHandlers.delete(ticker)
    sharedWorker.port.postMessage({ticker: ticker, act: "unsubcribe"});
 }
