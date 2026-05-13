// import { describe, expect, it } from "vitest";
// import {
//   initializeQueue,
//   handlePass,
//   handleCorrectGuess,
//   getCurrentCountry,
//   getRemainingPassesForCurrentCountry,
// } from "./queueSystem";

// describe("queueSystem", () => {
//   it("defers a country to the end of the queue", () => {
//     const state = initializeQueue(["A", "B", "C"], false);
//     const current = getCurrentCountry(state)!;

//     const result = handlePass(state, current);

//     expect(result.action).toBe("defer");
//     expect(result.queueState.queue.map((c) => c.name)).toEqual(["B", "C", "A"]);
//     expect(result.passesRemaining).toBe(1);
//   });

//   it("reveals on the third pass", () => {
//     let state = initializeQueue(["A", "B"], false);
//     const current = { id: "A", name: "A" };

//     state = handlePass(state, current).queueState;
//     state = handlePass(state, current).queueState;
//     const result = handlePass(state, current);

//     expect(result.action).toBe("reveal");
//     expect(result.queueState.queue.map((c) => c.name)).toEqual(["B"]);
//   });

//   it("removes a correctly guessed country", () => {
//     const state = initializeQueue(["A", "B", "C"], false);
//     const current = getCurrentCountry(state)!;

//     const result = handleCorrectGuess(state, "A", current);

//     expect(result.correct).toBe(true);
//     expect(result.queueState.queue.map((c) => c.name)).toEqual(["B", "C"]);
//   });

//   it("detects empty queue", () => {
//     const state = initializeQueue([], false);
//     const result = handlePass(state, null);

//     expect(result.action).toBe("complete");
//     expect(getRemainingPassesForCurrentCountry(state, null)).toBe(0);
//   });
// });