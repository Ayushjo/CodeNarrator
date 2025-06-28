const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id }, "secret", { expiresIn: "1h" });
};
