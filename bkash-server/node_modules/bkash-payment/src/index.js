// Common
const executePaymentAPI = require("./Action/ExecutePayment")
const queryPaymentAPI = require("./Action/QueryPayment")
const searchTransactionAPI = require("./Action/SearchTransaction")
const refundTransactionAPI = require("./Action/RefundTransaction")

// Without Agreement
const createPaymentAPI = require("./Action/WithoutAgreement/CreatePayment")

// With Agreement
const createAgreementAPI = require("./Action/WithAgreememt/CreateAgreement")
const executeAgreementAPI = require("./Action/WithAgreememt/ExecuteAgreement")
const cancelAgreementAPI = require("./Action/WithAgreememt/CancelAgreement")
const queryAgreementAPI = require("./Action/WithAgreememt/QueryAgreement")
const createPaymentWithAgreementAPI = require("./Action/WithAgreememt/CreatePaymentWithAgreement")

// Auth & Capture
const createAuthPaymentAPI = require("./Action/Auth&Capture/CreateAuthPayment")
const captureAuthPaymentAPI = require("./Action/Auth&Capture/CaptureAuthPayment")
const voidAuthPaymentAPI = require("./Action/Auth&Capture/VoidAuthPayment")



// Common API 
async function executePayment(bkashConfig, paymentID) {
  return await executePaymentAPI(bkashConfig, paymentID)
}

async function queryPayment(bkashConfig, paymentID) {
  return await queryPaymentAPI(bkashConfig, paymentID)
}

async function searchTransaction(bkashConfig, trxID) {
  return await searchTransactionAPI(bkashConfig, trxID)
}

async function refundTransaction(bkashConfig, refundInfo) {
  const { paymentID, trxID, amount, sku, reason } = refundInfo
  const response = await refundTransactionAPI(bkashConfig, {
    paymentID,
    trxID
  })

  if (response?.refundTrxID) {
    return response
  } else {
    return await refundTransactionAPI(bkashConfig, {
      paymentID,
      trxID,
      amount,
      sku: sku || "Test",
      reason: reason || "Test",
    })
  }
}


// Checkout URL (Without Agreement)
async function createPayment(bkashConfig, paymentDetails) {
  return await createPaymentAPI(bkashConfig, paymentDetails)
}


// With Agreement
async function createAgreement(bkashConfig, paymentDetails) {
  return await createAgreementAPI(bkashConfig, paymentDetails)
}

async function executeAgreement(bkashConfig, paymentID) {
  return await executeAgreementAPI(bkashConfig, paymentID)
}

async function cancelAgreement(bkashConfig, agreementID) {
  return await cancelAgreementAPI(bkashConfig, agreementID)
}

async function queryAgreement(bkashConfig, agreementID) {
  return await queryAgreementAPI(bkashConfig, agreementID)
}

async function createPaymentWithAgreement(bkashConfig, paymentDetails) {
  return await createPaymentWithAgreementAPI(bkashConfig, paymentDetails)
}


// Auth & Capture
async function createAuthPayment(bkashConfig, paymentDetails) {
  return await createAuthPaymentAPI(bkashConfig, paymentDetails)
}

async function captureAuthPayment(bkashConfig, paymentID) {
  return await captureAuthPaymentAPI(bkashConfig, paymentID)
}

async function voidAuthPayment(bkashConfig, paymentID) {
  return await voidAuthPaymentAPI(bkashConfig, paymentID)
}


module.exports = {
    createPayment,
    executePayment,
    queryPayment,
    searchTransaction,
    refundTransaction,
    createAuthPayment,
    captureAuthPayment,
    voidAuthPayment,
    createAgreement,
    executeAgreement,
    cancelAgreement,
    queryAgreement,
    createPaymentWithAgreement

}
