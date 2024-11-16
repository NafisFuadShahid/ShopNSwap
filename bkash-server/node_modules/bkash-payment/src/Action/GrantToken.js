const axios = require("axios")
const { getValue, setValue } = require("node-global-storage");
const tokenHeaders = require("./TokenHeaders")
const tokenParameters = require("./TokenParameters")

const grantToken = async (bkashConfig) => {
  try {
    const token = getValue("id_token")

    if (!token || isTokenExpired()){
      return await setToken(bkashConfig)
    }

    return token
  } catch (e) {
    console.log(e)
  }
}

const setToken = async(bkashConfig) => {
  const response = await axios.post(
    `${bkashConfig?.base_url}/tokenized/checkout/token/grant`,
    tokenParameters(bkashConfig),
    {
      headers: tokenHeaders(bkashConfig),
    }
  )
  let currentDateTime = new Date()
  setValue("created_at", currentDateTime)
  setValue("id_token", response?.data?.id_token)
  return response?.data?.id_token
}

const isTokenExpired = () => {
  const expiresIn = 60*60*1000   // 1 hr time in miliseconds
  const createdAt = getValue("created_at")
  const currentTime = new Date()
  return (currentTime - createdAt) >= expiresIn
}

module.exports = grantToken
