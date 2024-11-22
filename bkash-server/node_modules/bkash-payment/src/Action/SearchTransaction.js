const axios = require("axios")
const authHeaders = require("./AuthHeaders")

const searchTransaction = async (bkashConfig, trxID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/general/searchTransaction`,
    {
      trxID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )

  return response?.data
}

module.exports = searchTransaction
