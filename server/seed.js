const mongoose = require('mongoose');
const University = require('./models/university');
require('dotenv').config();

const universities = [
    {
        name: 'Massachusetts Institute of Technology (MIT)',
        country: 'USA',
        city: 'Cambridge',
        ranking: { global: 1, national: 1 },
        description: 'A world-class institution known for its engineering and physical sciences.',
        academics: {
            majorsOffered: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Biology'],
            coursesHighlight: [{ name: 'Intro to Algorithms', description: 'Core CS course', duration: '1 Semester' }],
            facultyStrength: 1000,
            studentTeacherRatio: '3:1'
        },
        admissions: {
            acceptanceRate: 0.04,
            requirements: {
                minGPA: 3.8,
                testScores: { sat: { min: 1500, max: 1600 }, toefl: { min: 100 } }
            }
        },
        financials: {
            tuitionFee: { international: { min: 55000, max: 60000 } },
            financialAidAvailable: true
        },
        campusLife: {
            campusType: 'Urban',
            facilities: ['Gym', 'Labs', 'Libraries'],
            clubs: ['Robotics', 'Debate']
        },
        outcomes: { employmentRate: 0.95, averageSalary: 120000 }
    },
    {
        name: 'University of Oxford',
        country: 'UK',
        city: 'Oxford',
        ranking: { global: 2, national: 1 },
        description: 'The oldest university in the English-speaking world.',
        academics: {
            majorsOffered: ['History', 'Philosophy', 'Law', 'Medicine', 'Computer Science'],
            coursesHighlight: [{ name: 'PPE', description: 'Philosophy, Politics and Economics', duration: '3 Years' }],
            facultyStrength: 1500,
            studentTeacherRatio: '5:1'
        },
        admissions: {
            acceptanceRate: 0.17,
            requirements: {
                minGPA: 3.7,
                testScores: { ielts: { min: 7.5 } }
            }
        },
        financials: {
            tuitionFee: { international: { min: 35000, max: 45000 } },
            financialAidAvailable: true
        },
        campusLife: {
            campusType: 'Urban',
            facilities: ['Libraries', 'Historical Buildings'],
            clubs: ['Union', 'Rowing']
        },
        outcomes: { employmentRate: 0.92, averageSalary: 90000 }
    },
    {
        name: 'Stanford University',
        country: 'USA',
        city: 'Stanford',
        ranking: { global: 3, national: 2 },
        description: 'Known for its entrepreneurial spirit and proximity to Silicon Valley.',
        academics: {
            majorsOffered: ['Computer Science', 'Business', 'Economics', 'Psychology', 'Engineering'],
            coursesHighlight: [{ name: 'Machine Learning', description: 'Renowned ML course', duration: '10 Weeks' }],
            facultyStrength: 1100,
            studentTeacherRatio: '4:1'
        },
        admissions: {
            acceptanceRate: 0.05,
            requirements: {
                minGPA: 3.8,
                testScores: { sat: { min: 1450, max: 1600 }, toefl: { min: 100 } }
            }
        },
        financials: {
            tuitionFee: { international: { min: 56000, max: 62000 } },
            financialAidAvailable: true
        },
        campusLife: {
            campusType: 'Suburban',
            facilities: ['Sports Complex', 'Innovation Hub'],
            clubs: ['Startup Incubator', 'Tennis']
        },
        outcomes: { employmentRate: 0.94, averageSalary: 115000 }
    },
    {
        name: 'University of Toronto',
        country: 'Canada',
        city: 'Toronto',
        ranking: { global: 18, national: 1 },
        description: 'A top Canadian university with a diverse student body.',
        academics: {
            majorsOffered: ['Biology', 'Computer Science', 'Commerce', 'Engineering'],
            facultyStrength: 2000,
            studentTeacherRatio: '15:1'
        },
        admissions: {
            acceptanceRate: 0.43,
            requirements: {
                minGPA: 3.5,
                testScores: { ielts: { min: 6.5 }, toefl: { min: 90 } }
            }
        },
        financials: {
            tuitionFee: { international: { min: 45000, max: 60000, currency: 'CAD' } },
            financialAidAvailable: true
        },
        campusLife: {
            campusType: 'Urban',
            facilities: ['Robarts Library', 'Hart House'],
            clubs: ['Hart House Debating', 'Varsity Blues']
        },
        outcomes: { employmentRate: 0.88, averageSalary: 70000 }
    },
    {
        name: 'National University of Singapore (NUS)',
        country: 'Singapore',
        city: 'Singapore',
        ranking: { global: 11, national: 1 },
        description: 'A leading global university centered in Asia.',
        academics: {
            majorsOffered: ['Computer Science', 'Business', 'Engineering', 'Science'],
            facultyStrength: 1200,
            studentTeacherRatio: '10:1'
        },
        admissions: {
            acceptanceRate: 0.15,
            requirements: {
                minGPA: 3.6,
                testScores: { ielts: { min: 6.5 }, sat: { min: 1300, max: 1600 } }
            }
        },
        financials: {
            tuitionFee: { international: { min: 30000, max: 40000, currency: 'SGD' } },
            financialAidAvailable: true
        },
        campusLife: {
            campusType: 'Urban',
            facilities: ['University Town', 'Sports Halls'],
            clubs: ['Dance', 'Choir']
        },
        outcomes: { employmentRate: 0.93, averageSalary: 65000 }
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        await University.deleteMany({});
        console.log('Cleared Universities');

        await University.insertMany(universities);
        console.log('Seeded Universities');

        mongoose.connection.close();
        console.log('Connection closed');
    } catch (err) {
        console.error(err);
    }
};

seedDB();
