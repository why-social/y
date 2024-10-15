const express = require("express");
const router = express.Router();
const mongoose = require("../db/database").mongoose;
const models = mongoose.models;
const { ValidationError, UnauthorizedError, errorMsg } = require("../utils/errors");
const { toPublicPath, getPublicPathFromHash } = require('../utils/utils')
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

            let result = await models.User_follows_user
                .find({ follower: req.user.userId }, { follows: true })
                .exec();

            let following = [];
            result.forEach(entry => {
                following.push(entry.follows);
            });

            if (following.length) {
                result = await models.Posts.aggregate([{
                    $match: {
                        author: { $in: following },
                        $or: [
                            { is_deleted: { $exists: false } },
                            { is_deleted: false }
                        ]
                    },
                },
                {
                    $sort: {
                        timestamp: sorting
                    }
                },
                // Populate the 'author' field
                {
                    $lookup: {
                        from: 'users',
                        localField: 'author',
                        foreignField: '_id',
                        as: 'author'
                    }
                },
                // Unwind the 'author' array (since lookup returns an array)
                {
                    $unwind: '$author'
                },
                {
                    $project: {
                        author: {
                            email: 0,
                            password: 0,
                            about_me: 0,
                            birthday: 0,
                            join_date: 0,
                            last_time_posted: 0
                        }
                    }
                },
                // Populate 'profile_picture'
                {
                    $lookup: {
                        from: 'images',
                        localField: 'author.profile_picture',
                        foreignField: 'hash',
                        as: 'author.profile_picture'
                    }
                },
                {
                    $unwind: { path: '$author.profile_picture', preserveNullAndEmptyArrays: true } // Unwind profile picture data, allow null values
                },
                {
                    $facet: {
                        metadata: [{ $count: "total" }, { $addFields: { page: pageNumber } }],
                        data: [{ $skip: (pageNumber - 1) * limit }, { $limit: limit }]
                    }
                }]).exec();

                if (result && result.length && result[0] && result[0].data) {
                    const feed = {
                        posts: result[0].data
                    };

                    for (let post of feed.posts) {
                        if (post.author?.profile_picture) {
                            post.author.profile_picture = await getPublicPathFromHash(req, post.author.profile_picture.url);
                        } else {
                            post.author.profile_picture = `https://ui-avatars.com/api/?bold=true&name=${post.author.name}`
                        }        

                        post.images = await Promise.all(
                            post.images.map(async image => {
                                return await getPublicPathFromHash(req, image);
                            })
                        );
                    }

                    if (result[0].metadata?.length) {
                        const page = Number(result[0].metadata[0].page);
                        const total = Number(result[0].metadata[0].total);

                        if (page * limit < total) {
                            feed._links = {
                                next: {
                                    href: `${req.protocol + '://' + req.get('host')}/api/v1/feeds?page=${(page + 1)}`
                                }
                            }
                        }
                    }

                    return res.json(feed);
                } else {
                    return res.json({
                        posts: []
                    });
                }
            } else {
                return res.json({
                    posts: []
                });
            }
        } catch (err) {
            next(err);
        }
    });
//#endregion

module.exports = router;
