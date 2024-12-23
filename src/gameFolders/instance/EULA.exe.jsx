import React from "react";
import { Quiz, QuizPrompt } from "/src/js/quizProgram";
import Data from '/src/js/gameData'

export const YES = {
    keys: ['YES', 'y', 'accept'],
    invoke: function (params, context) {
        return "GOOD!"
    }
};

export const NO = {
    keys: ['NO', 'n', 'deny'],
    invoke: function (params, context) {
        return "BAD!"
    }
};

const EULA = new Quiz([
    new QuizPrompt("TESTING", [
        { keys: ['YES', 'y'], isCorrect: true, response: "GOOD!" },
        { keys: ['NO', 'n'], isCorrect: false, response: "BAD!" },
    ]),
    new QuizPrompt("TESTING 2", [
        { keys: ['YES', 'y'], isCorrect: true, response: "GOOD!", invoke: function () { Data.accessKeys.add('CLIENT') } }, //? invoke is temporary to showcase that we can do it for specific answers
        { keys: ['NO', 'n'], isCorrect: false, response: "BAD!" },
    ]),
]);

export default EULA