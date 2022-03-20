const mongoose = require('mongoose')

const FeeConfigSpec = new mongoose.Schema({
    fee_id: {
        type: String,
        unique: true,
        required: true,
    },
    fee_currency: {
        type: String,
        required: true
    },
    fee_locale: {
        type: String,
        required: true
    },
    fee_entity: {
        type: String,
        required: true
    },
    entity_property: {
        type: String,
        required: true
    },
    fee_type: {
        type: String,
        required: true
    },
    fee_value: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('FeeConfigSpec', FeeConfigSpec, 'FeeConfigSpec')