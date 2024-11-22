## bKash Payment Gateway

A Library to integrate bKash Payment Gateway in your application.
Covered bKash Checkout (URL), With & Without Agreement, Auth & Capture.

# NPM Install

```
npm install bkash-payment
```

# Yarn Install

```
yarn add bkash-payment
```

# Sandbox Config

```
const bkashConfig = {
  base_url : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  username: '01770618567',
  password: 'D7DaC<*E*eG',
  app_key: '0vWQuCRGiUX7EPVjQDr0EUAYtc',
  app_secret: 'jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx'
 }
```

# Live Config

```
const bkashConfig = {
 base_url : 'https://tokenized.pay.bka.sh/v1.2.0-beta',
 username: 'your_bkash_username',
 password: 'your_bkash_password',
 app_key: 'your_bkash_app_key',
 app_secret: 'your_bkash_app_secret'
}
```

## Tokenized Without Agreement or Checkout URL

bkashPaymentGateway.js

```
const express = require('express')
const { createPayment, executePayment, queryPayment, searchTransaction, refundTransaction } = require('bkash-payment')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

// Middleware setup
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// bKash Credentials setup
const bkashConfig = {
  base_url : 'bKash_base_url',
  username: 'your_bkash_username',
  password: 'your_bkash_password',
  app_key: 'your_bkash_app_key',
  app_secret: 'your_bkash_app_secret'
 }

app.post("/bkash-checkout", async(req, res) => {
  try {
    const { amount, callbackURL, orderID, reference } = req.body
    const paymentDetails = {
      amount: amount || 10,                                                 // your product price
      callbackURL : callbackURL || 'http://127.0.0.1:3000/bkash-callback',  // your callback route
      orderID : orderID || 'Order_101',                                     // your orderID
      reference : reference || '1'                                          // your reference
    }
    const result =  await createPayment(bkashConfig, paymentDetails)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-callback", async(req, res) => {
  try {
    const { status, paymentID } = req.query
    let result
    let response = {
      statusCode : '4000',
      statusMessage : 'Payment Failed'
    }
    if(status === 'success')  result =  await executePayment(bkashConfig, paymentID)

    if(result?.transactionStatus === 'Completed'){
      // payment success
      // insert result in your db
    }
    if(result) response = {
      statusCode : result?.statusCode,
      statusMessage : result?.statusMessage
    }
    // You may use here WebSocket, server-sent events, or other methods to notify your client
    res.send(response)
  } catch (e) {
    console.log(e)
  }
})

// Add this route under admin middleware
app.post("/bkash-refund", async (req, res) => {
  try {
    const { paymentID, trxID, amount } = req.body
    const refundDetails = {
      paymentID,
      trxID,
      amount,
    }
    const result = await refundTransaction(bkashConfig, refundDetails)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-search", async (req, res) => {
  try {
    const { trxID } = req.query
    const result = await searchTransaction(bkashConfig, trxID)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.get("/bkash-query", async (req, res) => {
  try {
    const { paymentID } = req.query
    const result = await queryPayment(bkashConfig, paymentID)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})

app.listen(port, () =>
  console.log(`Example app listening at http://127.0.0.1:${port}`)
)

```

# Create Payment

```
  const paymentDetails = {
      amount: 10,                                      // your product price
      callbackURL : 'http://127.0.0.1:3000/callback',  // your callback route
      orderID : 'Order_101',                           // your orderID
      reference : '1'                                  // your reference
    }
const result =  await createPayment(bkashConfig, paymentDetails)
```

# Execute Payment

```
const result =  await executePayment(bkashConfig, paymentID)
```

# Query Payment

```
const result =  await queryPayment(bkashConfig, paymentID)
```

# Search Transaction

```
const result =  await searchTransaction(bkashConfig, trxID)
```

# Refund Transaction

```
const refundDetails = {
paymentID: "TR101001111",
trxID: "ASFFDDD8G",
amount: 10
}
const result =  await refundTransaction(bkashConfig, refundDetails)
```

## Tokenized With Agreement

const { createAgreement, executeAgreement, cancelAgreement, createPaymentWithAgreement, executePayment, queryPayment, searchTransaction, refundTransaction } = require('bkash-payment')

# Create Agreement

```
  const paymentDetails = {
      amount: 10,                                                // your product price
      callbackURL : 'http://127.0.0.1:3000/agreement-callback',  // your callback route
      orderID : 'Order_101',                                     // your orderID
      reference : '1'                                            // your reference
    }
const result =  await createAgreement(bkashConfig, paymentDetails)
```

# Execute Agreement

```
const result =  await executeAgreement(bkashConfig, paymentID)
```

# Cancel Agreement

```
const result =  await cancelAgreement(bkashConfig, agreementID)
```

# Query Agreement

```
const result =  await queryAgreement(bkashConfig, agreementID)
```

# Create Payment With Agreement

```
  const paymentDetails = {
      agreementID: "TokenizedMerchant01L3IKB6H1565072174986"            // agreementID from executeAgreement API
      amount: 10,                                                       // your product price
      callbackURL : 'http://127.0.0.1:3000/payment-callback',           // your callback route
      orderID : 'Order_101',                                            // your orderID
      reference : '1'                                                   // your reference
    }
const result =  await createPaymentWithAgreement(bkashConfig, paymentDetails)
```

# Execute Payment

```
const result =  await executePayment(bkashConfig, paymentID)
```

# Query Payment

```
const result =  await queryPayment(bkashConfig, paymentID)
```

# Search Transaction

```
const result =  await searchTransaction(bkashConfig, trxID)
```

# Refund Transaction

```
const refundDetails = {
paymentID: "TR101001111",
trxID: "ASFFDDD8G",
amount: 10
}
const result =  await refundTransaction(bkashConfig, refundDetails)
```

## Auth & Capture

const { createAuthPayment, executePayment, captureAuthPayment, voidAuthPayment, queryPayment, searchTransaction } = require('bkash-payment')

# Create Payment

```
  const paymentDetails = {
      amount: 10,                                           // your product price
      callbackURL : 'http://127.0.0.1:3000/auth-callback',  // your callback route
      orderID : 'Order_101',                                // your orderID
      reference : '1'                                       // your reference
    }
const result =  await createAuthPayment(bkashConfig, paymentDetails)
```

# Execute Payment

```
const result =  await executePayment(bkashConfig, paymentID)
```

# Capture Payment

```
const result =  await captureAuthPayment(bkashConfig, paymentID)
```

# Void Payment

```
const result =  await voidAuthPayment(bkashConfig, paymentID)
```

# Query Payment

```
const result =  await queryPayment(bkashConfig, paymentID)
```

# Search Transaction

```
const result =  await searchTransaction(bkashConfig, trxID)
```

