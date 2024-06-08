var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// 引入路由
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var qlRouter = require('./routes/qinglong');

var app = express();
if (process.env.NODE_ENV === 'development') {
  const cors = require('cors');
  app.use(cors());
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// 既保留了upload路径，又把data/upload设置成静态路径
app.use('/upload', express.static(path.join(__dirname, 'data/upload')));

//关于青龙
app.use('/v', express.static(path.join(__dirname, 'public/vue'))); //v用来表示vue打包出来的
app.use('/v/env', express.static(path.join(__dirname, 'public/vue/index.html'))); //路由页面

// 注册路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/ql', qlRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});



// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
