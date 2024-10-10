# Backend and Frontend Template

Latest version: https://git.chalmers.se/courses/dit342/group-00-web

This template refers to itself as `group-00-web`. In your project, use your group number in place of `00`.

## Project Structure

| File        | Purpose           | What you do?  |
| ------------- | ------------- | ----- |
| `server/` | Backend server code | All your server code |
| [server/README.md](server/README.md) | Everything about the server | **READ ME** carefully! |
| `client/` | Frontend client code | All your client code |
| [client/README.md](client/README.md) | Everything about the client | **READ ME** carefully! |
| [docs/LOCAL_DEPLOYMENT.md](docs/LOCAL_DEPLOYMENT.md) | Local production deployment | Deploy your app local in production mode |

## Requirements

The version numbers in brackets indicate the tested versions but feel free to use more recent versions.
You can also use alternative tools if you know how to configure them (e.g., Firefox instead of Chrome).

* [Git](https://git-scm.com/) (v2) => [installation instructions](https://www.atlassian.com/git/tutorials/install-git)
  * [Add your Git username and set your email](https://docs.gitlab.com/ce/gitlab-basics/start-using-git.html#add-your-git-username-and-set-your-email)
    * `git config --global user.name "YOUR_USERNAME"` => check `git config --global user.name`
    * `git config --global user.email "email@example.com"` => check `git config --global user.email`
  * > **Windows users**: We recommend to use the [Git Bash](https://www.atlassian.com/git/tutorials/git-bash) shell from your Git installation or the Bash shell from the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to run all shell commands for this project.
* [Chalmers GitLab](https://git.chalmers.se/) => Login with your **Chalmers CID** choosing "Sign in with" **Chalmers Login**. (contact [support@chalmers.se](mailto:support@chalmers.se) if you don't have one)
  * DIT342 course group: https://git.chalmers.se/courses/dit342
  * [Setup SSH key with Gitlab](https://docs.gitlab.com/ee/ssh/)
    * Create an SSH key pair `ssh-keygen -t ed25519 -C "email@example.com"` (skip if you already have one)
    * Add your public SSH key to your Gitlab profile under https://git.chalmers.se/profile/keys
    * Make sure the email you use to commit is registered under https://git.chalmers.se/profile/emails
  * Checkout the [Backend-Frontend](https://git.chalmers.se/courses/dit342/group-00-web) template `git clone git@git.chalmers.se:courses/dit342/group-00-web.git`
* [Server Requirements](./server/README.md#Requirements)
* [Client Requirements](./client/README.md#Requirements)

## Getting started

```bash
# Clone repository
git clone git@git.chalmers.se:courses/dit342/group-00-web.git

# Change into the directory
cd group-00-web

# Setup backend
cd server && npm install
npm run dev

# Setup frontend
cd client && npm install
npm run serve
```

> Check out the detailed instructions for [backend](./server/README.md) and [frontend](./client/README.md).

## Visual Studio Code (VSCode)

Open the `server` and `client` in separate VSCode workspaces or open the combined [backend-frontend.code-workspace](./backend-frontend.code-workspace). Otherwise, workspace-specific settings don't work properly.

## System Definition (MS0)

### Purpose

𝕐 is a social media platform where users share short posts, containing text and optionally images. It can be used for sharing thoughts and media (images). People follow each other to see posts in their feed, and can like, repost, or reply to posts to engage in discussions.

### Pages

* **Feed:** The feed will be the start page of our application. It allows the user to view posts from accounts they follow. Every post can be liked, commented, or reposted, as well as opened to view all comments (see *Post* page). 

* **Post:** When an individual post is opened, the post’s content is shown at the top of the page, followed by the comment thread. Each comment can be replied to and liked. If a comment has replies, ‘view replies’ button appears under the comment. If the user is viewing their own post, they can edit and delete the post.

* **Profile:** On this page a user can view any profile on the platform, whether it's someone else’s or their own. At the top of the page the user’s information (such as name, profile picture, about section, etc.) is displayed. If the user is viewing their own profile, they can edit their information. Below the info section, the user’s posts, as well as re-posts, are put into a feed in chronological order (newest first). The profile feed has the same functionality as the home feed (liking, commenting, reposting). The user can also follow another user on this page.

* **Login/Registration:** A page for login and registration of the user. Users will be able to login using their username and password. To register a new user will need to fill out their username, password, name and birthday.

**NOTE:** On every page there will be a *persistent search bar* that allows user to search for other users.


### Entity-Relationship (ER) Diagram

![ER Diagram](./images/er_diagram.png)

## Backend (MS1)
### Endpoints
#### Feed
- GET /api/v1/feeds/

#### Password restoration
- POST /api/v1/restorePassword

#### Login
- POST /api/v1/login

#### Images
- GET /api/v1/images
- GET /api/v1/images/:hash
- DELETE /api/v1/images/:hash
- DELETE /api/v1/images

#### Users
- GET /api/v1/users/search
- GET /api/v1/users
- GET /api/v1/users/:id
- GET /api/v1/users/:id/followers
- GET /api/v1/users/:id/followings
- GET /api/v1/users/:id/posts
- GET /api/v1/users/:id/comments
- POST /api/v1/users
- POST /api/v1/users/:id/images
- POST /api/v1/users/followings/:following_id
- PATCH /api/v1/users/:id
- DELETE /api/v1/users
- DELETE /api/v1/users/:id
- DELETE /api/v1/users/:id/images
- DELETE /api/v1/users/followings/:following_id

#### Posts
- GET /api/v1/posts/:id
- GET /api/v1/posts/:post_id/likes/:user_id
- POST /api/v1/posts/
- POST /api/v1/posts/:post_id/likes/
- PUT /api/v1/posts/:id
- PATCH /api/v1/posts/:id
- DELETE /api/v1/posts/:id
- DELETE /api/v1/posts/:post_id/likes/:user_id

#### Comments
- GET /api/v1/comments/:id
- GET /api/v1/comments/:comment_id/likes/
- POST /api/v1/comments
- POST /api/v1/comments/:comment_id/likes
- PATCH /api/v1/comments/:id
- PUT /api/v1/comments/:id
- DELETE /api/v1/comments/:id
- DELETE /api/v1/comments/:comment_id/likes/:user_id

## Advanced Feature Proposal
  Our advanced feature is feed generation. Each user will have a personalized feed generated for them when they enter the ‘Feed’ page of the site. The feed is generated based on the user's followings. On the backend, the feature will be implemented in a special endpoint (‘api/v1/feeds’) that returns the generated feed, sorted chronologically. The user can also select newest-first or oldest-first sorting.

  On the frontend, the feed will be the central part of the website. To support best UX practices, the feed will be infinitely scrollable, without the need for the user to switch pages manually. This also has an added benefit of efficiency, as the client requests for only a part of the feed, not the whole. This functionality will be achieved by adding pagination to the feeds endpoint and using it on the frontend to dynamically load the pages.

## Teaser (MS3)

![Teaser](./images/teaser.png)
