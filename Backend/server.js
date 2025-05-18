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
const InviteRoutes = require('./routes/InviteRoutes');
const MilestoneRoutes = require('./routes/MilestoneRoutes');
const ReviewRoutes = require('./routes/ReviewRoutes');
const FinanceRoutes = require('./routes/FinanceRoutes');
//const chatRoutes = require('./routes/ChatRoutes');
const MessageRoutes = require('./routes/MessageRoutes'); 
const BucketRoutes = require('./routes/BucketRoutes');


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
app.use('/api/Milestone', MilestoneRoutes);
app.use('/api/Review', ReviewRoutes);
app.use('/api/Finance', FinanceRoutes);
app.use('/api/Bucket', BucketRoutes);

//app.use('/api/chats', chatRoutes);      // Now routes will be /api/ and /api/users
app.use('/api/message', MessageRoutes);




// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT || 4000, () => {  //A minimal and flexible Node.js framework to create backend APIs.
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



