export const getLandingPage = (req, res) => {
    try {
        res.render('main/landing', {
            title: 'Job Portal',
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null,
            activePage: 'home',
            lastVisit: req.session.lastVisit || new Date().toLocaleString()
        });
    } catch (error) {
        console.error('❌ Error rendering landing page:', error);
        res.status(500).send('Template rendering error: ' + error.message);
    }
};