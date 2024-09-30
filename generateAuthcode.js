var fyersModel = require("fyers-api-v3").fyersModel

var fyers = new fyersModel({ "logs": "path where you want to save logs", "enableLogging": true })

fyers.setAppId("XBDVKT3M7D-100")

fyers.setRedirectUrl("https://trade.fyers.in/api-login/redirect-uri/index.html")

var URL = fyers.generateAuthCode()

console.log(URL)