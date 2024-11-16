const axios = require("axios")
const { v4: uuidv4 } = require("uuid")
const authHeaders = require("../AuthHeaders")

const createAgreement = async (bkashConfig, paymentDetails) => {
  try {
    const { amount, callbackURL, orderID, reference } = paymentDetails
    if(!amount){
      return {
        statusCode : 2065,
        statusMessage : 'amount required'
      }
    }else{
      if(amount < 1){
        return {
          statusCode : 2065,
          statusMessage : 'minimum amount 1'
        }
      }
    }

    if(!callbackURL){
      return {
        statusCode : 2065,
        statusMessage : 'callbackURL required'
      }
    }

    const response = await axios.post(
      `${bkashConfig?.base_url}/tokenized/checkout/create`,
      {
        mode: "0000",
        currency: "BDT",
        intent: "sale",
        amount,
        callbackURL,
        payerReference: reference || "1",
        merchantInvoiceNumber: orderID || "Inv_" + uuidv4().substring(0, 6)
      },
      {
        headers: await authHeaders(bkashConfig),
      }
    )

    return response?.data
  } catch (e) {
    return e
  }
}

module.exports = createAgreement
