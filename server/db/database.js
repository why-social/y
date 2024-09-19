const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Declare variables
let schemas = {};
let models = {};

//#region Schemas
// Create schemas for each relation
schemas = {
	Users: new mongoose.Schema({
		name: String,
		email: String,
		password: String,
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
		author: { 
			type: mongoose.Types.ObjectId, 
			ref: "Users", 
			required: [true, 'Author missing']
		},
		is_edited: Boolean,
		content: String,
		timestamp: { type: "date", default: new Date() },
		original_post_id: { type: mongoose.Types.ObjectId, ref: "Posts", default: null },
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: String, ref: "Images" }],
	}, 
	{ collection: 'posts' }),
	Comments: new mongoose.Schema({
		author: { type: mongoose.Types.ObjectId, ref: "Users" },
		is_edited: Boolean,
		content: String,
		timestamp: { type: "date", default: new Date() },
		parent_id: String,
		parent_is_post: Boolean,
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: String, ref: "Images" }],
	}, { collection: 'comments' }),
};
//#endregion

//#region Validation
// Attach custom validation middleware
schemas.Posts.pre('validate', async function(next) {
	const user = await models.Users.findById(this.author);
	if (!user) {
		this.invalidate(this.author, "Author does not exist!");
	}

	if (!(this.content || (this.images && this.images.length > 0))) {
		this.invalidate(this.content, "Either text content or at least 1 image required!");
	}

	next();
})
//#endregion

// Hash password before saving user
schemas.Users.pre('save', async function(next){
	if(!this.isModified('password')) return next(); // only hash the password if it has been modified (or is new)
	this.password = await bcrypt.hash(this.password, 10); // hash the password
	next();
});

// Create models for each relation
for(let key in schemas){
	models[key] = mongoose.model(key, schemas[key]);
}

// Connect to MongoDB (if database doesn't exist, it will be created automatically)
function connect(dbUri){
	mongoose.connect(dbUri)
	.catch(err => { // error handling
		console.error(`DB: Failed to connect to MongoDB with URI: ${dbUri}`);
		console.error(err.stack);
		process.exit(1);
	})
	.then(() => onSuccess(dbUri)); // success handling
}

// on successful connection to MongoDB
async function onSuccess(dbUri){
	console.log(`DB: Connected to MongoDB with URI: ${dbUri}`);

	// get database object
	const db = mongoose.connection.db;

	// get list of existing collections
	const existingCollections = await db.listCollections().toArray();

	// create collections for each model if they don't exist
	for (let key in models){
		if(existingCollections.some(col => col.name.toLowerCase() === key.toLowerCase())){
			console.log(`DB: ${key} collection already exists`);
			continue;
		}
		await models[key].createCollection().catch(err => {
			console.error(`DB: Failed to create ${key} collection`);
			console.error(err.stack);
			process.exit(1);
		});
		console.log(`DB: ${key} collection created`);
	}
}

module.exports = { mongoose, connect };