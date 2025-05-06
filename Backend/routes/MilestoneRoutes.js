const express = require('express')

const {
    submit_milestone,
    retrieve_milestone,
} = require('../Controllers/MilestoneController')

const router = express.Router()

router.post('/', submit_milestone)
router.post('/find', retrieve_milestone)

module.exports = router