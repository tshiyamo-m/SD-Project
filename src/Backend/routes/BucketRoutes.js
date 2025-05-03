const express = require('express')
const {
    Submit_Document
} = require('../Controllers/BucketController')


const router = express.Router()  //create an instance of router


router.post('/submitdoc', User_Files.single('fileDocument'), Submit_Document);

//module.exports = router