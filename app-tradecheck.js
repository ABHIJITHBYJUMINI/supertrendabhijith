// server.js (Node.js Backend)
let receivedmessage = true;
let ceSymbol = '';
let peSymbol = '';

let ceSymbolnext = '';
let peSymbolnext = '';

let ceSymbolValue = '';
let peSymbolValue = '';

let ceSymbolnextValue = '';
let peSymbolnextValue = '';

let updatearray= false;
let cePrice = null;
let pePrice = null
let cenextPrice = null;
let penextPrice = null


let ceSymbolVal = null;
let peSymbolVal = null

let ceSymbolnextVal = null;
let peSymbolnextVal = null;

let currentWeeklyExpiry = "24O01"; 
let spotPrice = 0;
let subslist =[];

var fyersModel = require("fyers-api-v3").fyersModel;
let DataSocket = require("fyers-api-v3").fyersDataSocket;

var fyers = new fyersModel({
  logs: "path where you want to save logs",
  enableLogging: false,
});


fyers.setAppId("XBDVKT3M7D-100");

var accesstoken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE3Mjc2NjgxMTcsImV4cCI6MTcyNzc0MjYzNywibmJmIjoxNzI3NjY4MTE3LCJhdWQiOlsieDowIiwieDoxIiwieDoyIiwiZDoxIiwiZDoyIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCbS1oLVZCOTNqQlVqeWtOVnBTVjIzQ0tqUldRUVVUQVJlcE5KMjBtUWZYWkJMRjl5WGgxd1BJMFZBNl9EUW41ZEtCTFNqMUkzWHU2UkhzTnY3U01xblVfTVktdWk4N2Q0c1NaSGxqblo5WlRNdUVvTT0iLCJkaXNwbGF5X25hbWUiOiJBQkhJSklUSCBCWUpVIE1JTkkiLCJvbXMiOiJLMSIsImhzbV9rZXkiOiJmMTg2YjdkYzZjYzJkYmZiYmIzMjU2YTJhMGZlYjY1OGU3OWViMjYwYjhmM2UzOGViNjE1ZTUwNiIsImZ5X2lkIjoiWUEyMzIxMSIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.JS5qiL0D-bW-XWJuCVr1zHeXlJ5pBAaXsXAvqQCHctg";
fyers.setAccessToken(accesstoken);
const dataSocket = DataSocket.getInstance(accesstoken);
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
    subslist.push(ceSymbol);
    subslist.push(peSymbol);
    subslist.push(ceSymbolnext);
    subslist.push(peSymbolnext);
    // Subscribe to CE and PE symbols for real-time data
    dataSocket.subscribe(subslist);
    dataSocket.mode(dataSocket.LiteMode)
  });

  // Event: When a new message (data) is received from the WebSocket
  dataSocket.on("message", function (message) {
    //console.log("Received real-time data:", message);

    switch(message.symbol){
        case ceSymbol:
            //console.log(ceSymbol ,';', cenextPrice,  message.ltp);
            if(ceSymbolnextVal !== null){                
                if(message.ltp > 150 && cenextPrice > 150){
                    ceSymbolValue= ceSymbolValue + 100;
                    ceSymbolnextValue= ceSymbolnextValue + 100;
                    updatearray = true;

                }else if(message.ltp < 150 && cenextPrice > 150){
                    console.log(ceSymbol, ':',message.ltp);
    
                }else if(message.ltp < 150 && cenextPrice < 150){
                    ceSymbolValue= ceSymbolValue - 100;
                    ceSymbolnextValue= ceSymbolnextValue - 100;
                    updatearray = true;
                }

                
            }
            break;
        case ceSymbolnext:
            //console.log(peSymbolnext , message.ltp);
            ceSymbolnextVal = true;
            cenextPrice = message.ltp;
            break;

        case peSymbol:
            if(peSymbolnextVal  !== null){
                //console.log(peSymbol ,';', penextPrice,  message.ltp);
                if(message.ltp > 150 && penextPrice > 150){
                    peSymbolValue= peSymbolValue - 100;
                    peSymbolnextValue= peSymbolnextValue - 100;
                    updatearray = true;

                }else if(message.ltp < 150 && penextPrice > 150){
                    console.log(peSymbol, ':', message.ltp);
    
                }else if(message.ltp < 150 && penextPrice < 150){
                    peSymbolValue= peSymbolValue + 100;
                    peSymbolnextValue= peSymbolnextValue + 100;
                    updatearray = true;
                }

               
            }
            break;

        case peSymbolnext:
            //console.log(peSymbolnext , message.ltp);
            peSymbolnextVal = true;
            penextPrice = message.ltp;
            break;


    }

    if(updatearray == true){
        updatearray = false;
        ceSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
            ceSymbolValue
          }CE`;

          ceSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${
            ceSymbolnextValue
            }CE`;

          peSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
            peSymbolValue 
          }PE`;

          peSymbolnext = `NSE:BANKNIFTY${currentWeeklyExpiry}${
            peSymbolnextValue 
            }PE`;
        //subslist.splice(0, subslist.length); // Removes all elements
        subslist.push(ceSymbol);
        subslist.push(peSymbol);
        subslist.push(ceSymbolnext);
        subslist.push(peSymbolnext);
        dataSocket.subscribe(subslist);
    }
  });

  // Event: Handle WebSocket errors
  dataSocket.on("error", function (error) {
    console.error("WebSocket error:", error);
  });

  // Event: When WebSocket connection is closed
  dataSocket.on("close", function () {
    console.log("WebSocket connection closed.");
  });

  // Connect the WebSocket
  dataSocket.connect();
}

// Main function to execute the flow
async function main() {
  try {
    // Step 2: Get the current Bank Nifty spot price
    spotPrice = await getBankNiftySpotPrice();
    console.log(`Bank Nifty Spot Price: ${spotPrice - (spotPrice % 100)}`);

    // Step 3: Identify the current weekly expiry
    // You need to dynamically fetch or calculate the expiry date based on the current week (e.g., next Thursday)
    // Example: expiry date in YYMMDD format

    // // Create CE and PE symbols with closest strikes
    // const ceSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
    //   Math.round(spotPrice - (spotPrice % 100)) + 100
    // }CE`;
    // const peSymbol = `NSE:BANKNIFTY${currentWeeklyExpiry}${
    //   Math.round(spotPrice - (spotPrice % 100)) - 100
    // }PE`;

    // console.log(CE Symbol: ${ceSymbol}, PE Symbol: ${peSymbol});

    // Step 6: Open WebSocket connection and subscribe to CE and PE
    openWebSocket(spotPrice, currentWeeklyExpiry);

  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();