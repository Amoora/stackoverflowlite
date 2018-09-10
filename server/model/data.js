import config from '../config';
const usersData = [
    {
        id: 1,
        email: 'john@gmail.com',
        username: 'john',
        password: '$2a$10$P0eQhhveNsOy1vFkKHG6c.PM/RPw4.oV2N6283u7uTppzPfDNZ3JC',
        tokens: []
    },
    {
        id: 2,
        email: "johnpeter@gmail.com",
        username: "peter1",
        password: '$2a$10$/BqPqRhpN17Jsr5wtRO6le78Ot4LH6X3U3shx5FXckhAFuPNjHE1O',
        tokens: []
    }
];

const questionsData = [
        {
            questionId: 1,
            title: 'What is OOP',
            description: 'what are the principles of OOP',
            userId: 1,
            avatarURL: `${config.origin}/default.png`,
            
        },
        {
            questionId: 2,
            title: 'How do I loop within an array in Javascript',
            description: 'I have a problem looping the elements of an array and I was wordering if someon can help me with it.',
            userId: 2,
            avatarURL: `${config.origin}/default.png`,
        }
    ];

const answers = [
    {
        answerId: 1,
        questionId: 1,
        userId: 1,
        answer: 'Object oriented programming is the principle of treating computer objects like real life objects',
        accepted: false,
    },
    {
        answerId: 2,
        questionId: 2,
        userId: 2,
        answer: 'Arrays in javascript can use the forEach method to loop through its elemennts',
        accepted: true
    }

];

const votes = [
    {
        userId: [1,2],
        answerId: 1,
        upvotes: 5,
        downvotes: 2,
    },
    {
        userId: [1,2],
        answerId: 2,
        upvotes: 3,
        downvotes: 0,
    }
];

const comments = [
    {
        userId: 1,
        answerId: 1,
        commentId: 1,
        comment: 'this is a random comment'
    
    },
    {
        userId: 2,
        answerId: 2,
        commentId: 2,
        comment: 'this is a random comment'
    
    }

];

module.exports = {
    comments,
    answers,
    questionsData,
    usersData
}