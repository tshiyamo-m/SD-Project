const express = require('express')

const {
    submit_finance,
    retrieve_finance,
    update_finance,
} = require('../Controllers/FinanceController')

const router = express.Router()

router.post('/add', submit_finance)
router.post('/find', retrieve_finance)
router.post('/update', update_finance)

module.exports = router