require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const mongoStore = require('connect-mongo');
const session = require('express-session');

const connectDB = require('./server/config/db');
const {isActiveRoute} = require('./server/helpers/routeHelpers')

const app = express();
const PORT = process.env.PORT || 4000;

//connect to DB
connectDB();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUnitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use(express.static('public'));

//Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');


app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/Routes/main'));
app.use('/', require('./server/Routes/admin'));

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})