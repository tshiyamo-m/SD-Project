const express = require('express')

const {
    submit_project,
    retrieve_projects,
    add_project,
    update_project,
    retrieve_active_projects,
    get_all_projects
} = require('../Controllers/ProjectsController')

const router = express.Router()

router.post('/', submit_project)

router.post('/find', retrieve_projects)

router.post('/find_active_projects', retrieve_active_projects)

router.post('/addproject', add_project)

router.post('/updateproject', update_project )

router.post('/get_all_users', get_all_projects )

module.exports = router