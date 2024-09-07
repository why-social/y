const mongoose = require('mongoose');

let schemas = {};
let models = {};

schemas = {
	Users: new mongoose.Schema({
		name: String,
		email: String,
		password_hash: String,
		about_me: String,
		username: String,
		join_date: Date,
		birthday: Date,
		last_time_posted: Date,
		postsNo: Number,
		commentsNo: Number,
		profile_picture: String,
		follows: [String],
	}, {collection: 'users'}),
	Images: new mongoose.Schema({
		url: String,
		id: String,
	}, {collection: 'images'}),
	Likes: new mongoose.Schema({
		user_id: String,
	}, {collection: 'likes'}),
	Posts: new mongoose.Schema({
		id: String,
		author: String,
		is_edited: Boolean,
		content: String,
		timestamp: Date,
		parent_id: String,
		likes: [String],
		comments: [String],
		attachments: [String],
	}, {collection: 'posts'}),
	Reposts: new mongoose.Schema({
		id: String,
		author: String,
		is_edited: Boolean,
		content: String,
		timestamp: Date,
		parent_id: String,
		original_post_id: String,
		likes: [String],
		comments: [String],
		attachments: [String],
	}, {collection: 'reposts'}),
	Comments: new mongoose.Schema({
		id: String,
		author: String,
		is_edited: Boolean,
		content: String,
		timestamp: Date,
		parent_id: String,
		parent_is_post: Boolean,
		attachments: [String],
	}, {collection: 'comments'}),
};

for(let key in schemas){
	models[key] = mongoose.model(key, schemas[key]);
}

function create(dbUri){
	mongoose.connect(dbUri).catch(err => {
		console.error(`DB: Failed to connect to MongoDB with URI: ${dbUri}`);
		console.error(err.stack);
		process.exit(1);
	}).then(() => onSuccess(dbUri));
}

async function onSuccess(dbUri){
	console.log(`DB: Connected to MongoDB with URI: ${dbUri}`);

	const db = mongoose.connection.db;
	const existingCollections = await db.listCollections().toArray();

	for (let key in models) {
		if (!existingCollections.some(col => col.name.toLowerCase() === key.toLowerCase())) {
			await models[key].createCollection();
			console.log(`DB: ${key} collection created`);
		} else {
			console.log(`DB: ${key} collection already exists`);
		}
	}
}

module.exports = { create };