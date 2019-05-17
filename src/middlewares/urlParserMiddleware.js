

module.exports = function(req, res, next) {
    req.query.url = req.url.slice(1);
    if (req.query.url === "_health") {
        return
    }
    next()
};
