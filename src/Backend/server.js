const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const LoginRoutes = require('./routes/LoginRoutes');
const ProjectsRoutes =require('./routes/ProjectsRoutes');
const InviteRoutes = require('./routes/InviteRoutes');//import the router that tells us how to handle 


const chatRoutes = require('./routes/ChatRoutes');
const MessageRoutes = require('./routes/MessageRoutes');

//express app
const app = express();

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

// Fake user middleware (for testing only)
// Comment this out for now:
// app.use((req, res, next) => {
//     req.user = { _id: "1", name: "Alice" };
//     next();
// });

//routes
app.use('/api/login', LoginRoutes);
app.use('/api/Projects', ProjectsRoutes);
app.use('/api/invite', InviteRoutes);//Tells express to take any request starting with /api/invite to go to InviteRoutes.js

app.use('/api/chats', chatRoutes);      // Now routes will be /api/ and /api/users
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

 
