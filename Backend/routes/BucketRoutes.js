const express = require('express')
const {
    fetchFiles,
    deleteFile,
    downloadDoc
} = require('../Controllers/BucketController')


const router = express.Router()  //create an instance of router


//router.post('/retrievedocs', fetchFiles);
//router.post('/delete', deleteFile);
//router.post('/download', downloadDoc);

module.exports = router