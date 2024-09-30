var fyersModel = require("fyers-api-v3").fyersModel

var fyers = new fyersModel({ "logs": "path where you want to save logs", "enableLogging": true })

fyers.setAppId("XBDVKT3M7D-100")

fyers.setRedirectUrl("https://trade.fyers.in/api-login/redirect-uri/index.html")

var URL = fyers.generateAuthCode()

console.log(URL);

var authcode = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkubG9naW4uZnllcnMuaW4iLCJpYXQiOjE3Mjc2NjgwNzAsImV4cCI6MTcyNzY5ODA3MCwibmJmIjoxNzI3NjY3NDcwLCJhdWQiOiJbXCJ4OjBcIiwgXCJ4OjFcIiwgXCJ4OjJcIiwgXCJkOjFcIiwgXCJkOjJcIiwgXCJ4OjFcIiwgXCJ4OjBcIl0iLCJzdWIiOiJhdXRoX2NvZGUiLCJkaXNwbGF5X25hbWUiOiJZQTIzMjExIiwib21zIjoiSzEiLCJoc21fa2V5IjoiZjE4NmI3ZGM2Y2MyZGJmYmJiMzI1NmEyYTBmZWI2NThlNzllYjI2MGI4ZjNlMzhlYjYxNWU1MDYiLCJub25jZSI6IiIsImFwcF9pZCI6IlhCRFZLVDNNN0QiLCJ1dWlkIjoiYjAyZDg3Mzg1ZTkyNGMyM2JiODE0YWExZDdkNzllMzYiLCJpcEFkZHIiOiIwLjAuMC4wIiwic2NvcGUiOiIifQ.YtSyoh2AGIMMDvxQ1Ws3ZDrEsAdX1tggLZQjBd6AzNY";
var accesstoken="";


if (accesstoken == '') {
    fyers.generate_access_token({ "client_id": "XBDVKT3M7D-100", "secret_key": "MMW6LIQ3QS", "auth_code": authcode }).then((response) => {
        if (response.s == 'ok') {
            fyers.setAccessToken(response.access_token)
            console.log(response.access_token);
        } else {
            console.log("error generating access token", response)
        }
    })
}