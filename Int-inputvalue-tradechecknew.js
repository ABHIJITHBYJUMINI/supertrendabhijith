// server.js (Node.js Backend)
let receivedInput = '';  // Added initialization for receivedInput
let ceSymbol = '';
let peSymbol = '';

let ceSymbolnext = '';
let peSymbolnext = '';

let ceSymbolValue = '';
let peSymbolValue = '';

let ceSymbolnextValue = '';
let peSymbolnextValue = '';

let updatearray = false;
let cePrice = null;
let pePrice = null;
let cenextPrice = null;
let penextPrice = null;

let ceSymbolVal = null;
let peSymbolVal = null;

let ceSymbolnextVal = null;
let peSymbolnextVal = null;

let currentWeeklyExpiry = "24O01"; 
let spotPrice = 0;
let subslist = [];

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;  // Define your preferred port
app.use(bodyParser.json());

var fyersModel = require("fyers-api-v3").fyersModel;
let DataSocket = require("fyers-api-v3").fyersDataSocket;

var fyers = new fyersModel({
  logs: "path where you want to save logs",
  enableLogging: false,
});

fyers.setAppId("XBDVKT3M7D-100");

var accesstoken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE3Mjc2NjgxMTcsImV4cCI6MTcyNzc0MjYzNywibmJmIjoxNzI3NjY4MTE3LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCbS1oLVZCOTNqQlVqeWtOVnBTVjIzQ0tqUldRUVVUQVJlcE5KMjBtUWZYWkJMRjl5WGgxd1BJMFZBNl9EUW41ZEtCTFNqMUkzWHU2UkhzTnY3U01xblVfTVktdWk4N2Q0c1NaSGxqblo5WlRNdUVvTT0iLCJkaXNwbGF5X25hbWUiOiJBQkhJSklUSCBCWUpVIE1JTkkiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiJmMTg2YjdkYzZjYzJkYmZiYmIzMjU2YTJhMGZlYjY1OGU3OWViMjYwYjhmM2UzOGViNjE1ZTUwNiIsImZ5X2lkIjoiWUEyMzIxMSIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.JS5qiL0D-bW-XWJuCVr1zHeXlJ5pBAaXsXAvqQCHctg"; // Add your valid access token here
fyers.setAccessToken(accesstoken);
const dataSocket = DataSocket.getInstance(accesstoken);

// Example of placing an order based on received input
function placeOrderBasedOnInput(message, acceptedprofit) {
  if (receivedInput === 'C') {
    console.log("Buying CE Option:", OptionArr[0]);
    const reqBody = {
      symbol: OptionArr[0],
      qty: 15,
      type: 1,
      side: 1,
      productType: "BO",
      limitPrice: Math.round(message.ltp + 0.5),
      stopPrice: 0,
      validity: "DAY",
      stopLoss: Math.round(message.ltp * 0.9),
      takeProfit: Math.round(message.ltp * acceptedprofit),
      offlineOrder: false,
      disclosedQty: 0
    };
    fyers.place_order(reqBody)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
    
    receivedInput = '';
  } else if (receivedInput === 'P') {
    console.log("Buying PE Option:", OptionArr[1]);
    const reqBodyPE = {
      symbol: OptionArr[1],
      qty: 15,
      type: 1,
      side: 1,
      productType: "BO",
      limitPrice: Math.round(message.ltp + 0.5),
      stopPrice: 0,
      validity: "DAY",
      stopLoss: Math.round(message.ltp * 0.9),
      takeProfit: Math.round(message.ltp * acceptedprofit),
      offlineOrder: false,
      disclosedQty: 0
    };
    fyers.place_order(reqBodyPE)
      .then((response) => console.log(response))
      .catch((error) => console.log(error));
    
    receivedInput = '';
  }
}

// Process the incoming alert from TradingView and make trading decision
async function processTradingViewAlert(symbol, price, signal) {
  if (signal === 'buy') {
    // Place a buy order
    await placeOrder(symbol, 'BUY', price);
  } else if (signal === 'sell') {
    // Place a sell order
    await placeOrder(symbol, 'SELL', price);
  }
}

