require('dotenv').config();
var express = require('express');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');

const database = require('./db/database');
const checkDBAvailability = require('./middleware/checkDB');
const feedsRoute = require('./routes/feeds')
const commentsRoute = require('./routes/comments')
const imagesRoute = require('./routes/images');
const postsRoute = require('./routes/posts');
const userRoute = require('./routes/users');
const loginRoute = require('./routes/login');
const restorePasswordRoute = require('./routes/restorePassword');
const { AppError, castErrorHandler, NotFoundError, errorMsg } = require('./utils/errors');

global.appRoot = path.resolve(__dirname);

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whyDB';
var port = process.env.PORT || 3000;

// Connect to MongoDB
database.connect(mongoURI);

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan('dev'));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

app.use(checkDBAvailability);

app.get('/api', function(req, res) {
    res.json({'message': 'Alive!'}); // needed for test script to see if the server booted up
});

// Import routes
app.use('/', userRoute);
app.use('/', loginRoute);
app.use('/', postsRoute);
app.use('/', commentsRoute);
app.use('/', feedsRoute);
app.use('/', imagesRoute);
app.use('/', restorePasswordRoute);

// Catch all non-error handler for api (i.e., 404 Not Found)
app.use('/api/*', function (req, res, next) {
    const err = new NotFoundError(errorMsg.NOT_FOUND);
	next(err);
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + '/..');
var client = path.join(root, 'client', 'dist');
app.use(express.static(client));

// Error handler for custom errors
app.use(castErrorHandler);
app.use((err, req, res, next) => {
	if (err instanceof AppError || err.isAppError) {
		return res.status(err.statusCode).json({ message: err.message });
	}

	next(err);
	//res.status(500).json({message: "Server error"});
});

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get('env');
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        // Return sensitive stack trace only in dev mode
        err_res['error'] = err.stack;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
