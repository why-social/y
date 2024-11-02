# 𝕐
<details>
    <summary>A free social networking site where users broadcast short posts.</summary>

    Basically, a Twitter clone :P
</details>

![Teaser](./images/teaser.png)

## Description

### Features
- User accounts & customizable profiles.
- Password reset.
- Create text posts with up to 4 images.
- Delete and edit own posts.
- Post interactions - liking, commenting and reposting.
- Following.
- Follow-based feed and suggestions.
- User search.
- Recents feed.
- Modern and responsive UI.

### Purpose

𝕐 is a social media platform where users share short posts, containing text and optionally images. It can be used for sharing thoughts and media. People follow each other to see posts in their feed, and can like, repost, or reply to posts to engage in discussions.

### Pages

* **Authentication:** This includes pages for login, registering and restoring accounts. Users will be able to login using their username and password. To register a new user will need to fill out their username, password, name, e-mail and birthday. Furthermore, users can recover lost accounts by resetting their passwords using the e-mail address associated with their account.

* **Home:** Home page is the primary source of content on the platform. It provides infinetely scrolling feeds, both for activity from people you follow and general Y activity. This is also the place to go if you want to post something new.

* **Thread:** When an individual post or comment is opened, the item's content is shown at the top of the page, followed by the comment thread. Each post and comment can be replied to and liked. Threads can be unwound both ways, and depeneding on who is viewing, change layout (e.g. original poster can edit their own posts and comments)

* **Profile:** On this page a user can view any profile on the platform, whether it's someone else’s or their own. At the top of the page the user’s information (such as name, profile picture, about section, etc.) is displayed. If the user is viewing their own profile, they can edit their information. Below the info section, the user’s posts, as well as re-posts and comments are put into a feed in chronological order (newest first). The profile feed has the same functionality as the home feed (liking, commenting, reposting). The user can also follow another user on this page.

* **Discover:** This is the platform's search page. On desktop, it takes the form of a persistent side-bar; on mobile, it becomes its own tab in the navigation. Discover provides suggestions on who to follow and allows users to easily find old friends, or get in touch with anyone else on the platform.


## Technical Details
### Project Structure
| File                                 | Purpose                     |
| ------------------------------------ | --------------------------- |
| `server/`                            | Backend server code         |
| [server/README.md](server/README.md) | Everything about the server |
| `client/`                            | Frontend client code        |
| [client/README.md](client/README.md) | Everything about the client |

### Installation & Self-host
#### Setup
```bash
# Clone repository
git clone git@github.com:why-social/y.git

# Change into the directory
cd y

# Setup project
npm install

# Setup backend
npm install --prefix server

# Setup frontend
npm install --prefix client
```

#### Run in production mode
```bash
cd y
npm run prod
```
_Note: MongoDB server must be running on your machine, at port 27017._

#### Run in development mode
See [client README](./client/README.md) and [server README](./server/README.md).

#### Visual Studio Code (VSCode)

Open the `server` and `client` in separate VSCode workspaces or open the combined [backend-frontend.code-workspace](./backend-frontend.code-workspace). Otherwise, workspace-specific settings don't work properly.

### API Endpoints
<details>
    <summary>Feed</summary>

    - GET /api/v1/feeds/
</details>

<details>
    <summary>Password restoration</summary>

    - POST /api/v1/restorePassword
</details>

<details>
    <summary>Login</summary>

    - POST /api/v1/login
</details>

<details>
    <summary>Images</summary>

    - GET /api/v1/images
    - GET /api/v1/images/:hash
    - DELETE /api/v1/images/:hash
    - DELETE /api/v1/images
</details>

<details>
    <summary>Users</summary>

    - GET /api/v1/users/search
    - GET /api/v1/users
    - GET /api/v1/users/:username
    - GET /api/v1/users/:username/suggestions
    - GET /api/v1/users/:id/profile_picture
    - GET /api/v1/users/:username/followers
    - GET /api/v1/users/:username/followings
    - GET /api/v1/users/:username/posts
    - GET /api/v1/users/:username/comments
    - POST /api/v1/users
    - POST /api/v1/users/followings/:target_username
    - PUT /api/v1/users/:id/profile_picture
    - PUT /api/v1/users/:id
    - PATCH /api/v1/users/:id
    - DELETE /api/v1/users
    - DELETE /api/v1/users/:id
    - DELETE /api/v1/users/:id/profile_picture
    - DELETE /api/v1/users/followings/:following_id
</details>

<details>
    <summary>Posts</summary>

    - GET /api/v1/posts
    - GET /api/v1/posts/:id
    - GET /api/v1/posts/:post_id/likes/:user_id
    - POST /api/v1/posts/
    - POST /api/v1/posts/repost
    - POST /api/v1/posts/:post_id/likes/
    - PUT /api/v1/posts/:id
    - PATCH /api/v1/posts/:id
    - DELETE /api/v1/posts
    - DELETE /api/v1/posts/:id
    - DELETE /api/v1/posts/:post_id/likes/:user_id
</details>

<details>
    <summary>Comments</summary>

    - GET /api/v1/comments/:id
    - GET /api/v1/comments/:comment_id/likes/:user_id
    - POST /api/v1/comments
    - POST /api/v1/comments/:comment_id/likes
    - PUT /api/v1/comments/:id
    - PATCH /api/v1/comments/:id
    - DELETE /api/v1/comments/:id
    - DELETE /api/v1/comments/:comment_id/likes/:user_id
</details>
