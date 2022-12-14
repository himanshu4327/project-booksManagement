const express = require('express');
const bodyParser = require('body-parser'); 
const route = require('./routes/route');
const  mongoose  = require("mongoose")

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://omkar077:BeEHI8wSohCTOfTl@cluster0.tyx7riv.mongodb.net/group14Database",

    {
        useNewUrlParser: true  //you should set useNewUrlparser :true unless to prevent from connecting.
    })
    .then(() => { console.log("MongoDb is connected..."); })
    .catch(err => console.log(err))


app.use('/', route);


app.listen(process.env.PORT || 3000,function () { 
    console.log('express app started on the port ' + (process.env.PORT || 3000))});