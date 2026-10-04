import express from 'express';
import {
    getAllJobs, getJobDetails, createJob, updateJob, deleteJob,
    getApplicants, applyForJob
} from '../controllers/jobController.js';
import { requireAuth, requireRecruiter } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';
import { validateJob, validateApplication } from '../middleware/validationMiddleware.js';
import Job from '../models/JobModel.js';

const router = express.Router();

// Static recruiter routes MUST come before parameterized /:id routes
router.get('/create', requireRecruiter, (req, res) => {
    res.render('jobs/createJob', {
        errors: null,
        formData: null,
        user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
});

router.post('/create', requireRecruiter, validateJob, createJob);

router.get('/', getAllJobs);
router.get('/:id', getJobDetails);

router.get('/:id/update', requireRecruiter, async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job || job.recruiterId !== req.session.userId) {
        return res.status(403).render('main/404', { error: 'Unauthorized' });
    }
    res.render('jobs/updateJob', {
        job: job,
        errors: null,
        user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
});

router.post('/:id/update', requireRecruiter, validateJob, updateJob);

router.post('/:id/delete', requireRecruiter, deleteJob);

router.get('/:id/applicants', requireRecruiter, getApplicants);

// Application route
router.get('/:id/apply', async (req, res) => {
    const job = await Job.findById(req.params.id);
    if (!job) {
        return res.status(404).render('main/404', { error: 'Job not found' });
    }
    res.render('apply/applyJob', {
        errors: null,
        formData: null,
        jobId: req.params.id,
        job: job,
        user: req.session.userId ? { id: req.session.userId, name: req.session.userName } : null
    });
});

router.post('/:id/apply', uploadResume.single('resume'), validateApplication, applyForJob);

export default router;

