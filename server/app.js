var express = require('express');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');
var fs = require('fs')
const createDB = require('./db/createDB');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whyDevelopmentDB';
var port = process.env.PORT || 3000;

// Connect to MongoDB
createDB.connect(mongoURI);

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

// Import routes
app.get('/api', function(req, res) {
    res.json({'message': 'Welcome to your DIT342 backend ExpressJS project!'});
});


// Get image from the server
app.get("/api/images/:hash", async function(req, res) {
    const options = {
        root: path.join(__dirname)
    };

    const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}, 'url').exec();
    if (imageObject == null) {
        // invalid hash supplied
        res.status(404).json({ 'message': 'Not Found' });
        return;
    }

    const url = imageObject.url;

    res.sendFile(url, options, function(err) {
        if (err) {
            // hash directory exists, but is empty
            // TODO: check if files present in directory, delete if empty or try fixing DB/file
            res.status(404).json(err);
            console.error('Error sending file:', err);
        } else {
            console.log('Sent:', url);
        }
    });
});

// Delete an image
app.delete("/api/images/:hash", async function(req, res) {
    // TODO: require authorization
    const imageObject = await mongoose.models["Images"].findOne({hash : req.params.hash}).exec();
    if (imageObject.usageCount != 0) {
        res.status(400).json({'message' : 'Image still in use!'});
        return;
    }

    
    console.log("Deleting " + path.join(__dirname, imageObject.url));

    fs.rmSync(path.join(__dirname, "/uploads/" + imageObject.hash), { recursive: true, force: true }); // delete the directory
    await mongoose.models["Images"].deleteOne({_id : imageObject._id}).exec(); // delete the DB entry

    res.status(200).send();
});

// Catch all non-error handler for api (i.e., 404 Not Found)
app.use('/api/*', function (req, res) {
    res.status(404).json({ 'message': 'Not Found' });
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + '/..');
var client = path.join(root, 'client', 'dist');
app.use(express.static(client));

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

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
