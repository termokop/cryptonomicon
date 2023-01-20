let counter = 0;

self.onconnect = function(e) {
  const port = e.ports[0];
  port.postMessage({counter: counter});
  
  port.onmessage = function(e) {
    if (e.data === "increment_for_event") {
      counter++;
      port.postMessage({counter: counter});
    }
  }
}