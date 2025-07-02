test('generates fixture data and passes', () => {
  const data = Array.from({ length: 200 }, (_, i) => ({ line: `${i + 1}` }));
  expect(Array.isArray(data)).toBe(true);
  expect(data).toHaveLength(200);
});
