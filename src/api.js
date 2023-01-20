const API_KEY = '8da79cd40fb7a8762461b051c4b477dba4041a0130ab156a165a2f8655661029'

const tickersHandlers = new Map()

const socket = new WebSocket(
    `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
)

const AGREGATE_INDEX = "5"

socket.addEventListener("message", e => {
    const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
    if(type !== AGREGATE_INDEX || newPrice === undefined) return
    
    
    const handlers = tickersHandlers.get(currency) ?? []
    handlers.forEach(fn => fn(newPrice))
})


function sendToWs(message) {
    const stringifiedMsg = JSON.stringify(message)
    if(socket.readyState === WebSocket.OPEN) {
        socket.send(stringifiedMsg)
        return
    }

    socket.addEventListener(
        "open",
        () => {
            socket.send(stringifiedMsg)
        },
        {once: true}
    )
}

function subscribeToTickerOnWs(ticker) {
    sendToWs({
        action: "SubAdd",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

function ussubscribeFromTickerOnWs(ticker) {
    sendToWs({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}

export const subscribeToTicker = (ticker,cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
    subscribeToTickerOnWs(ticker)
}

export const unsubscribeFromTicker = /*(*/ticker /*, cb)*/ => {
    tickersHandlers.delete(ticker)
    ussubscribeFromTickerOnWs(ticker)
    // const subscribers = tickersHandlers.get(ticker) || []
    // tickersHandlers.set(
    //     ticker,
    //     subscribers.filter(fn => fn !== cb)
    // )
}
