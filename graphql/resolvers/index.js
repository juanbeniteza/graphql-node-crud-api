const bcrypt = require("bcryptjs");

// Models
const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const event = eventId => {
  return Event.findById(eventId)
    .then(event => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator)
      };
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
            date: new Date(event._doc.date).toISOString(),
            creator: user.bind(this, event._doc.creator)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  bookings: () => {
    return Booking.find()
      .then(bookings => {
        return bookings.map(booking => {
          return {
            ...booking._doc,
            event: event.bind(this, booking._doc.event),
            user: user.bind(this, booking._doc.user),
            createdAt: new Date(booking._doc.createdAt).toISOString(),
            updatedAt: new Date(booking._doc.updatedAt).toISOString()
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
      creator: "5cb9dbdc6947e1001fb21d6a"
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          creator: user.bind(this, result._doc.creator),
          date: new Date(result._doc.date).toISOString()
        };
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
  },
  bookEvent: args => {
    return Event.findById(args.eventId)
      .then(event => {
        const booking = new Booking({
          user: "5cb9dbdc6947e1001fb21d6a",
          event: event
        });
        return booking.save();
      })
      .then(booking => {
        return {
          ...booking._doc,
          event: event.bind(this, booking._doc.event),
          user: user.bind(this, booking._doc.user),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString()
        };
      })
      .catch(err => {
        throw err;
      });
  },
  cancelBooking: args => {
    let eventBooking;
    return Booking.findById(args.bookingId)
      .populate("event")
      .then(booking => {
        eventBooking = {
          ...booking.event._doc,
          creator: user.bind(this, booking.event._doc.creator),
          date: new Date(booking.event._doc.date).toISOString()
        };
        return Booking.deleteOne({ _id: args.bookingId });
      })
      .then(result => {
        return eventBooking;
      })
      .catch(err => {
        throw err;
      });
  }
};
