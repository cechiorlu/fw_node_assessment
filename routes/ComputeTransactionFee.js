const express = require('express')
const router = express.Router()
const FeeConfigSpec = require('../models/FeeConfigSpec')


router.post('/compute-transaction-fee', async (req, res) => {
    let chargeAmount, settlementAmount, appliedFeeValue, appliedFeeID
    let transactionAmount = parseFloat(req.body.Amount)
    let paymentEntity = req.body.PaymentEntity
    let locale = req.body.CurrencyCountry === paymentEntity.Country ? 'LOCL' : 'INTL'
    let entityType = paymentEntity.Type

    let entityID = paymentEntity.ID,
        issuer = paymentEntity.Issuer,
        brand = paymentEntity.Brand,
        number = paymentEntity.Number,
        sixId = paymentEntity.SixID

    try {
        // Only NGN transactions are supported for the test
        if (req.body.Currency !== 'NGN') throw new Error(`No fee configuration for ${req.body.Currency} transactions.`)

        // Transaction amount must be non-negative
        if (transactionAmount < 0) throw new Error('invalid transaction amount')

        // Select all applicable configs
        let possibleConfigs = await FeeConfigSpec.find({
            fee_locale: {
                $in: [locale, '*']
            },
            fee_entity: {
                $in: [entityType, '*']
            },
            entity_property: {
                $in: [entityID, issuer, brand, number, sixId, '*']
            }
        });


        // no config found
        if (!possibleConfigs.length) throw new Error("No fee configuration for this transaction")

        // select most specific config
        activeConfig = possibleConfigs.pop()

        appliedFeeID = activeConfig.fee_id

        // calc appliedFeeValue based on fee type
        if (activeConfig.fee_type === 'FLAT') {
            appliedFeeValue = parseFLoat(activeConfig.fee_value)
        } else if (activeConfig.fee_type === 'PERC') {
            appliedFeeValue = transactionAmount * parseFloat(activeConfig.fee_value) / 100
        } else {
            let splitRates = activeConfig.fee_value.split(':')
            let flat_rate = parseFloat(splitRates[0]),
                perc_rate = parseFloat(splitRates[1])

            appliedFeeValue = flat_rate + (transactionAmount * perc_rate / 100)
        }

        // if BearsFee === true, charge customer, else charge merchant
        if (req.body.Customer.BearsFee !== true) {
            chargeAmount = transactionAmount
            settlementAmount = chargeAmount - appliedFeeValue
        }
        else {
            chargeAmount = transactionAmount + appliedFeeValue
            settlementAmount = transactionAmount
        }

        return res.status(200).send({
            "AppliedFeeID": appliedFeeID,
            "AppliedFeeValue": appliedFeeValue,
            "ChargeAmount": chargeAmount,
            "SettlementAmount": settlementAmount
        })
    }
    catch (error) {
        return res.status(400).send({
            "Error": error.message
        })
    }
})


module.exports = router
