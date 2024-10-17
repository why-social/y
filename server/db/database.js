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
		join_date: { type: "date", default: Date.now },
		birthday: Date,
		last_time_posted: Date,
		profile_picture: { type: String },
	}, { collection: 'users' }),
	User_follows_user: new mongoose.Schema({
		follower: { type: mongoose.Types.ObjectId, ref: "Users" },
		follows: { type: mongoose.Types.ObjectId, ref: "Users" },
	}, { collection: 'user_follows_user' }),
	Images: new mongoose.Schema({
		hash: { type: String, index: true },
		url: String,
		usageCount: {
			type: Number,
			default: 0
		}
	}, { collection: 'images' }),
	Posts: new mongoose.Schema({
		author: {
			type: mongoose.Types.ObjectId,
			ref: "Users",
			required: [true, "Author missing"]
		},
		is_edited: Boolean,
		is_deleted: Boolean,
		content: String,
		timestamp: { type: "date", default: Date.now },
		original_post: { type: mongoose.Types.ObjectId, ref: "Posts", default: null },
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: String }],
	},
		{ collection: 'posts' }),
	Comments: new mongoose.Schema({
		author: {
			type: mongoose.Types.ObjectId,
			ref: "Users",
			required: [true, "Author missing"]
		},
		is_edited: Boolean,
		is_deleted: Boolean,
		content: String,
		timestamp: { type: "date", default: Date.now },
		parent_id: String,
		parent_is_post: Boolean,
		likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
		comments: [{ type: mongoose.Types.ObjectId, ref: "Comments" }],
		images: [{ type: String }],
	}, { collection: 'comments' }),
};
//#endregion

//#region Populate
// Add virtual populate for images in Users, Posts and Comments schemas
schemas.Users.virtual('profile_picture_url', {
	ref: 'Images',
    localField: 'profile_picture',
    foreignField: 'hash',
    justOne: true 
})

schemas.Users.virtual('profile_picture_url').get(function (value) {
    if (!value) return `https://ui-avatars.com/api/?bold=true&name=${this.name}`;
    return value.url; 
});

schemas.Users.set('toObject', { virtuals: true });
schemas.Users.set('toJSON', { virtuals: true });

schemas.Posts.virtual('image_urls', {
    ref: 'Images',
    localField: 'images',
    foreignField: 'hash',
    justOne: false
});

schemas.Posts.virtual('image_urls').get(function (value) {
    if (!value || value.length === 0) return [];
    return value.map(image => image.url);  // Map image documents to their URLs
});

schemas.Posts.set('toObject', { virtuals: true });
schemas.Posts.set('toJSON', { virtuals: true });

schemas.Comments.virtual('image_urls', {
    ref: 'Images',
    localField: 'images',
    foreignField: 'hash',
    justOne: false
});

schemas.Comments.virtual('image_urls').get(function (value) {
    if (!value || value.length === 0) return [];
    return value.map(image => image.url);  // Map image documents to their URLs
});

schemas.Comments.set('toObject', { virtuals: true });
schemas.Comments.set('toJSON', { virtuals: true });
// #endregion

//#region Validation
// Attach custom validation middleware
schemas.Posts.pre('validate', async function (next) {
	if (!this.is_deleted) {
		const user = await models.Users.findById(this.author);

		if (!user) {
			this.invalidate(this.author, "Author does not exist!");
		}

		if (!(this.content || (this.images && this.images.length > 0))) {
			this.invalidate(this.content, "Either text content or at least 1 image required!");
		}
	}

	next();
});

schemas.Comments.pre('validate', async function (next) {
	if (!this.is_deleted) {
		const user = await models.Users.findById(this.author);

		if (!user) {
			this.invalidate(this.author, "Author does not exist!");
		}

		if (!(this.content || (this.images && this.images.length > 0))) {
			this.invalidate(this.content, "Either text content or at least 1 image required!");
		}
	}

	next();
});
//#endregion

// Hash password before saving user
schemas.Users.pre('save', async function (next) {
	if (!this.isModified('password')) return next(); // only hash the password if it has been modified (or is new)
	this.password = await bcrypt.hash(this.password, 10); // hash the password
	next();
});

// Create models for each relation
for (let key in schemas) {
	models[key] = mongoose.model(key, schemas[key]);
}

// Connect to MongoDB (if database doesn't exist, it will be created automatically)
function connect(dbUri) {
	return mongoose.connect(dbUri)
		.catch(err => { // error handling
			console.error(`DB: Failed to connect to MongoDB with URI: ${dbUri}`);
			console.error(err.stack);
			process.exit(1);
		})
		.then(() => onSuccess(dbUri)); // success handling
}

// on successful connection to MongoDB
async function onSuccess(dbUri) {
	console.log(`DB: Connected to MongoDB with URI: ${dbUri}`);

	// get database object
	const db = mongoose.connection.db;

	// get list of existing collections
	const existingCollections = await db.listCollections().toArray();

	// create collections for each model if they don't exist
	const started = Date.now();
	for (let key in models) {
		if (existingCollections.some(col => col.name.toLowerCase() === key.toLowerCase())) {
			console.log(`DB: ${key} collection already exists`);
			continue;
		}
		await models[key].createCollection().catch(err => {
			console.error(`DB: Failed to create ${key} collection`);
			console.error(err.stack);
			process.exit(1);
		});
		console.log(`DB: ${key} collection created`);
		if (key === 'Users') {
			new models[key]({
				username: 'Admin',
				password: process.env.ADMIN_PASSWORD,
				name: 'Admin',
				email: process.env.ADMIN_EMAIL, 
				birthday: Date.now(),
				last_time_posted: null,
				about_me: "",
				profile_picture: null,
			}).save()
			  .then(() => console.log('DB: Admin account created'))
			  .catch(() => console.error('DB: Failed to create admin account'));
		}
	}
	console.log(`DB created in ${Date.now() - started}ms`);
}

module.exports = { mongoose, connect };