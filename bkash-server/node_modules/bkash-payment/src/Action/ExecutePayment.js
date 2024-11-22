const axios = require("axios")
const authHeaders = require("./AuthHeaders")


const executePayment = async (bkashConfig, paymentID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/execute`,
    {
      paymentID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )

  return response?.data
}

module.exports = executePayment
