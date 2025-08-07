import React from "react";
import { Quiz, Prompt } from "/src/js/quizProgram";

//* NOTES //*
//* This is a simple quiz program that allows you to create a quiz with branching prompts. Pretty much just a state machine.
//* It's a good idea to have the next value return as a function, so that the next prompt can be defined after the current one is defined.
//* An answer object gets parsed into a command. You must pass it keys.
//* You can also pass it:
//* response: A string that will be printed when the command is invoked.
//* next: A prompt that will be set as the current prompt when the command is invoked. If this is null then the quiz will end.
//* invoke: A function that will be invoked when the command is invoked. This can be used to do things outside of the regular prompt code.

//* Answers can be predefined, or can be defined in the prompt itself.
const answer_return = {
    keys: ['back', 'return', 'garden'],
    next: () => ENTRY_PROMPT,
    response: "You have decided to return to the garden" //* An extra response that will be printed when the command is invoked, before the next prompt is printed.
}

const ENTRY_PROMPT = new Prompt("You are in a garden. To your left: a forest. To your right: a mountain.", [
    { keys: ['left', 'forest'], next: () => FOREST_PROMPT },
    { keys: ['right', 'mountain'], next: () => MOUNTAIN_PROMPT, invoke: () => console.log("An example of how the invoke can be used. This just writes to the log.") },
]);

const FOREST_PROMPT = new Prompt("You are in the forest.", [
    answer_return,
]);

const MOUNTAIN_PROMPT = new Prompt("You are at the mountain.", [
    answer_return
]);

//* Instanced programs, such as quizzes, should be created in a function so that they can be re-instanced every time they are run.
const TestQuiz = () => new Quiz(ENTRY_PROMPT);

export default TestQuiz