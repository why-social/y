const mongoose = require('mongoose');

// Declare variables
let schemas = {};
let models = {};

// Create schemas for each relation
schemas = {
	Users: new mongoose.Schema({
		name: String,
		email: String,
		password_hash: String,
		about_me: String,
		username: String,
		join_date: { type: "date", default: new Date() },
		birthday: Date,
		last_time_posted: Date,
		profile_picture: { type: mongoose.Types.ObjectId, ref: "Images" },
	}, { collection: 'users' }),
	User_follows_user: new mongoose.Schema({
		follower: { type: mongoose.Types.ObjectId, ref: "Users" },
		follows: { type: mongoose.Types.ObjectId, ref: "Users" },
	}, { collection: 'user_follows_user' }),
	Images: new mongoose.Schema({
		hash: { type: String, unique: true, index: true },
		url: String,
		usageCount: Number,
	}, { collection: 'images' }),
	Posts: new mongoose.Schema({
		author: { type: mongoose.Types.ObjectId, ref: "Users" },
		is_edited: Boolean,
		content: String,
		timestamp: { type: "date", default: new Date() },
		original_post_id: { type: mongoose.Types.ObjectId, ref: "Posts", default: null },
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: mongoose.Types.ObjectId, ref: "Images" }],
	}, { collection: 'posts' }),
	Comments: new mongoose.Schema({
		author: { type: mongoose.Types.ObjectId, ref: "Users" },
		is_edited: Boolean,
		content: String,
		timestamp: { type: "date", default: new Date() },
		parent_id: String,
		parent_is_post: Boolean,
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: mongoose.Types.ObjectId, ref: "Images" }],
	}, { collection: 'comments' }),
};

// Create models for each relation
for (let key in schemas) {
	models[key] = mongoose.model(key, schemas[key]);
}

// Connect to MongoDB (if database doesn't exist, it will be created automatically)
function connect(dbUri, failCallback, successCallback) {
	if (mongoose.connection.readyState == 0) { // if disconnected, so that we do not renew the connection by mistake
		mongoose.connect(dbUri)
			.catch(err => { // error handling
				console.error(`DB: Failed to connect to MongoDB with URI: ${dbUri}`);
				console.error(err.stack);

				failCallback();
			})
			.then(async () => { // success handling
				await onSuccess(dbUri, failCallback, successCallback); // wait to create all collections
			});
	}
}

// on successful connection to MongoDB
async function onSuccess(dbUri, failCallback, successCallback) {
	console.log(`DB: Connected to MongoDB with URI: ${dbUri}`);

	// get database object
	const db = mongoose.connection.db;

	// get list of existing collections
	const existingCollections = await db.listCollections().toArray();

	// create collections for each model if they don't exist
	for (let key in models) {
		if (existingCollections.some(col => col.name.toLowerCase() === key.toLowerCase())) {
			console.log(`DB: ${key} collection already exists`);
		} else {
			await models[key].createCollection().catch(err => {
				console.error(`DB: Failed to create ${key} collection`);
				console.error(err.stack);

				failCallback();
			});

			console.log(`DB: ${key} collection created`);
		}
	}

	successCallback();
}

module.exports = { connect, models };