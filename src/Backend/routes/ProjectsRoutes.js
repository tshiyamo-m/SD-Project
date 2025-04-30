const express = require('express')

const {
    submit_project
} = require('../Controllers/ProjectsController')

const router = express.Router()

router.post('/', submit_project)

module.exports = router