const SkillTest = require('../models/SkillTest');
const FreelancerProfile = require('../models/FreelancerProfile');

// @desc    Get all available skill tests
// @route   GET /api/skill-tests
// @access  Private (Freelancer)
exports.getSkillTests = async (req, res) => {
    try {
        const tests = await SkillTest.find({}).select('-questions');
        res.json({
            success: true,
            tests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching skill tests'
        });
    }
};

// @desc    Get single skill test (with questions but without answers)
// @route   GET /api/skill-tests/:id
// @access  Private (Freelancer)
exports.getSkillTest = async (req, res) => {
    try {
        const test = await SkillTest.findById(req.params.id).select('questions.question questions.options title description durationMinutes skillName');
        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }
        res.json({
            success: true,
            test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching test'
        });
    }
};

// @desc    Submit skill test
// @route   POST /api/skill-tests/:id/submit
// @access  Private (Freelancer)
exports.submitSkillTest = async (req, res) => {
    try {
        const { answers } = req.body; // Array of selected option indices
        const test = await SkillTest.findById(req.params.id).select('+questions.correctAnswer');

        if (!test) {
            return res.status(404).json({
                success: false,
                message: 'Test not found'
            });
        }

        if (answers.length !== test.questions.length) {
            return res.status(400).json({
                success: false,
                message: 'Please answer all questions'
            });
        }

        let score = 0;
        test.questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswer) {
                score++;
            }
        });

        const percentage = (score / test.questions.length) * 100;
        const passed = percentage >= test.passingScore;

        if (passed) {
            // Update Freelancer Profile
            const profile = await FreelancerProfile.findOne({ userId: req.user.id });
            if (profile) {
                if (!profile.verifiedSkills.includes(test.skillName)) {
                    profile.verifiedSkills.push(test.skillName);
                    await profile.save();
                }
            }
        }

        res.json({
            success: true,
            passed,
            score: percentage.toFixed(2),
            message: passed ? 'Congratulations! You passed the test.' : 'Unfortunately, you did not pass.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error submitting test'
        });
    }
};

// @desc    Create a new skill test (Admin only)
// @route   POST /api/skill-tests
exports.createSkillTest = async (req, res) => {
    try {
        const test = await SkillTest.create(req.body);
        res.status(201).json({
            success: true,
            test
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
