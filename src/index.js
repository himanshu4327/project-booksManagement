const express = require('express');
const bodyParser = require('body-parser'); 
const route = require('./routes/route');
const { default: mongoose } = require("mongoose")

const app = express();

app.use(bodyParser.json());

mongoose.connect("mongodb+srv://omkar077:BeEHI8wSohCTOfTl@cluster0.tyx7riv.mongodb.net/DB4",

    {
        useNewUrlParser: true  //you should set useNewUrlparser :true unless to prevent from connecting.
    })
    .then(() => { console.log("MongoDb is connected..."); })
    .catch(err => console.log(err))


app.use('/', route);


app.listen(process.env.PORT || 3000,function () { 
    console.log('express app started on the port ' + (process.env.PORT || 3000))});