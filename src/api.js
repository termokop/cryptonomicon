const API_KEY = '8da79cd40fb7a8762461b051c4b477dba4041a0130ab156a165a2f8655661029'

const tickersHandlers = new Map()

//todo: use URLSeearchParams
const loadtickersHandlers = () => {

    if(tickersHandlers.size === 0) return

    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[
        ...tickersHandlers.keys()
        ].join(',')}&tsyms=USD&api_key=${API_KEY}`
    ).then(r => r.json())
        .then(rawData => {
            const updatedPrices =  Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])
            )
            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get(currency) ?? []
                handlers.forEach(fn => fn(newPrice))
            })
       });
}

export const subscribeToTicker = (ticker,cb) => {
    const subscribers = tickersHandlers.get(ticker) || []
    tickersHandlers.set(ticker, [...subscribers, cb])
}

export const unsubscribeFromTicker = /*(*/ticker /*, cb)*/ => {
    tickersHandlers.delete(ticker)
    // const subscribers = tickersHandlers.get(ticker) || []
    // tickersHandlers.set(
    //     ticker,
    //     subscribers.filter(fn => fn !== cb)
    // )
}

setInterval(loadtickersHandlers, 3000)