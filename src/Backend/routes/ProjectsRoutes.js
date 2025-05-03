const express = require('express')

const {
    submit_project,
    retrieve_projects,
    retrieve_active_projects,
    add_project
} = require('../Controllers/ProjectsController')

const router = express.Router()

router.post('/', submit_project)

router.post('/find', retrieve_projects)

router.post('/find_active_projects', retrieve_active_projects)

router.post('/addproject', add_project)

module.exports = router