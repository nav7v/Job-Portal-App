export const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

export const requireRecruiter = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/auth/login');
    }
    next();
};

export const redirectIfLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return res.redirect('/jobs');
    }
    next();
};
