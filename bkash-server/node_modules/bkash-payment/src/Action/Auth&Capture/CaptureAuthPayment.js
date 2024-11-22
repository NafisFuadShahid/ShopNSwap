const axios = require("axios")
const authHeaders = require("../AuthHeaders")

const captureAuthPayment = async (bkashConfig, paymentID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/payment/confirm/capture`,
    {
      paymentID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  
  return response?.data
}

module.exports = captureAuthPayment
