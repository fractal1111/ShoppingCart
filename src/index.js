
const express = require('express')
const multer = require('multer')
const route = require('./routes/routes')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded( { extended:true } ))
app.use(multer().any())

mongoose
    .connect(
        'mongodb+srv://suryask:mongo302@mycluster1.ogvku.mongodb.net/Project5-DB',
        {
            useNewUrlParser : true
        }
    )
    .then(() => console.log("MongoDb is Ready To Rock..."))
    .catch((err) => console.log(err));

    
app.use("/", route);

app.listen(process.env.PORT || 3000, function () {
  console.log("Express app up and running on port " + (process.env.PORT || 3000));
});
