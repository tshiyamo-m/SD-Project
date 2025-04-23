const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const LoginRoutes = require('./routes/LoginRoutes');
const ProjectsRoutes =require('./routes/ProjectsRoutes');

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


//routes
app.use('/api/login', LoginRoutes);
app.use('/api/Projects', ProjectsRoutes);




// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        //listen for requests
        app.listen(process.env.PORT, () => {
        console.log('connected to db & listening on port', process.env.PORT)
})
    })
    .catch((error) => {
        console.log(error)
    });

 
