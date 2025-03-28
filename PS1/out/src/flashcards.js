"use strict";
// This file should NOT be modified.
// It is a placeholder to ensure the project structure is complete.
// You will work with the Flashcard, AnswerDifficulty, and BucketMap types
// defined here in your implementation and tests.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnswerDifficulty = exports.Flashcard = void 0;
/**
 * Represents a flashcard with a front and back.
 * Flashcards are immutable.
 */
class Flashcard {
    // You can explore the properties of Flashcard, but do NOT modify this class.
    // Your implementation should work with the Flashcard class as given.
    front;
    back;
    hint; // weak hint - you will strengthen the spec for getHint()
    tags;
    constructor(front, back, hint, tags) {
        this.front = front;
        this.back = back;
        this.hint = hint;
        this.tags = tags;
    }
}
exports.Flashcard = Flashcard;
/**
 * Represents the user's answer difficulty for a flashcard practice trial.
 */
var AnswerDifficulty;
(function (AnswerDifficulty) {
    AnswerDifficulty[AnswerDifficulty["Wrong"] = 0] = "Wrong";
    AnswerDifficulty[AnswerDifficulty["Hard"] = 1] = "Hard";
    AnswerDifficulty[AnswerDifficulty["Easy"] = 2] = "Easy";
})(AnswerDifficulty || (exports.AnswerDifficulty = AnswerDifficulty = {}));
