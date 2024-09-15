var express = require('express');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');
var database = require('./db/createDB');
const postsRoute = require('./routes/posts');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whyDevelopmentDB';
var port = process.env.PORT || 3000;

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

// Get environment
var env = app.get('env');

// Connect to MongoDB
database.connect(mongoURI,
    () => { // failure callback
        console.log('Process will exit due to defective data persistency.')
        process.exit(1)
    },
    () => { // success callback
        importRoutes();
        configureVue();
        registerErrorHandler();

        app.listen(port, function (err) {
            if (err) throw err;
            console.log(`Express server listening on port ${port}, in ${env} mode`);
            console.log(`Backend: http://localhost:${port}/api/`);
            console.log(`Frontend (production): http://localhost:${port}/`);
        });
    }
);

function importRoutes() {
    app.get('/api/v1/', function (req, res) {
        res.status(200).json({ 'message': 'Alive' });
    });

    app.use('/', postsRoute);

    // Catch all non-error handler for api (i.e., 404 Not Found)
    app.use('/api/*', function (req, res) {
        res.status(404).json({ 'message': 'Not Found' });
    });
}

function configureVue() {
    // Configuration for serving frontend in production mode
    // Support Vuejs HTML 5 history mode
    app.use(history());
    // Serve static assets
    var root = path.normalize(__dirname + '/..');
    var client = path.join(root, 'client', 'dist');
    app.use(express.static(client));
}

function registerErrorHandler() {
    // Error handler (i.e., when exception is thrown) MUST be registered last
    // eslint-disable-next-line no-unused-vars
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        let err_res = {
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
}

module.exports = app;
