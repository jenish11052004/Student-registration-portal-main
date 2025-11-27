import App from './App';

test('imports app', () => {
    expect(App).toBeDefined();
});

test('simple math', () => {
    expect(1 + 1).toBe(2);
});
