import Job from '../models/JobModel.js';

export const validateJob = async (req, res, next) => {
    const { jobDesignation, companyName, jobLocation, salary, applyBy, skillsRequired, numberOfOpenings } = req.body;

    const errors = [];

    if (!jobDesignation || jobDesignation.length < 3) {
        errors.push('Job designation is required and must be at least 3 characters long');
    }

    if (!companyName || companyName.length < 2) {
        errors.push('Company name is required and must be at least 2 characters long');
    }

    if (!jobLocation || jobLocation.length < 3) {
        errors.push('Job location is required and must be at least 3 characters long');
    }

    if (!salary || isNaN(parseFloat(salary))) {
        errors.push('Valid salary is required');
    }

    if (!applyBy || isNaN(Date.parse(applyBy))) {
        errors.push('Valid application deadline is required');
    }

    if (!skillsRequired || skillsRequired.split(',').length === 0) {
        errors.push('At least one skill is required');
    }

    if (!numberOfOpenings || isNaN(parseInt(numberOfOpenings)) || parseInt(numberOfOpenings) <= 0) {
        errors.push('Valid number of openings is required');
    }

    if (errors.length > 0) {
        if (req.params.id) {
            const existingJob = await Job.findById(req.params.id);
            const skillsArr = typeof skillsRequired === 'string' ? skillsRequired.split(',').map(s => s.trim()) : [];
            return res.status(400).render('jobs/updateJob', {
                errors: errors,
                job: { ...existingJob, ...req.body, skillsRequired: skillsArr, id: req.params.id },
                user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
            });
        }
        return res.status(400).render('jobs/createJob', {
            errors: errors,
            formData: req.body,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
        });
    }

    next();
};

export const validateApplication = async (req, res, next) => {
    const { name, email, contact } = req.body;

    const errors = [];

    if (!name || name.length < 2) {
        errors.push('Name is required and must be at least 2 characters long');
    }

    if (!email || !email.includes('@')) {
        errors.push('Valid email is required');
    }

    if (!contact || contact.length < 10) {
        errors.push('Valid contact number is required');
    }

    if (!req.file) {
        errors.push('Resume file is required');
    }

    if (errors.length > 0) {
        const job = await Job.findById(req.params.id);
        return res.status(400).render('apply/applyJob', {
            errors: errors,
            formData: req.body,
            jobId: req.params.id,
            job: job,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
        });
    }

    next();
};
