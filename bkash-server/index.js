import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createPayment, executePayment, queryPayment, searchTransaction, refundTransaction } from 'bkash-payment';

const app = express();

//middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// if you have live credentials then put them here
const bkashConfig = {
  base_url : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  username: '01770618567',
  password: 'D7DaC<*E*eG',
  app_key: '0vWQuCRGiUX7EPVjQDr0EUAYtc',
  app_secret: 'jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx'
 }


//initiate bkash checkout
app.post("/bkash-checkout", async(req, res) => {
  try {
    const { amount, callbackURL, orderID, reference } = req.body            // you need to pass these values from client side
    const paymentDetails = {
      amount: amount || 10,                                                 // your product price
      callbackURL : callbackURL,                                            // your callback route
      orderID : orderID || 'Order_101',                                     // your orderID
      reference : reference || '1'                                          // your reference
    }
    const result =  await createPayment(bkashConfig, paymentDetails)
    //send bkash callback url to the client
    // res.send(result)
    res.status(200).send(result?.bkashURL)
  } catch (e) {
    console.log(e)
  }
})


// this will call after bkash payment pop up window open then any action lead to this function call 
app.get("/bkash-callback", async(req, res) => {
  try {
    const { status, paymentID } = req.query // this will come from the url
    let result
    let response = {
      statusCode : '4000',
      statusMessage : 'Payment Failed'
    }
    if(status === 'success')  result =  await executePayment(bkashConfig, paymentID)

    if(result?.transactionStatus === 'Completed'){
      // payment success
      // insert result in your db
      console.log(result);
    }
    if(result) response = {
      statusCode : result?.statusCode,
      statusMessage : result?.statusMessage
    }
    // You may use here WebSocket, server-sent events, or other methods to notify your client
    // res.send(response)
    res.redirect('http://localhost:3000')
  } catch (e) {
    console.log(e)
  }
})

// you can put this for admin section
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

// you can put this for admin section
app.get("/bkash-search", async (req, res) => {
  try {
    const { trxID } = req.query
    const result = await searchTransaction(bkashConfig, trxID)
    res.send(result)
  } catch (e) {
    console.log(e)
  }
})



//Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port:${PORT}`));

//bkash setup done