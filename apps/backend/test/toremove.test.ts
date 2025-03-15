// sum.test.ts
function sum(a: number, b: number): number {
  return a + b;
}

it('addition de 1 + 2 égale 3', () => {
  expect(sum(1, 2)).toBe(3);
});
