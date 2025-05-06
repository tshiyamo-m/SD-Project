const express = require('express')

const {
    submit_review,
    retrieve_reviews_researcher,
    get_all_reviews
} = require('../Controllers/ReviewController')

const router = express.Router()

router.post('/', submit_review)

router.post('/find_research', retrieve_reviews_researcher)

router.post('/get_all_reviews', get_all_reviews)

module.exports = router