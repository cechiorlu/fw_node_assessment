const express = require('express')
const router = express.Router()
const parseFeeConfigSpec = require('../utils')
const FeeConfigSpec = require('../models/FeeConfigSpec')


router.post('/fees', async (req, res) => {
    let feeConfigurationSpec = req.body.FeeConfigurationSpec
    try {
        let parsedFeeConfigSpec = await parseFeeConfigSpec(feeConfigurationSpec)

        await FeeConfigSpec.create(parsedFeeConfigSpec);
        return res.status(200).send({
            "status": "ok"
        })
    }
    catch (error) {
        return res.status(400).send({
            "status": "error 400",
            message: error.message
        })
    }
})

module.exports = router
