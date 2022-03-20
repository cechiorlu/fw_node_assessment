function configValidation(configParams) {
    // Ensure all configuration specs are passed in
    if (configParams.length !== 8) {
        throw new Error('some specifications are missing')
    }

    // Ensure Fee id is alphanumeric and 8 character long
    if (!configParams[0].match(/^[0-9a-zA-Z]+$/)) {
        throw new Error('incorrect fee-id format')
    };

    // Ensure fee-currency is NGN
    if (configParams[1] !== 'NGN') {
        throw new Error('currency should be NGN')
    }

    // Ensure fee locale is either 'INTL' or 'LOCL'
    if (!['INTL', 'LOCL', '*'].includes(configParams[2])) {
        throw new Error('fee-locale should be either INTL or LOCL')
    }

    // Ensure fee-entity property is specified
    if (!configParams[3].includes('(')) {
        throw new Error('entity property not specified')
    }

    // Ensure fee-entity is either 'CREDIT-CARD, DEBIT-CARD, BANK-ACCOUNT, USSD or WALLET-ID'
    if (!['CREDIT-CARD', 'DEBIT-CARD', 'BANK-ACCOUNT', 'USSD', 'WALLET-ID', '*'].includes(configParams[3].split('(')[0])) {
        throw new Error('Invalid fee-entity')
    }

    // Ensure fee-type is either 'FLAT', 'PERC' or 'FLAT_PERC'
    if (!['FLAT', 'PERC', 'FLAT_PERC'].includes(configParams[6])) {
        throw new Error('Invalid fee-type')
    }

    // Ensure two values are passed in when fee-type === 'FLAT_PERC'
    if (configParams[6] === 'FLAT_PERC' && !configParams.includes(':')) {
        throw new Error('Invalid fee-value')
    }

    // // Ensure fee-value is numeric and non negative. In cases where fee-type === 'FLAT_PERC', fee-value should take the form '{FLAT-VALUE}:{PERC-VALUE}'
    // if(configParams[7].includes(':') && parseFloat(configParams[7].split(':')[0]) < 0 ) return false

    // if(!configParams[7].includes(':') && parseFloat(configParams[7]) >= 0){
    //     return !!parseFloat(configParams[7])
    // }

    return true
}

function compare(a,b){
    // sort from more generic to specific config entries with entity property taking priority over fee entity and fee locale
    if (a.entity_property === '*' && b.entity_property !== '*' ){
        return -1
    }
    else if (a.entity_property !== '*' && b.entity_property === '*' ){
        return 1
    } else {
        if (a.fee_entity === '*' && a.fee_locale === '*' && b.fee_entity !== '*' || b.fee_locale !== '*'){
            return -1
        }
        else if (a.fee_entity !== '*' || a.fee_locale !== '*' && b.fee_entity === '*' && b.fee_locale === '*'){
            return 1
        }
    }
}

function parseFeeConfigSpec(string) {
    let config = string.split("\n")

    let tmpStore = []

    config.forEach((spec) => {
        let currentConfig = {}
        const params = spec.split(' ')

        configValidation(params)

        currentConfig['fee_id'] = params[0]
        currentConfig['fee_currency'] = params[1]
        currentConfig['fee_locale'] = params[2]
        currentConfig['fee_entity'] = params[3].split('(')[0]
        currentConfig['entity_property'] = params[3].split('(')[1].slice(0,-1)
        currentConfig['fee_type'] = params[6]
        currentConfig['fee_value'] = params[7]

        tmpStore.push(currentConfig)

    })

    tmpStore.sort(compare)
    return tmpStore
}

module.exports = parseFeeConfigSpec