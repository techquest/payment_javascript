/**
 * This extends the RequestError
 * @class RequestError
 * @extends {Error}
 */
class PaymentSDKConfigError extends Error {
   constructor(message) {
        super(message);
    }
}

var Interswitch = require('interswitch');
var jwt = require('jsonwebtoken');
var Buffer = require('buffer/').Buffer;

/** @constructor */
function PaymentSDK(clientid, secret, environment = null)
{
        this.clientid = clientid;
        this.clientSecret = secret;
        this.accessToken = null;
        
        this.InterswitchEnv = {
            ENV_SANDBOX: "SANDBOX",
            ENV_PRODUCTION: "PRODUCTION"
        };
        if (environment != null) {
            this.environment = environment;
        }
        else {
            this.environment = this.InterswitchEnv.ENV_SANDBOX;
        }
	this.interswitch = new Interswitch(this.clientid, this.clientSecret, this.environment);
}

/**
     * Sets the Environment for the Request
     *
     * @param {String} environmentMode
     *
     * @memberOf Interswitch
     */
PaymentSDK.prototype.setEnvironment = function(environmentMode) 
{
  if (environmentMode === this.InterswitchEnv.ENV_SANDBOX) {
    this.environment = this.InterswitchEnv.ENV_SANDBOX;
  }
  else if (environmentMode === this.InterswitchEnv.ENV_PRODUCTION) {
    this.environment = this.InterswitchEnv.ENV_PRODUCTION;
  }
};

PaymentSDK.prototype = {
  get NAIRA(){ return 'NGN'; },
  get DOLLAR(){ return 'USD'; }
}



// Authorize Card
PaymentSDK.prototype.authorize = function()
{
  var arglen = arguments.length;
  var callback = arglen >= 1 ? arguments[arglen - 1] : null;
  var pan = arglen >= 2 ? arguments[0] : null;
  var expDate = arglen >= 3 ? arguments[1] : null;
  var cvv = arglen >= 4 ? arguments[2] : null;
  var pin = arglen >= 5 ? arguments[3] : null;
  var amt = arglen >= 6 ? arguments[4] : null;
  var currency = arglen >= 7 ? arguments[5] : null;
  var customerId = arglen >= 8 ? arguments[6] : null;
  var reqRef = arglen >= 9 ? arguments[7] : null;

  if (callback === null || callback === undefined) {
    throw new PaymentSDKConfigError("callback function must be passed");
  }
  if (pan === null || pan === undefined) {
    throw new PaymentSDKConfigError("PAN (Card No) is required");
  }
  if (expDate === null || expDate === undefined) {
    throw new PaymentSDKConfigError("Expiry Date is required");
  }
  if (cvv === null || cvv === undefined) {
    cvv = '';
  }
  if (pin === null || pin === undefined) {
    pin = '';
  }
  if (amt === null || amt === undefined) {
    throw new PaymentSDKConfigError("Amount is required");
  }
  if (currency === null || currency === undefined) {
    throw new PaymentSDKConfigError("Currency is required");
  }
  if (customerId === null || customerId === undefined) {
    throw new PaymentSDKConfigError("Customer Id is required");
  }
  if (reqRef === null || reqRef === undefined) {
    throw new PaymentSDKConfigError("Request Reference is required");
  }

  var authData = this.interswitch.getAuthData(pan, expDate, cvv, pin);
  var req = '{ "amount": "' + amt + '", "customerId": "' + customerId + '", "transactionRef": "' + reqRef + '", "authData": "' + authData + '", "currency": "' + currency + '"}';
  //console.log("\nPayment Req: " + req);
  this.interswitch.send("api/v2/purchases", "POST", req, callback);
}


// Validate Card
PaymentSDK.prototype.validateCard = function()
{
  var arglen = arguments.length;
  var callback = arglen >= 1 ? arguments[arglen - 1] : null;
  var pan = arglen >= 2 ? arguments[0] : null;
  var expDate = arglen >= 3 ? arguments[1] : null;
  var cvv = arglen >= 4 ? arguments[2] : null;
  var pin = arglen >= 5 ? arguments[3] : null;
  var reqRef = arglen >= 6 ? arguments[4] : null;

  if (callback === null || callback === undefined) {
    throw new PaymentSDKConfigError("callback function must be passed");
  }
  if (pan === null || pan === undefined) {
    throw new PaymentSDKConfigError("PAN (Card No) is required");
  }
  if (expDate === null || expDate === undefined) {
    throw new PaymentSDKConfigError("Expiry Date is required");
  }
  if (cvv === null || cvv === undefined) {
    cvv = '';
  }
  if (pin === null || pin === undefined) {
    pin = '';
  }
  if (reqRef === null || reqRef === undefined) {
    throw new PaymentSDKConfigError("Request Reference is required");
  }

  var authData = this.interswitch.getAuthData(pan, expDate, cvv, pin);
  var req = '{ "transactionRef": "' + reqRef + '", "authData": "' + authData + '"}';
  //console.log("\nValidate Req: " + req);
  this.interswitch.send("api/v2/purchases/validations", "POST", req, callback);
}


// Verify TransactonOTP
PaymentSDK.prototype.verifyOTP = function()
{
  var arglen = arguments.length;
  var callback = arglen >= 1 ? arguments[arglen - 1] : null;
  var tranId = arglen >= 2 ? arguments[0] : null;
  var otp = arglen >= 3 ? arguments[1] : null;

  if (callback === null || callback === undefined) {
    throw new PaymentSDKConfigError("callback function must be passed");
  }
  if (tranId === null || tranId === undefined) {
    throw new PaymentSDKConfigError("Transaction Id is required");
  }
  if (otp === null || otp === undefined) {
    throw new PaymentSDKConfigError("OTP is required");
  }

  var req = '{ "paymentId": "' + tranId + '", "otp": "' + otp + '" }'
  //console.log("OTP Request: " + req);
  this.interswitch.send("api/v2/purchases/otps/auths", "POST", req, callback);
}


// Get Payment Status
PaymentSDK.prototype.getStatus = function()
{
  var arglen = arguments.length;
  var callback = arglen >= 1 ? arguments[arglen - 1] : null;
  var reqRef = arglen >= 2 ? arguments[0] : null;
  var amt = arglen >= 3 ? arguments[1] : null;

  if (callback === null || callback === undefined) {
    throw new PaymentSDKConfigError("callback function must be passed");
  }
  if (reqRef === null || reqRef === undefined) {
    throw new PaymentSDKConfigError("Request Reference is required");
  }
  if (amt === null || amt === undefined) {
    throw new PaymentSDKConfigError("Amount is required");
  }

  var httpHeader = {
    transactionRef: reqRef,
    amount: amt
  };
  
  this.interswitch.send("api/v2/purchases", "GET", null, httpHeader, callback);
}


// Register card for OTP


const Randomize = () => {
  return Math.random() ;
}


module.exports = PaymentSDK;

