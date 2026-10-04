import express from "express";
import Job from "../models/JobModel.js";

const router = express.Router();

// GET all jobs
router.get("/jobs", async (req, res) => {
  try {
    const jobs = await Job.getAll();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// GET a specific job by ID
router.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// POST to create a new job
router.post("/jobs", async (req, res) => {
  try {
    // In a real app, recruiterId would come from authentication middleware (e.g., req.user.id)
    const recruiterId = req.body.recruiterId || "default-recruiter-id";
    const newJob = await Job.create(req.body, recruiterId);
    res.status(201).json({ success: true, data: newJob });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid data", error: error.message });
  }
});

// PUT to update a job
router.put("/jobs/:id", async (req, res) => {
  try {
    const updatedJob = await Job.update(req.params.id, req.body);
    if (!updatedJob) {
      return res.status(404).json({ success: false, message: "Job not found or update failed" });
    }
    res.json({ success: true, data: updatedJob });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid data", error: error.message });
  }
});

// DELETE a job
router.delete("/jobs/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    await Job.delete(req.params.id);
    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

// GET applicants for a specific job
router.get("/jobs/:id/applicants", async (req, res) => {
  try {
    const applicants = await Job.getApplicants(req.params.id);
    res.json({ success: true, count: applicants.length, data: applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
});

export default router;
