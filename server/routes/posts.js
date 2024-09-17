const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;
var ObjectId = require('mongoose').Types.ObjectId; 
const authMiddleware = require('../middleware/auth');

//#region GET
// Returns a post with id :id
router.get("/api/v1/posts/:id", async function (req, res) {
    const post = await models.Posts.findById(req.params.id).populate('comments').exec();
    if (!post) return res.status(404).json({message: 'Post id ' + req.params.id + ' not found'});

    res.json(post);
});

// Returns all posts authored by the user with id :id
router.get("/api/v1/posts/user/:id", async function (req, res) {
    if(!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({message: 'Invalid user ID'});
    }

    const posts = await models.Posts.find({author: req.params.id}).populate('comments').exec();
    if (!posts || posts.length == 0) {
        return res.status(404).json({message: 'Posts of user ' + req.params.id + ' not found'});
    }

    res.json(posts);
});

// returns a boolean representing whether or not a user having :user_id liked a post having :post_id.   
router.get("/api/v1/posts/:post_id/likes/:user_id", async function (req, res) {
    if(!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({message: 'Invalid user ID'});
    }

    if(!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({message: 'Invalid post ID'});
    }

    // TODO: check if DB contains user :user_id && post :post_id

    const post = await models.Posts
        .findOne({_id: req.params.post_id, likes: {$in: [req.params.user_id]}})
        .exec();

    res.json({liked: !!post});
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

router.post("/api/v1/posts/:post_id/likes/:user_id", async function (req, res) {
    if(!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({message: 'Invalid user ID'});
    }

    if(!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({message: 'Invalid post ID'});
    }

    // TODO: check if DB contains user :user_id && post :post_id

    try {
        const post = await models.Posts
            .findOneAndUpdate({_id: req.params.post_id}, {$addToSet: {likes: req.params.user_id}}) // TODO: different return message when already liked
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

        console.log(newData);
        if (!newData.content && !newData.images?.length) { // if not trying to edit only the content and/or images
            return res.status(400).json({message: 'No content for editable fields supplied!'});
        }

        post = await models.Posts.findOneAndUpdate({_id: req.params.id},{$set: newData});
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
        const result = await models.Posts.findByIdAndDelete(req.params.id);
        if (!result) {
            res.status(404).json({message: 'Post ' + req.params.id + ' does not exist!'});
        }
        res.status(200).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

router.delete("/api/v1/posts/:post_id/likes/:user_id", async function (req, res) {
    if(!ObjectId.isValid(req.params.user_id)) {
        return res.status(400).json({message: 'Invalid user ID'});
    }

    if(!ObjectId.isValid(req.params.post_id)) {
        return res.status(400).json({message: 'Invalid post ID'});
    }

    // TODO: check if DB contains user :user_id && post :post_id
    try {
        const post = await models.Posts
            .findOneAndUpdate({_id: req.params.post_id}, {$pull: {likes: req.params.user_id}})
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