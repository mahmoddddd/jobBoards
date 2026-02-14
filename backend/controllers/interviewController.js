const Interview = require('../models/Interview');
const Application = require('../models/Application');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const { sendEmail, getInterviewInvitationEmail } = require('../config/email');

// @desc    Schedule a new interview
// @route   POST /api/interviews
// @access  Private (Company)
exports.scheduleInterview = async (req, res) => {
    try {
        const { applicationId, interviewDate, duration, type, location, meetingLink, notes } = req.body;

        // Verify Application Exists
        const application = await Application.findById(applicationId).populate('applicantId').populate('jobId');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        // Verify Company Access
        const company = await Company.findOne({ owner: req.user.id });
        if (!company || application.jobId.companyId.toString() !== company._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Create Interview
        const interview = await Interview.create({
            jobId: application.jobId._id,
            companyId: company._id,
            applicantId: application.applicantId._id,
            applicationId: application._id,
            date: interviewDate,
            duration,
            type,
            location,
            meetingLink,
            status: 'SCHEDULED',
            notes
        });

        // Update Application Status
        if (application.status !== 'INTERVIEW') {
            application.status = 'INTERVIEW';
            await application.save();
        }

        // Send Email Notification
        try {
            const dateStr = new Date(interviewDate).toLocaleDateString('ar-EG');
            const timeStr = new Date(interviewDate).toLocaleTimeString('ar-EG');

            await sendEmail({
                to: application.applicantId.email,
                subject: `دعوة لمقابلة: ${application.jobId.title}`,
                html: getInterviewInvitationEmail(
                    application.applicantId.name,
                    application.jobId.title,
                    company.name,
                    dateStr,
                    timeStr,
                    type,
                    location || meetingLink,
                    notes
                )
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the request if email fails, but log it
        }

        res.status(201).json({
            success: true,
            message: 'Interview scheduled successfully',
            interview
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get interviews (Company or Applicant)
// @route   GET /api/interviews
// @access  Private
exports.getInterviews = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'COMPANY') {
            const company = await Company.findOne({ owner: req.user.id });
            if (!company) {
                return res.status(404).json({ success: false, message: 'Company not found' });
            }
            query = { companyId: company._id };
        } else {
            query = { applicantId: req.user.id };
        }

        const interviews = await Interview.find(query)
            .populate({ path: 'applicantId', select: 'name email avatar' })
            .populate({ path: 'jobId', select: 'title' })
            .populate({ path: 'companyId', select: 'name logo' })
            .sort({ date: 1 }); // Soonest first

        res.json({
            success: true,
            interviews
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update/Cancel interview
// @route   PUT /api/interviews/:id
// @access  Private
exports.updateInterview = async (req, res) => {
    try {
        let interview = await Interview.findById(req.params.id);

        if (!interview) {
            return res.status(404).json({ success: false, message: 'Interview not found' });
        }

        // Check ownership
        if (req.user.role === 'COMPANY') {
            const company = await Company.findOne({ owner: req.user.id });
            if (!company || interview.companyId.toString() !== company._id.toString()) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }
        } else if (req.user.role === 'USER') { // Applicant requesting reschedule/cancel
             if (interview.applicantId.toString() !== req.user.id) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
             }
        }

        interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            interview
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