// POST route to receive alerts from TradingView
app.post('/tradingview-alert', async (req, res) => {
  try {
    const { symbol, price, signal } = req.body;
    console.log(`Received alert for ${symbol}: ${signal} at ${price}`);

    // Process the alert and place an order
    await processTradingViewAlert(symbol, price, signal);
    res.status(200).send('Alert processed successfully');
  } catch (error) {
    console.error("Error processing alert:", error);
    res.status(500).send('Error processing alert');
  }
});

// Fetch Bank Nifty spot price
async function getBankNiftySpotPrice() {
  try {
    const response = await fyers.getQuotes(["NSE:NIFTYBANK-INDEX"]);
    if (response.s && response.d.length > 0) {
      return Math.round(response.d[0].v.lp); // Last traded price
    } else {
      throw new Error("Could not fetch Bank Nifty spot price.");
    }
  } catch (error) {
    console.error("Error fetching Bank Nifty spot price:", error);
    throw error;
  }
}

// Open WebSocket connection to receive real-time data
function openWebSocket(spot, expiry) {
  // Event: When WebSocket is connected
  dataSocket.on("connect", function () {
    console.log("WebSocket connected.");

    // Create CE and PE symbols with closest strikes
    ceSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
      Math.round(spotPrice - (spotPrice % 100)) + 100
    }CE`;
    ceSymbolValue = Math.round(spotPrice - (spotPrice % 100)) + 100;
    ceSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${
      Math.round(spotPrice - (spotPrice % 100))
    }CE`;
    ceSymbolnextValue = Math.round(spotPrice - (spotPrice % 100));
    peSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
      Math.round(spotPrice - (spotPrice % 100))
    }PE`;
    peSymbolValue = Math.round(spotPrice - (spotPrice % 100)) + 100;
    peSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${
      Math.round(spotPrice - (spotPrice % 100)) + 100
    }PE`;
    peSymbolnextValue = Math.round(spotPrice - (spotPrice % 100));
    subslist.push(ceSymbol, peSymbol, ceSymbolnext, peSymbolnext);

    // Subscribe to CE and PE symbols for real-time data
    dataSocket.subscribe(subslist);
    dataSocket.mode(dataSocket.LiteMode);
  });

  // Event: When a new message (data) is received from the WebSocket
  dataSocket.on("message", function (message) {
    // Process received data for CE and PE symbols
    switch (message.symbol) {
      case ceSymbol:
        if (ceSymbolnextVal !== null) {
          if (message.ltp > 150 && cenextPrice > 150) {
            ceSymbolValue += 100;
            ceSymbolnextValue += 100;
            updatearray = true;
          } else if (message.ltp < 150 && cenextPrice > 150) {
            console.log(ceSymbol, ':', message.ltp);
          } else if (message.ltp < 150 && cenextPrice < 150) {
            ceSymbolValue -= 100;
            ceSymbolnextValue -= 100;
            updatearray = true;
          }
        }
        break;
      case ceSymbolnext:
        ceSymbolnextVal = true;
        cenextPrice = message.ltp;
        break;
      case peSymbol:
        if (peSymbolnextVal !== null) {
          if (message.ltp > 150 && penextPrice > 150) {
            peSymbolValue -= 100;
            peSymbolnextValue -= 100;
            updatearray = true;
          } else if (message.ltp < 150 && penextPrice > 150) {
            console.log(peSymbol, ':', message.ltp);
          } else if (message.ltp < 150 && penextPrice < 150) {
            peSymbolValue += 100;
            peSymbolnextValue += 100;
            updatearray = true;
          }
        }
        break;
      case peSymbolnext:
        peSymbolnextVal = true;
        penextPrice = message.ltp;
        break;
    }

    if (updatearray) {
      updatearray = false;
      ceSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${ceSymbolValue}CE`;
      ceSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${ceSymbolnextValue}CE`;
      peSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${peSymbolValue}PE`;
      peSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${peSymbolnextValue}PE`;

      subslist.splice(0, subslist.length); // Reset subscription list
      subslist.push(ceSymbol, peSymbol, ceSymbolnext, peSymbolnext);
      dataSocket.subscribe(subslist);
    }
  });

  // Event: Handle WebSocket errors
  dataSocket.on("error", function (error) {
    console.error("WebSocket error:", error);
  });

  // Event: Handle WebSocket disconnection
  dataSocket.on("disconnect", function () {
    console.log("WebSocket disconnected.");
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
