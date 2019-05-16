

module.exports = function(req, res, next) {
    console.log(req.url);
    req.query.url = req.url.slice(1);
    next()
};
