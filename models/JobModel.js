import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const applicantSchema = new mongoose.Schema({
    applicantId: {
        type: String,
        default: uuidv4
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    resumePath: {
        type: String
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
});

const jobSchema = new mongoose.Schema({
    recruiterId: {
        type: String,
        required: true
    },
    jobDesignation: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    jobLocation: {
        type: String,
        required: true,
        trim: true
    },
    salary: {
        type: String,
        required: true
    },
    applyBy: {
        type: Date,
        required: true
    },
    skillsRequired: [{
        type: String,
        trim: true
    }],
    numberOfOpenings: {
        type: Number,
        required: true
    },
    jobCategory: {
        type: String,
        required: true
    },
    jobPosted: {
        type: Date,
        default: Date.now
    },
    applicants: [applicantSchema]
}, {
    timestamps: true
});

// Safe findById handling invalid ObjectId strings
jobSchema.statics.findById = function(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return Promise.resolve(null);
    }
    return mongoose.Model.findById.call(this, id);
};

// Static method to get all jobs
jobSchema.statics.getAll = function() {
    return this.find({}).sort({ createdAt: -1 });
};

// Static method to find jobs by recruiter
jobSchema.statics.findByRecruiter = function(recruiterId) {
    return this.find({ recruiterId: recruiterId }).sort({ createdAt: -1 });
};

// Static method to create a job
jobSchema.statics.create = async function(jobData, recruiterId) {
    if (Array.isArray(jobData)) {
        const jobsToCreate = jobData.map(item => {
            const skills = typeof item.skillsRequired === 'string'
                ? item.skillsRequired.split(',').map(s => s.trim())
                : (Array.isArray(item.skillsRequired) ? item.skillsRequired : []);
            return {
                recruiterId: item.recruiterId || recruiterId || 'default-recruiter-id',
                jobDesignation: item.jobDesignation,
                companyName: item.companyName,
                jobLocation: item.jobLocation,
                salary: item.salary,
                applyBy: new Date(item.applyBy),
                skillsRequired: skills,
                numberOfOpenings: parseInt(item.numberOfOpenings),
                jobCategory: item.jobCategory,
                applicants: item.applicants || []
            };
        });
        return await mongoose.Model.create.call(this, jobsToCreate);
    }

    const skills = typeof jobData.skillsRequired === 'string'
        ? jobData.skillsRequired.split(',').map(s => s.trim())
        : (Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired : []);

    const newJob = new this({
        recruiterId: recruiterId || jobData.recruiterId || 'default-recruiter-id',
        jobDesignation: jobData.jobDesignation,
        companyName: jobData.companyName,
        jobLocation: jobData.jobLocation,
        salary: jobData.salary,
        applyBy: new Date(jobData.applyBy),
        skillsRequired: skills,
        numberOfOpenings: parseInt(jobData.numberOfOpenings),
        jobCategory: jobData.jobCategory,
        applicants: []
    });

    return await newJob.save();
};

// Static method to update a job
jobSchema.statics.update = async function(id, jobData) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;

    const skills = typeof jobData.skillsRequired === 'string'
        ? jobData.skillsRequired.split(',').map(s => s.trim())
        : (Array.isArray(jobData.skillsRequired) ? jobData.skillsRequired : []);

    return await this.findByIdAndUpdate(
        id,
        {
            jobDesignation: jobData.jobDesignation,
            companyName: jobData.companyName,
            jobLocation: jobLocationInPayload(jobData),
            salary: jobData.salary,
            applyBy: new Date(jobData.applyBy),
            skillsRequired: skills,
            numberOfOpenings: parseInt(jobData.numberOfOpenings),
            jobCategory: jobData.jobCategory
        },
        { new: true, runValidators: true }
    );
};

function jobLocationInPayload(data) {
    return data.jobLocation || data.location || '';
}

// Static method to delete a job
jobSchema.statics.delete = async function(id) {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return null;
    return await this.findByIdAndDelete(id);
};

// Static method to add an applicant
jobSchema.statics.addApplicant = async function(jobId, applicantData, resumePath) {
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) return null;
    const job = await this.findById(jobId);
    if (!job) return null;

    const newApplicant = {
        applicantId: uuidv4(),
        name: applicantData.name,
        email: applicantData.email,
        contact: applicantData.contact,
        resumePath: resumePath,
        appliedAt: new Date()
    };

    job.applicants.push(newApplicant);
    await job.save();
    return newApplicant;
};

// Static method to get applicants for a job
jobSchema.statics.getApplicants = async function(jobId) {
    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) return [];
    const job = await this.findById(jobId);
    return job ? job.applicants : [];
};

// Static method to search jobs
jobSchema.statics.searchJobs = async function(query) {
    const regex = new RegExp(query, 'i');
    return await this.find({
        $or: [
            { jobDesignation: regex },
            { companyName: regex },
            { jobLocation: regex },
            { skillsRequired: regex }
        ]
    }).sort({ createdAt: -1 });
};

// Static method to get paginated jobs
jobSchema.statics.getPaginatedJobs = async function(page = 1, limit = 10) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const totalJobs = await this.countDocuments();
    const paginatedJobs = await this.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

    const totalPages = Math.ceil(totalJobs / limitNum) || 1;

    return {
        jobs: paginatedJobs,
        currentPage: pageNum,
        totalPages: totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
    };
};

const Job = mongoose.model('Job', jobSchema);

// Auto-seed initial jobs if database is empty
export const seedInitialJobs = async () => {
    try {
        const count = await Job.countDocuments();
        if (count === 0) {
            await Job.create([
                {
                    recruiterId: "recruiter-1",
                    jobDesignation: "Senior Full Stack Developer",
                    companyName: "TechCorp Solutions",
                    jobLocation: "San Francisco, CA (Remote)",
                    salary: "120,000 - 150,000",
                    applyBy: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    skillsRequired: ["Node.js", "Express", "React", "MongoDB", "REST API"],
                    numberOfOpenings: 3,
                    jobCategory: "Full-time"
                },
                {
                    recruiterId: "recruiter-1",
                    jobDesignation: "Frontend UI/UX Engineer",
                    companyName: "Designify Studio",
                    jobLocation: "New York, NY",
                    salary: "90,000 - 110,000",
                    applyBy: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    skillsRequired: ["HTML5", "CSS3", "JavaScript", "React", "Figma"],
                    numberOfOpenings: 2,
                    jobCategory: "Full-time"
                },
                {
                    recruiterId: "recruiter-2",
                    jobDesignation: "Backend Node.js Engineer",
                    companyName: "CloudScale Systems",
                    jobLocation: "Austin, TX (Hybrid)",
                    salary: "105,000 - 130,000",
                    applyBy: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                    skillsRequired: ["Node.js", "Express", "PostgreSQL", "Docker", "AWS"],
                    numberOfOpenings: 4,
                    jobCategory: "Remote"
                }
            ]);
            console.log("🌱 Initial jobs seeded into MongoDB successfully.");
        }
    } catch (err) {
        console.error("Failed to seed initial jobs:", err.message);
    }
};

export default Job;
