import User from '../models/UserModel.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (password !== confirmPassword) {
            return res.status(400).render('auth/register', {
                error: 'Passwords do not match',
                user: null
            });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).render('auth/register', {
                error: 'User already exists with this email',
                user: null
            });
        }

        const user = await User.create({ name, email, password });
        req.session.userId = user.id;
        req.session.userName = user.name;

        res.redirect('/jobs');
    } catch (error) {
        res.status(500).render('auth/register', {
            error: 'Internal server error',
            user: null
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);

        if (!user || !(await User.validatePassword(password, user.password))) {
            return res.status(400).render('auth/login', {
                error: 'Invalid email or password',
                user: null
            });
        }

        req.session.userId = user.id;
        req.session.userName = user.name;

        res.redirect('/jobs');
    } catch (error) {
        res.status(500).render('auth/login', {
            error: 'Internal server error',
            user: null
        });
    }
};

export const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};
