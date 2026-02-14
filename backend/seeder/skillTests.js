const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SkillTest = require('../models/SkillTest');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const tests = [
    {
        skillName: 'React',
        title: 'React Fundamentals',
        description: 'Test your knowledge of React core concepts, hooks, and component lifecycle.',
        durationMinutes: 15,
        questions: [
            {
                question: 'What is the virtual DOM?',
                options: [
                    'A direct copy of the real DOM',
                    'A lightweight JavaScript representation of the DOM',
                    'A browser plugin',
                    'A database for React',
                ],
                correctAnswer: 1
            },
            {
                question: 'Which hook is used for side effects?',
                options: [
                    'useState',
                    'useReducer',
                    'useEffect',
                    'useContext',
                ],
                correctAnswer: 2
            },
            {
                question: 'How do you pass data to child components?',
                options: [
                    'State',
                    'Props',
                    'Context',
                    'Redux',
                ],
                correctAnswer: 1
            }
        ]
    },
    {
        skillName: 'JavaScript',
        title: 'JavaScript Advanced',
        description: 'Prove your mastery of closures, prototypes, async/await, and ES6+ features.',
        durationMinutes: 20,
        questions: [
            {
                question: 'What is a closure?',
                options: [
                    'A function bundled with its lexical environment',
                    'A way to close a browser window',
                    'A method to stop loop execution',
                    'A CSS property',
                ],
                correctAnswer: 0
            },
            {
                question: 'What does "this" refer to in an arrow function?',
                options: [
                    'The object that called the function',
                    'The global object',
                    'The enclosing lexical scope',
                    'Undefined',
                ],
                correctAnswer: 2
            }
        ]
    }
];

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job-board', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('Connected to DB');
    await SkillTest.deleteMany();
    await SkillTest.insertMany(tests);
    console.log('Skill Tests Seeded');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
