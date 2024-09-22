var { faker } = require('@faker-js/faker');
var database = require('../db/database');
var models = database.mongoose.models;

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whyDB';

database.connect(mongoURI)
    .then(async () => {
        try {
            // Generate mock images
            const images = [];
            for (let i = 0; i < 50; i++) {
                const image = new models.Images({
                    hash: generateHash(),
                    url: faker.internet.url()
                });

                //NOTE: save images to db when used
                images.push(image);
            }

            console.log('Generated mock images.');

            // Generate mock users
            const users = [];
            for (let i = 0; i < 25; i++) {
                const user = new models.Users({
                    name: faker.person.firstName() + " " + faker.person.lastName(),
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                    username: faker.internet.userName(),
                    join_date: faker.date.past(),
                    birthday: faker.date.past(30, new Date('1950-01-01')),
                    last_time_posted: faker.date.recent(),
                });

                if (faker.datatype.boolean()) {
                    user.about_me = faker.person.bio();
                }

                if (faker.datatype.boolean()) {
                    const targetImage = images[faker.number.int({ min: 0, max: images.length - 1 })];
                    targetImage.usageCount = targetImage.usageCount + 1;

                    user.profile_picture = targetImage.hash;

                    await targetImage.save();
                }

                users.push(user);
                await user.save();
            }

            console.log('Generated mock users.');

            // Generate mock posts
            const posts = [];
            for (let i = 0; i < 50; i++) {
                let userIndex = faker.number.int({ min: 0, max: users.length - 1 });

                const post = new models.Posts({
                    author: users[userIndex]._id,
                    is_edited: faker.datatype.boolean(),
                    is_deleted: faker.datatype.boolean(),
                    likes: users.map(user => user._id).slice(0, faker.number.int({ min: 0, max: users.length - 1 })),
                });

                post.timestamp = faker.date.recent();
                users[userIndex].last_time_posted = post.timestamp;

                await users[userIndex].save();

                if (post.is_deleted) {
                    post.content = null;
                } else if (faker.datatype.boolean()) {
                    post.content = faker.lorem.paragraph()
                }

                if (!faker.number.int({ min: 0, max: 5 }) && posts.length > 0) {
                    post.original_post_id = posts[faker.number.int({ min: 0, max: posts.length - 1 })]
                }

                while (post.content !== null && (faker.datatype.boolean() ||
                    (post.content === undefined && !post.images?.length))) {
                    const targetImage = images[faker.number.int({ min: 0, max: images.length - 1 })];
                    targetImage.usageCount = targetImage.usageCount + 1;

                    post.images.push(targetImage.hash);

                    await targetImage.save();
                }

                posts.push(post);
                await post.save();
            }

            console.log('Generated mock posts.');

            // Generate mock comments
            const comments = [];
            for (let i = 0; i < 125; i++) {
                let userIndex = faker.number.int({ min: 0, max: users.length - 1 });

                const comment = new models.Comments({
                    author: users[userIndex]._id,
                    is_edited: faker.datatype.boolean(),
                    is_deleted: faker.datatype.boolean(),
                    timestamp: faker.date.recent(),
                    likes: users.map(user => user._id).slice(0, faker.number.int({ min: 0, max: users.length - 1 })),
                });

                if (comment.is_deleted) {
                    comment.content = null;
                } else if (faker.datatype.boolean()) {
                    comment.content = faker.lorem.paragraph()
                }

                if (!faker.number.int({ min: 0, max: 5 }) && comment.length > 0) {
                    if (faker.datatype.boolean()) {
                        comment.parent_is_post = true;
                        comment.parent_id = posts[faker.number.int({ min: 0, max: posts.length - 1 })];
                    } else {
                        comment.parent_id = comments[faker.number.int({ min: 0, max: comments.length - 1 })]
                    }
                }

                while (comment.content !== null && (faker.datatype.boolean() ||
                    (comment.content === undefined && !comment.images?.length))) {
                    const targetImage = images[faker.number.int({ min: 0, max: images.length - 1 })];
                    targetImage.usageCount = targetImage.usageCount + 1;

                    comment.images.push(targetImage.hash);

                    await targetImage.save();
                }

                comments.push(comment);
                await comment.save();
            }

            console.log('Generated mock comments.');

            // Generate user follow relationships
            for (let i = 0; i < 20; i++) {
                const follow = new models.User_follows_user({
                    follower: users[faker.number.int({ min: 0, max: users.length - 1 })]._id,
                    follows: users[faker.number.int({ min: 0, max: users.length - 1 })]._id
                });

                await follow.save();
            }

            console.log('Generated mock follow relations.');

            console.log('Mock data successfully created.');
        } catch (error) {
            console.error('Error creating mock data: ', error);
        } finally {
            process.exit(0);
        }
    });

function generateHash() {
    let result = '';
    const characters = 'abcdef0123456789';

    let counter = 64;
    while (counter > 0) {
        result += characters.charAt(
            faker.number.int({ min: 0, max: characters.length - 1 })
        );

        counter -= 1;
    }

    return result;
}