"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_1 = require("../src/utils"); // Import your utility functions
describe("Utils Test Suite", () => {
    describe("add()", () => {
        it("should add two positive numbers correctly", () => {
            assert_1.default.strictEqual((0, utils_1.add)(2, 3), 5);
        });
        it("should add a positive and a negative number correctly", () => {
            assert_1.default.strictEqual((0, utils_1.add)(5, -2), 3);
        });
        it("should add zero to a number correctly", () => {
            assert_1.default.strictEqual((0, utils_1.add)(7, 0), 7);
        });
    });
});
