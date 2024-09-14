module.exports = function(app, model) {
    app.get("/api/v1/posts/", function (req, res) {
        res.json({ 'message': 'Posts' })
    });

    console.log("ROUTE: Posts routes registered.")
};