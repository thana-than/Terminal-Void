import { Sequence } from "/src/js/sequenceProgram";

const TestSequence = () => new Sequence([
    "This is a test sequence.",
    "It will print each line in order.",
    "You can add as many lines as you want.",
    "This is the last line of the sequence."
], true);

export default TestSequence;