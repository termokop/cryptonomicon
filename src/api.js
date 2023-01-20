let tickersHandlers = new Map()

let copiedData = 'a'

let sharedWorker = new SharedWorker('./worker.js');
sharedWorker.port.onmessage = function(e) { 
if(e.data.newPrice === copiedData.newPrice && e.data.currency === copiedData.currency) return

console.log("compire", copiedData, e.data)

 copiedData = e.data

    const handlers = tickersHandlers.get(e.data.currency) ?? []
    handlers.forEach(fn => fn(e.data.newPrice))
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
