const axios = require("axios")
const authHeaders = require("./AuthHeaders")

const refundTransaction = async (bkashConfig, body_data) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/payment/refund`,
    body_data,
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  
  return response?.data
}

module.exports = refundTransaction
