//top of entry file has imports or requires of other files
var express = require('express');
var bodyParser = require('body-parser');
//path is used to simplify file paths
var path = require('path'); //core module needs no install
var expressValidator = require('express-validator');
var app = express();
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;

// View engine, setting embedded javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//here we add middleware for bodyparser
app.use(bodyParser.json()); //handles parsing .json content
app.use(bodyParser.urlencoded({extended: false}));

//Set static path
app.use(express.static(path.join(__dirname, 'public')));
//public folder is where we put any css files or static resources

//global variable for errors
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});

// In this expVal middleware, 
//the formParam value is going to get morphed into form body format useful for printing.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

var users = [
  {
     id: 1,
     first_name: 'John',
     last_name: 'Doe',
     email: 'johndoe@gmail.com',
  },
   {
     id: 2,
     first_name: 'Bob',
     last_name: 'Smith',
     email: 'bobsmith@gmail.com',
  },
   {
     id: 3,
     first_name: 'Jill',
     last_name: 'Jackson',
     email: 'jjackson@gmail.com',
  }
]

//slash represents homepage
app.get('/', function(req, res){
  db.users.find(function (err,docs) {
    console.log(docs);
    res.render('index', {
      title: 'CustomerApp',
      users: docs
    });
  })
  
});

app.post('/users/add', function(req, res){
  
  req.checkBody('first_name', 'First Name is required').notEmpty();
  req.checkBody('last_name', 'Last Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  
  var errors = req.validationErrors();
  
  if( errors ){
    res.render('index', {
      title: 'CustomerApp',
      users: users,
      errors: errors
    });
    console.log('ERRORS');
  } else {
    var newUser = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email
    }
    db.users.insert(newUser, function(err, result){
      if( err ){
        console.log(err);
      }
      res.redirect('/');
    });
  }
  
});

app.delete('/users/delete/:id', function(req, res){
  db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  });
});

app.listen(3000, function(){
  console.log('Server Started on Port 3000...');
});