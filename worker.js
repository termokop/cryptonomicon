const API_KEY = '8da79cd40fb7a8762461b051c4b477dba4041a0130ab156a165a2f8655661029'
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGREGATE_INDEX = "5"

let tickersArr = []
let BTCCurrentPrice = null

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

function subscribeToTickerOnWs(ticker, from = "USD") {
  sendToWs({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~${from}`]
  })
}



function ussubscribeFromTickerOnWs(ticker) {
    sendToWs({
        action: "SubRemove",
        subs: [`5~CCCAGG~${ticker}~USD`]
    })
}


self.onconnect = function(e) {
  var port = e.ports[0];
  port.onmessage = function(e) {

    subscribeToTickerOnWs("BTC")

    if(e.data.act === "subcribe" && !tickersArr.includes(e.data.ticker)) {
      subscribeToTickerOnWs(e.data.ticker)
      tickersArr.push(e.data.ticker)
    }
    if(e.data.act === "unsubcribe") {
      if(e.data.ticker !== "BTC") {
        ussubscribeFromTickerOnWs(e.data.ticker)
        tickersArr = tickersArr.filter(t => t !== e.data.ticker)
      }
    }

    socket.addEventListener("message", e => {

      if (e.data.includes("500") && e.data.includes("INVALID_SUB")) { // if INVALID_SUB — try use to: BTC
        const {PARAMETER: parameter} = JSON.parse(e.data)
        const currentFailTickerArr =  parameter.split('~')
        port.postMessage(currentFailTickerArr[2])
        ussubscribeFromTickerOnWs(currentFailTickerArr[2])
        if(currentFailTickerArr[3] !== "BTC")  subscribeToTickerOnWs(currentFailTickerArr[2], "BTC")
        else {
          const result = {
            currency: currentFailTickerArr[2],
            newPrice: "-" 
          }
          port.postMessage(result)
        }
      }


      const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, TOSYMBOL: toSymbol} = JSON.parse(e.data)
      if(type !== AGREGATE_INDEX || newPrice === undefined) return

      if(currency === "BTC") BTCCurrentPrice = newPrice


      if(toSymbol === "USD") {
        const result = {
          currency: currency,
          newPrice: newPrice
        }
        port.postMessage(result)
      }


      if(toSymbol === "BTC") {
        if(!BTCCurrentPrice) subscribeToTickerOnWs("BTC")
        else {
          const result = {
            currency: currency,
            newPrice: newPrice * BTCCurrentPrice
          }
          port.postMessage(result)
        }
      }
      

      
    })
   };
};