const express = require('express')

const {
    submit_milestone,
    retrieve_milestone,
    update_status,
} = require('../Controllers/MilestoneController')

const router = express.Router()

router.post('/', submit_milestone)
router.post('/find', retrieve_milestone)
router.post('/update', update_status)

module.exports = router