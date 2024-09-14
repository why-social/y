module.exports = function (app, model) {
    //GET endpoints region start
    app.get("/api/v1/posts/", function (req, res) {
        res.json({ 'message': 'GET test' })
    });
    //GET endpoints region end

    //POST endpoints region start
    app.post("/api/v1/posts/", function (req, res) {
        if (checkAuthHeader(req, res)) {
            res.json({ 'message': 'POST test' })
        }
    });
    //POST endpoints region end

    //PATCH endpoints region start
    app.patch("/api/v1/posts/:id", function (req, res) {
        if (checkAuthHeader(req, res)) {
            res.json({ 'message': 'PATCH test' })
        }
    });
    //PATCH endpoints region end

    //DELETE endpoints region start

    //DELETE endpoints region end

    function checkAuthHeader(req, res) {
        //TODO authentication header verification
        if (req.header("Auth") == undefined || false /*replace with actual header check*/) {
            res.status(401).json({ "message": "Unauthorised" });

            return false;
        }

        return true;
    }

    console.log("ROUTE: Posts routes registered.")
};