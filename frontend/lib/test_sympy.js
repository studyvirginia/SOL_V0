import { evaluateMathEquivalence } from './sympyService.js';

async function test() {
  console.log("Test 1: 1/2 vs 0.5");
  let res = await evaluateMathEquivalence("1/2", "0.5");
  console.log(res);

  console.log("\nTest 2: x + x vs 2*x");
  res = await evaluateMathEquivalence("x + x", "2*x");
  console.log(res);

  console.log("\nTest 3: Wrong answer (x vs x^2)");
  res = await evaluateMathEquivalence("x", "x**2");
  console.log(res);
}

test();
