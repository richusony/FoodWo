
require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const { connectMongo } = require('./connection');
const session = require('express-session')

app.use(express.urlencoded({ extended: true }))
app.use(express.json());

//MongoDB Connection
connectMongo(`${process.env.MONGODB_URI}`).then(() => { console.log('MongoDB Connected!!'); })

app.set('view engine', 'ejs');
app.use('/public/', express.static('./public'));

// Session and Cookie
app.use(session({
  secret: "Thisismysecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// mainSearchPage Get Request
app.get('/', (req, res) => {
  res.render('mainSearch');
})

// User Routes
app.use('/user', userRouter);

app.use('/admin', adminRouter)


app.listen(PORT, () => {
  console.log(`Server running on Port : ${PORT}`);
})