const express = require('express')
const app = express()
const port = 3000
const route = require("./routes/index")
const session = require('express-session')

app.set('view engine', 'ejs')
app.use(express.urlencoded({extended:false}));

// session initialization
app.use(session({
  secret: 'rahasia dong',
  resave: false,
  saveUninitialized: false,
  cookie: { 
      secure: false,
      sameSite: true
  },
}))

app.use('/', route)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})