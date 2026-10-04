export default (req, res, next) => {
    if (req.session.lastVisit) {
        res.locals.lastVisit = new Date(req.session.lastVisit).toLocaleString();
    } else {
        res.locals.lastVisit = 'First visit!';
    }

    req.session.lastVisit = new Date();
    next();
};
