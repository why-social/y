const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;
var ObjectId = require('mongoose').Types.ObjectId;
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload').upload;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

//#region GET
// Returns a post with id :id
router.get("/api/v1/posts/:id", async function (req, res) {
    const post = await models.Posts.findById(req.params.id).populate('comments').exec();
    if (!post) return res.status(404).json({ message: 'Post id ' + req.params.id + ' not found' });

    res.json(post);
});

// Returns all posts authored by the user with id :id
router.get("/api/v1/posts/user/:id", async function (req, res) {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    const posts = await models.Posts.find({ author: req.params.id }).populate('comments').exec();
    if (!posts || posts.length == 0) {
        return res.status(404).json({ message: 'Posts of user ' + req.params.id + ' not found' });
    }

    res.json(posts);
});

// returns a boolean representing whether or not a user having :user_id liked a post having :post_id.   
router.get("/api/v1/posts/:post_id/likes/:user_id", async function (req, res) {
    if (!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    // TODO: check if DB contains user :user_id && post :post_id

    const post = await models.Posts
        .findOne({ _id: req.params.post_id, likes: { $in: [req.params.user_id] } })
        .exec();

    res.json({ liked: !!post });
});
//#endregion

//#region POST
router.post("/api/v1/posts/", authMiddleware, async function (req, res) {
    try {
        const newPost = new models.Posts({
            author: req.body.author, // TODO: check if valid ObjectId
            is_edited: false,
            content: req.body.content,
            likes: [],
            comments: [],
            images: req.body.images, // assuming array of ObjectId
        });
        await newPost.save();
        res.status(200).send();
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        else {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
});

router.post('/api/v1/posts/:post_id/images', authMiddleware, upload.single('image'), async function (req, res) {
    /*if (!req.isAuth || !req.user)
        return res.status(401).json({ message: 'Not logged in' });*/

    if (!ObjectId.isValid(req.params.post_id)) 
        return res.status(400).json({ message: 'Invalid post ID' });

    var post = await models.Posts.findById(req.params.post_id);
    if (!post) 
        return res.status(404).json({ message: 'Post ' + req.params.post_id + ' does not exist' });

    /*if (req.user != post.author)
        return res.status(401).json({ message: 'Unauthorized' });*/


    try {
        const fileBuffer = req.file.buffer; // read file from multer buffer
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex'); // generate hash from the file content
        const dir = path.join(appRoot, '/uploads/', hash);
        const filePath = path.join(dir, req.file.originalname);

        // check if the directory (image) already exists
        if (fs.existsSync(dir)) {
            await models.Images.findOneAndUpdate({hash: hash}, {$inc: {usageCount: 1}}, {new: true}); // only update the existing document in the DB
        }
        else {
            // save the file with its original name inside the /hash directory
            fs.mkdirSync(dir, { recursive: true });         
            fs.writeFileSync(filePath, fileBuffer);
            await new models.Images({hash: hash, url: filePath, usageCount: 1}).save(); // insert new entry into Images collection
        }

        post.images.push(hash); // add the reference to the image to the post
        await post.save();
        res.status(200).json(post);
    }
    catch (error) {
        // TODO: delete file/db entry if necessary
        console.log(error.message);
        res.status(500).send(error.message);
    }
});

router.post("/api/v1/posts/:post_id/likes/:user_id", async function (req, res) {
    if (!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    // TODO: check if DB contains user :user_id && post :post_id

    try {
        const post = await models.Posts
            .findOneAndUpdate({ _id: req.params.post_id }, { $addToSet: { likes: req.params.user_id } }, { new: true }) // TODO: different return message when already liked
            .exec();
        res.status(200).json(post);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        else {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }

});
//#endregion

//#region PATCH
router.patch("/api/v1/posts/:id", authMiddleware, async function (req, res) {
    try {
        const newData = {
            content: req.body.content,
            images: req.body.images,
            is_edited: true
        }; // filter incoming request to only the editable fields

        if (!newData.content && !newData.images?.length) { // if not trying to edit only the content and/or images
            return res.status(400).json({ message: 'No content for editable fields supplied!' });
        }

        post = await models.Posts.findOneAndUpdate({ _id: req.params.id }, { $set: newData }, { new: true }).exec();
        res.status(200).json(post);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        else {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }
});
//#endregion

//#region DELETE
router.delete("/api/v1/posts/:id", authMiddleware, async function (req, res) {
    try {
        const result = await models.Posts.findByIdAndDelete(req.params.id).exec();
        if (!result) {
            res.status(404).json({ message: 'Post ' + req.params.id + ' does not exist!' });
        }
        res.status(200).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/api/v1/posts/:post_id/likes/:user_id", authMiddleware, async function (req, res) {
    if (!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
    }

    // TODO: check if DB contains user :user_id && post :post_id
    try {
        const post = await models.Posts
            .findOneAndUpdate({ _id: req.params.post_id }, { $pull: { likes: req.params.user_id } }, { new: true })
            .exec();
        res.status(200).json(post);
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        }
        else {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }

});
//#endregion

module.exports = router;