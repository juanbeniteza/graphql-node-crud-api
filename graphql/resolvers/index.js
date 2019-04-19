const bcrypt = require("bcryptjs");

// Models
const Event = require("../../models/event");
const User = require("../../models/user");


const events = eventIds => {
    return Event.find({ _id: { $in: eventIds } })
      .then(events => {
        return events.map(event => {
          return { ...event._doc, creator: user.bind(this, event._doc.creator) };
        });
      })
      .catch(err => {
        throw err;
      });
  };
  
  const user = userId => {
    return User.findById(userId)
      .then(user => {
        return {
          ...user._doc,
          password: null,
          createdEvents: events.bind(this, user._doc.createdEvents)
        };
      })
      .catch(err => {
        throw err;
      });
  };

module.exports = {
    events: () => {
      return Event.find()
        .then(events => {
          // Return is for express-graphql knows that is an async and we need to wait
          return events.map(event => {
            return {
              ...event._doc,
              creator: user.bind(this, event._doc.creator)
            };
          });
        })
        .catch(err => {
          throw err;
        });
    },
    createEvent: args => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "5cb27257ee98b931b48a3fe6"
      });
      let createdEvent;
      return event
        .save()
        .then(result => {
          createdEvent = {
            ...result._doc,
            creator: user.bind(this, event._doc.creator)
          };
          return User.findById("5cb27257ee98b931b48a3fe6");
        })
        .then(user => {
          if (!user) {
            throw new Error("User doesn't exist");
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(result => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err);
          throw err; // Return an error
        });
    },
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
          return { ...result._doc, password: null };
        })
        .catch(err => {
          throw err;
        });
    }
  }