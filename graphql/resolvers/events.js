const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./merge");


module.exports = {
    events: () => {
      return Event.find()
        .then(events => {
          // Return is for express-graphql knows that is an async and we need to wait
          return events.map(event => {
            return transformEvent(event);
          });
        })
        .catch(err => {
          throw err;
        });
    },
    createEvent: (args, req) => {
        if (!req.isAuth){
          throw new Error("Unathenticated");
        }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: "5cb9dbdc6947e1001fb21d6a"
      });
      let createdEvent;
      return event
        .save()
        .then(result => {
          createdEvent = transformEvent(result);
          return User.findById("5cb9dbdc6947e1001fb21d6a");
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
    }
  };
  