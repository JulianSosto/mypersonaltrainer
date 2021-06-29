const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const methodOverride = require('method-override')
const connectDB = require("./config/db"); 
const passport = require("passport");
const flash = require('connect-flash');
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

//carga config
dotenv.config({ path: "./config/config.env" });
//passport config
require("./config/passport")(passport);
connectDB();

const app = express();
//bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
// Method override
app.use(methodOverride('_method'))

//Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//handlebars helpers
const { json, formatImg, inc, formatDate, stripTags, truncate, editIcon, select} = require("./helpers/hbs");

//handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: {
      json,
      formatImg,
      inc,
      formatDate,
      stripTags,
      truncate,
      editIcon,
      select
    },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
//session middle
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);
//passport middle

app.use(passport.initialize());
app.use(passport.session());
//Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  // console.log(req.user);
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//static
app.use(express.static(path.join(__dirname, "public")));
//routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use('/users', require("./routes/users.js"));
app.use('/plates', require("./routes/plates.js"));
app.use('/diets', require("./routes/diets.js"));

const port = process.env.PORT || 3000;

app.listen(
  port,
  console.log(`Server running in ${process.env.NODE_ENV} mode on ${port}`)
);
