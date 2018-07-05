const express = require('express')
const mongoose = require('mongoose')
const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')
const bodyParser = require('body-parser')
const passport = require('passport')


const port = process.env.PORT || 5000
const app = express()

//Body parser middleware
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())

const db = require('./config/keys').MONGODB_URI;
//connect to mongodb
mongoose
    .connect(db)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log(err))

//passport middleware
app.use(passport.initialize())
//passport config
require('./config/passport')(passport)



//Use Routes
app.use('/api/users', users)
app.use('/api/profile', profile)
app.use('/api/posts', posts)

if(process.env.NODE_ENV==="production") {
    app.use(express.static('client/build'))
    app.get('*', (req,res) => {
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}
app.listen(port, () => console.log(`Server running on port ${port}.....`))