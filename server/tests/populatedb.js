const { faker } = require('@faker-js/faker');
const database = require('../db/database');
const crypto = require('crypto');
const models = database.mongoose.models;

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whyDB';
const profilePictures = []

database.connect(mongoURI)
    .then(async () => {
        try {
            //https://i.pravatar.cc/150?img=3
            // Retrieve mock images
            const images = [];

            const response = await fetch(`https://picsum.photos/v2/list?page=${faker.number.int({ min: 1, max: 20 })}&limit=50`)
            if (response.status == 200) {
                const data = await response.json();

                for (const element of data) {
                    const image = new models.Images({
                        hash: generateHash(), // NOT REAL IMAGE HASH
                        url: element.download_url
                    });

                    //NOTE: save images to db when used
                    images.push(image);
                }

                console.log('Retrieved mock images.');
            } else {
                console.error('Could not retrieve mock images. Server replied with status ' + response.status)
            }

            // Retrieve mock profile pictures
            const profilePictures = [];

            for (let index = 1; index <= 70; index++) {
                const image = new models.Images({
                    hash: generateHash(), // NOT REAL IMAGE HASH
                    url: "https://i.pravatar.cc/300?img=" + index
                });

                //NOTE: save images to db when used
                profilePictures.push(image);
            }

            console.log('Retrieved mock profile pictures.');

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
                    const targetImage = profilePictures[faker.number.int({ min: 0, max: profilePictures.length - 1 })];
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
                    is_edited: faker.number.int({ min: 1, max: 3 }) == 1, // 1 in 3 is edited
                    is_deleted: faker.number.int({ min: 1, max: 10 }) == 1, // 1 in 10 is deleted
                    likes: users.map(user => user._id).slice(0, faker.number.int({ min: 0, max: users.length - 1 })),
                });

                post.timestamp = faker.date.recent();
                users[userIndex].last_time_posted = post.timestamp;

                await users[userIndex].save();

                if (post.is_deleted) {
                    post.content = null;
                } else if (faker.number.int({ min: 1, max: 4 }) <= 3) { // 3 of 4 posts have content
                    post.content = faker.lorem.paragraph({
                        min: 1,
                        max: 5
                    })
                }

                if (!faker.number.int({ min: 0, max: 5 }) && posts.length > 0) {
                    post.original_post_id = posts[faker.number.int({ min: 0, max: posts.length - 1 })]
                }

                while (post.content !== null && post.images?.length < 4 &&
                    (faker.datatype.boolean() || (post.content === undefined && !post.images?.length))) {
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

                while (comment.content !== null && comment.images?.length < 4 &&
                    (faker.datatype.boolean() ||
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