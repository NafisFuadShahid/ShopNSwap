const axios = require("axios")
const authHeaders = require("./AuthHeaders")

const queryPayment = async (bkashConfig, paymentID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/payment/status`,
    {
      paymentID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  return response?.data
}

module.exports = queryPayment
