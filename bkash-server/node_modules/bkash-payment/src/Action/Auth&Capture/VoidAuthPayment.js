const axios = require("axios")
const authHeaders = require("../AuthHeaders")

const voidAuthPayment = async (bkashConfig, paymentID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/payment/confirm/void`,
    {
      paymentID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  
  return response?.data
}

module.exports = voidAuthPayment
