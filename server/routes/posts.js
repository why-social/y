const express = require("express");
const router = express.Router();
const models = require("../db/database").mongoose.models;

//GET endpoints region start
router.get("/api/v1/posts/", function (req, res) {
    res.json({ 'message': 'GET test' })
});
//GET endpoints region end

//POST endpoints region start
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
//POST endpoints region end

//PATCH endpoints region start
router.patch("/api/v1/posts/:id", function (req, res) {
    if (checkAuthHeader(req, res)) {
        res.json({ 'message': 'PATCH test' })
    }
});
//PATCH endpoints region end

//DELETE endpoints region start

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