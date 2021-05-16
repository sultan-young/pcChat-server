const express = require('express');
var createError = require('http-errors');
const app = express();
var path = require('path');
require('./websocket/index')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// 配置body-parser模块

// 这里body-parser模块以及启用了，直接用express就可以调用
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// 正确写法
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');


var indexRouter = require('./routers/index');
app.use('/', indexRouter);
// const tokenMiddleWare = require('./token/checkTokenMiddleWare')
// app.use(tokenMiddleWare)

const usersRouter = require('./routers/account');
app.use('/users', usersRouter);


const chatRouter = require('./routers/chat');
app.use('/chat', chatRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
  });
  
  // error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
