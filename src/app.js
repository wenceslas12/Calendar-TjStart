const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');

const userRouter = require ('../api/routes/user');
const eventsRouter = require('../api/routes/event');
const trainingRouter = require('../api/routes/training');


const publicDirectoryPath = path.join(__dirname, '../public');

const partialsPath = path.join(__dirname, '../templates/partials');
const viewsPath = path.join(__dirname, '../templates/views');

const databaseURL = 'mongodb+srv://VaclavB:e5TXzQJi7jmnP8r@cluster0.bki3x.mongodb.net/calendar?retryWrites=true&w=majority';
// const connectionOptions = {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true
// };


response = mongoose.connect(databaseURL,(err,res) =>{
    if (err){
        console.log("Chyba připojení k DB");
        console.log(err);
    }else {
        console.log("p")
    }
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
const port = process.env.PORT || 3000

app.use(express.json());

app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));

sessionConfiguration = {
    secret: 'Velmi dlouhe slovo',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxage: 1000 * 60 * 60 * 24 * 7
    }//,
    //cookie: { secure: true }
}

app.use(session(sessionConfiguration));
// app.use('js',express.static(__dirname + '/public'));

app.set('view engine','hbs');
app.set('views',viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));
app.use(userRouter);
app.use(eventsRouter);
app.use(trainingRouter);


app.listen(port, () => {
    console.log('Webový server byl spuštěn a naslouchá.')
});