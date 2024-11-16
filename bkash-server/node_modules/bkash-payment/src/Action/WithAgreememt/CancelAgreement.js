const axios = require("axios")
const authHeaders = require("../AuthHeaders")

const cancelAgreement = async (bkashConfig, agreementID) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/agreement/cancel`,
    {
      agreementID,
    },
    {
      headers: await authHeaders(bkashConfig),
    }
  )
  
  return response?.data
}

module.exports = cancelAgreement
