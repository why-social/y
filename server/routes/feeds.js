const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const { ValidationError, UnauthorizedError, errorMsg } = require("../utils/errors");
const authMiddleware = require("../middleware/auth");

//#region GET
router.get("/api/v1/feeds/", authMiddleware,
    async function (req, res, next) {
        try {
            if (!req.isAuth || !req.user) {
                throw new UnauthorizedError(errorMsg.UNAUTHORIZED);
            }
            
            let limit = 10;
            let pageNumber = 1;
            
            if (req.query?.page) {
                if (req.query.page < 1) {
                    throw new ValidationError("Page parameter has to be a number greater than 0.")
                } else {
                    pageNumber = req.query.page;
                }
            }
            
            let sorting = -1;
            
            if (req.query?.sort) {
                if (req.query.sort !== "asc" && req.query.sort !== "desc") {
                    throw new ValidationError("Only ascending ('asc') and descending ('desc') sorting is supported.")
                } else {
                    sorting = req.query.sort == "asc" ? 1 : -1;
                }
            }
            
            let followings = await models.User_follows_user
                .find({ follower: req.user.userId }, { follows: true })
                .exec();
            
            let following = [];
            followings.forEach(entry => following.push(entry.follows));
            
            if (!following.length) return res.json({ posts: [] });
            
            const query = {
                author: { $in: following },
                $or: [
                    { is_deleted: { $exists: false } },
                    { is_deleted: false }
                ]
            };

            const result = await models.Posts.find(query)
                .sort({ timestamp: sorting })
                .skip((pageNumber - 1) * limit)
                .limit(limit)
                .populate({
                    path: 'original_post_id',
                    select: 'author',
                    populate: {
                        path: 'author',
                        select: '_id name username profile_picture',
                        populate: {
                            path: 'profile_picture_url'
                        }
                    }
                })
                .populate([
                    {
                        path: 'author',
                        select: '_id name username profile_picture',
                        populate: {
                            path: 'profile_picture_url'
                        }
                    }
                ])
                .populate({
                    path: 'image_urls'
                });

            if (!result || result.length === 0) return res.json({ posts: [] }); 

            const total = await models.Posts.countDocuments(query);
            const feed = {
                posts: result,
            };

            if (pageNumber * limit < total) {
                feed._links = {
                    next: {
                        href: `${req.protocol + '://' + req.get('host')}/api/v1/feeds?page=${(Number(pageNumber) + 1)}`
                    }
                }
            }
            return res.json(feed);
        } catch (err) {
            next(err);
        }
    });
    //#endregion
    
    module.exports = router;
    