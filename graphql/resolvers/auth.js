const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/user");

const { transformUser } = require("./merge");

module.exports = {
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User exists already.");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return transformUser(result);
      })
      .catch(err => {
        throw err;
      });
  },
  login: ({ email, password }) => {
    let userToLog;
    return User.findOne({ email: email })
      .then(user => {
        if (!user) {
          throw new Error("User does not exist");
        }
        userToLog = user;
        return bcrypt.compare(password, user.password);
      })
      .then(result => {
        if (!result) {
          throw new Error("Password is incorrect!");
        }
        const token = jwt.sign(
          { userId: userToLog.id, email: userToLog.email },
          "asecretkey",
          {
            expiresIn: "1h"
          }
        );
        return { userId: userToLog.id, token: token, tokenExpiration: 1 };
      })
      .catch(err => {
        throw err;
      });
  }
};
