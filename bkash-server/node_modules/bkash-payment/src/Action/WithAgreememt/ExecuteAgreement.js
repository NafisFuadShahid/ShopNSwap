const axios = require("axios")
const authHeaders = require("../AuthHeaders")

const executeAgreement = async (bkashConfig, paymentID) => {
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

module.exports = executeAgreement
