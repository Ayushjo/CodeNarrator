exports.getUser = (req, res) => {
  res.json({ name: 'Test User', email: 'test@example.com' });
};