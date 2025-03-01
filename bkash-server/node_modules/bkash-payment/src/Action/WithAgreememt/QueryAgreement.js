const axios = require("axios")
const authHeaders = require("../AuthHeaders")

const queryAgreement = async (bkashConfig, agreementID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/agreement/status`,
    {
      agreementID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  
  return response?.data
}

module.exports = queryAgreement
