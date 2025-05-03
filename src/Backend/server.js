const express = require('express');
const mongoose = require('mongoose');


const cors = require('cors');


require('dotenv').config();


const fs = require('fs');
const path = require('path');
const multer = require('multer');


//File Storage
const { GridFSBucket } = require('mongodb');
const { ObjectId } = mongoose.Types;

const LoginRoutes = require('./routes/LoginRoutes');
const ProjectsRoutes =require('./routes/ProjectsRoutes');
const InviteRoutes = require('./routes/InviteRoutes');//import the router that tells us how to handle 
//const BucketRoutes = require('./routes/BucketRoutes');

//express app
const app = express();
const User_Files = multer({ dest: 'tmp/' });

//CORS Stuff
app.use(cors({
    origin: '*', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
}));


//Middleware
app.use(express.json()) //Checking if any data was in the 'Body' of the request, atttaches it to req if so

app.use((req, res, next) => {
    console.log(req.path, req.method) //Log out incoming requests
    next() //Move to next request 
});

//routes
app.use('/api/login', LoginRoutes);
app.use('/api/Projects', ProjectsRoutes);
app.use('/api/invite', InviteRoutes);//Tells express to take any request starting with /api/invite to go to InviteRoutes.js



// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {  //A minimal and flexible Node.js framework to create backend APIs.
        console.log('connected to db & listening on port', process.env.PORT)
})
    })
    .catch((error) => {
        console.log(error)
    });

let bucket;
mongoose.connection.on('connected', () => {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: 'User_Files'
    });

    module.exports,bucket = bucket;

});

//Submit File
app.post('/Bucket/submitdoc', User_Files.single('file'), (req, res) => {

  const projectId = req.body.ProjectID; 

  const fileStream = fs.createReadStream(req.file.path);
  const uploadStream = bucket.openUploadStream(req.file.originalname,{
      metadata: {
          ProjectId: projectId, // Assuming user is authenticated
          originalPath: req.file.path,
          uploadedAt: new Date()
      }
  });
  
  fileStream.pipe(uploadStream);
  
  uploadStream.on('error', () => {
    res.status(500).json({ error: "Error uploading file" });
  });
  
  uploadStream.on('finish', () => {
    fs.unlinkSync(req.file.path); // Delete temp file
    res.status(201).json({
      message: "File uploaded successfully",
      fileId: uploadStream.id,
      filename: req.file.originalname
    });
  });
});





//Retrieve Files
app.post('/Bucket/retrievedocs', async (req, res) => {
  try {
    const { projectID } = req.body;
    
    if (!projectID) {
      return res.status(400).json({ error: "projectID is required" });
    }

    const objectId = new ObjectId(projectID);
    
    
    // Find all files with matching ProjectId in metadata
    const files = await mongoose.connection.db
      .collection('User_Files.files')
      .find({ 'metadata.ProjectId': projectID }) // Query metadata field
      .toArray();

    if (!files) {
      return res.status(404).json({ error: "No files found for this project" });
    }
    else if (files.length == 0){
      res.json([])
    }
    else{
      res.json(files);
    }

  } catch (err) {
    console.error('Error retrieving documents:', err);
    res.status(400).json({ 
      error: err.message.includes('ObjectId') 
        ? "Invalid projectID format" 
        : "Server error" 
    });
  }
});





//download files
app.post('/Bucket/download', async (req, res) => {

  const { fileId } = req.body;
  console.log('Received download request for fileId:', fileId);

  if (!fileId) {
    return res.status(400).json({ error: "fileId is required" });
  }
  try{

    const objectId = new mongoose.Types.ObjectId(fileId);

    const fileInfo = await mongoose.connection.db
    .collection('User_Files.files')
    .findOne({ _id: objectId });

    console.log(fileInfo);
    
    if (!fileInfo) {
      console.log("File not found");
      return res.status(404).json({ error: "File not found" });
    } 

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
    
    const downloadStream = bucket.openDownloadStream(objectId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', () => {
        res.status(500).json({ error: "Error downloading file" });
    });


  }
  catch(err){
    console.error('Error downloading document:', err);
    res.status(400).json({ error: "Invalid file ID format" });

  }
})



//delete file

app.post('/Bucket/delete', async (req, res) => {

  const { fileId } = req.body;
  console.log('Received delete request for fileId:', fileId);

  if (!fileId) {
    return res.status(400).json({ error: "fileId is required" });
  }
  try{

    const objectId = new mongoose.Types.ObjectId(fileId);

    await bucket.delete(objectId);
    res.json({ success: true, message: "File deleted" });
  }
  catch(err){
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete file" });
  }
})