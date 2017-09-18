```js
var Payment = require('paymentsdk')
var clientId = ""; // Get your Client ID from https://developer.interswitchng.com
var secret = ""; // Get your Client Secret from https://developer.interswitchng.com
var ENV = "SANDBOX"; // or PRODUCTION
var payment = new Payment(clientId, secret, ENV);
var pan = "6280511000000095"; // Payment Card
var expDate = "5004"; // Payment Card Expiry Date. Format YYMM
var cvv = "111";  // Payment Card CVV
var pin = "1111"; // // Payment Card PIN
var amt = "35000";
var currency = payment.NAIRA;
var custId = "customer@myshop.com";

var getResp = function(err, response, body)
{
  console.log("Status HTTP Resp Code: " + response.statusCode);
  console.log("Status Resp: " + body);
}


// handle ValidateCard Response
var getValidateCardResp = function(err, response, body)
{
  var httpRespCode =  response.statusCode
  console.log("HTTP Resp Code: " + httpRespCode);
  console.log("Response: " + body);
  var json = JSON.parse(body);

  if(httpRespCode == '202' && json.responseCode == 'T0')
  {
    // Do OTP Authorization
    var otp = "123456"; // This will be sent to your (OTP) registered mobile phone number.
    var tranId = json.transactionRef;
    payment.verifyOTP(tranId, otp, getResp);
  }
  else if(httpRespCode == '202' && json.responseCode == 'M0') {
     console.log('This cards needs to be registered for OTP');
  }
}

// Validate Card
var validateReqRef = "ISW-SDK-VALIDATE-31";
payment.validateCard(pan, expDate, cvv, pin, validateReqRef, getValidateCardResp);



// handle Payment Response
var getPaymentResp = function(err, response, body)
{
  var httpRespCode =  response.statusCode
  console.log("HTTP Resp Code: " + httpRespCode);
  console.log("Response: " + body);
  var json = JSON.parse(body);

  if(httpRespCode == '202' && json.responseCode == 'T0')
  {
    // Do OTP Authorization
    var otp = "123456"; // This will be sent to your (OTP) registered mobile phone number.
    var tranId = json.paymentId;
    payment.verifyOTP(tranId, otp, getResp);
  }
  else if(httpRespCode == '202' && json.responseCode == 'M0') {
     console.log('This cards needs to be registered for OTP');
  }
  else
  {
    // Get Payment Status
    payment.getStatus(json.transactionRef, amt, getResp);
  }
}

// Authorize Payment
var paymentReqRef = "ISW-SDK-PAYMENT-30";
payment.authorize(pan, expDate, cvv, pin, amt, currency, custId, paymentReqRef, getPaymentResp);
```

## Installation

```bash
$ npm install paymentsdk
```

## Features

See sample code here: https://github.com/techquest/interswitch_javascript/blob/master/server_sdks/payment.js

  * Sends request to Payment API
  * Packages Interswitch Sensitive Data (Card, PIN, CVV, Exp Date)
  * Validates Payment Card - validateCard()
  * Authorizes (Debit) Payment Card - authorize()
  * Verify Payment with OTP before authorization (debit) - verifyOTP()
  * Verify Card Validation with OTP - verifyOTP()
  * Gets Payment Status - getStatus()  
