import Job from '../models/JobModel.js';
import { sendApplicationEmail } from '../config/emailConfig.js';

export const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const search = req.query.search;

        if (search) {
            const jobsData = await Job.searchJobs(search);
            res.render('jobs/allJobs', {
                jobs: jobsData,
                currentPage: 1,
                totalPages: 1,
                hasPrev: false,
                hasNext: false,
                search: search,
                user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null,
                lastVisit: req.session.lastVisit
            });
        } else {
            const jobsData = await Job.getPaginatedJobs(page, limit);
            res.render('jobs/allJobs', {
                jobs: jobsData.jobs,
                currentPage: jobsData.currentPage,
                totalPages: jobsData.totalPages,
                hasPrev: jobsData.hasPrev,
                hasNext: jobsData.hasNext,
                search: null,
                user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null,
                lastVisit: req.session.lastVisit
            });
        }
    } catch (error) {
        res.status(500).render('main/404', { error: error.message });
    }
};

export const getJobDetails = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).render('main/404');
        }

        res.render('jobs/jobDetails', {
            job: job,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null,
            lastVisit: req.session.lastVisit
        });
    } catch (error) {
        res.status(500).render('main/404', { error: error.message });
    }
};

export const createJob = async (req, res) => {
    try {
        const job = await Job.create(req.body, req.session.userId);
        res.redirect('/jobs');
    } catch (error) {
        res.status(500).render('jobs/createJob', {
            errors: ['Failed to create job'],
            formData: req.body,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.recruiterId !== req.session.userId) {
            return res.status(403).render('main/404', { error: 'Unauthorized' });
        }

        await Job.update(req.params.id, req.body);
        res.redirect('/jobs');
    } catch (error) {
        res.status(500).render('jobs/updateJob', {
            errors: ['Failed to update job'],
            job: await Job.findById(req.params.id),
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.recruiterId !== req.session.userId) {
            return res.status(403).render('main/404', { error: 'Unauthorized' });
        }

        await Job.delete(req.params.id);
        res.redirect('/jobs');
    } catch (error) {
        res.status(500).redirect('/jobs');
    }
};

export const getApplicants = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.recruiterId !== req.session.userId) {
            return res.status(403).render('main/404', { error: 'Unauthorized' });
        }

        const applicants = await Job.getApplicants(req.params.id);
        res.render('jobs/applicants', {
            job: job,
            applicants: applicants,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null,
            lastVisit: req.session.lastVisit
        });
    } catch (error) {
        res.status(500).render('main/404', { error: error.message });
    }
};

export const applyForJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).render('main/404');
        }

        const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;
        const applicant = await Job.addApplicant(req.params.id, req.body, resumePath);

        // Send confirmation email
        await sendApplicationEmail(applicant.email, job.jobDesignation, job.companyName);

        res.redirect(`/jobs/${req.params.id}`);
    } catch (error) {
        const job = await Job.findById(req.params.id);
        res.status(500).render('apply/applyJob', {
            errors: [error.message || 'Failed to apply for job'],
            formData: req.body,
            jobId: req.params.id,
            job: job,
            user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
        });
    }
};
