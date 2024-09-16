const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;
var ObjectId = require('mongoose').Types.ObjectId; 

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
//#endregion

//#region POST
router.post("/api/v1/posts/", async function (req, res) {
    if (checkAuthHeader(req, res)) {
        try {
            const newPost = new models.Posts({
                author: req.body.author,
                is_edited: false,
                content: req.body.content,
                likes: [],
                comments: [],
                images: req.body.images, // assuming array of ObjectID
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
    }
});
//#endregion

//#region PATCH
router.patch("/api/v1/posts/:id", function (req, res) {
    if (checkAuthHeader(req, res)) {
        res.json({ 'message': 'PATCH test' })
    }
});
//#endregion

//#

//DELETE endpoints region end

function checkAuthHeader(req, res) {
    //TODO authentication header verification
    if (!req.headers.authorization /*replace with actual header check*/) {
        res.status(401).json({ "message": "Unauthorised" });

        return false;
    }

    return true;
}

module.exports = router;