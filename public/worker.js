const API_KEY = '8da79cd40fb7a8762461b051c4b477dba4041a0130ab156a165a2f8655661029'
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGREGATE_INDEX = "5"

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



self.onconnect = function(e) {
  var port = e.ports[0];
  port.onmessage = function(e) {
    if(e.data.act === "subcribe") subscribeToTickerOnWs(e.data.ticker)
    if(e.data.act === "unsubcribe") ussubscribeFromTickerOnWs(e.data.ticker)

    socket.addEventListener("message", e => {
      const {TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data)
      if(type !== AGREGATE_INDEX || newPrice === undefined) return

      const result = {
        currency: currency,
        newPrice: newPrice
      }
      port.postMessage(result)
      
    })
   };
};