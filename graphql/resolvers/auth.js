const User = require("../../models/user");
const { transformUser } = require("./merge");
const bcrypt = require("bcryptjs");



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
  }
};
