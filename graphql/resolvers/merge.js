const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../utils/date");

const transformEvent = event => {
  return {
    ...event._doc,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator)
  };
};

const transformBooking = booking => {
  return {
    ...booking._doc,
    event: event.bind(this, booking._doc.event),
    user: user.bind(this, booking._doc.user),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt)
  };
};

const transformUser = user => {
  return {
    ...user._doc,
    password: null,
    createdEvents: events.bind(this, user._doc.createdEvents)
  };
};

const events = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return transformEvent(event);
      });
    })
    .catch(err => {
      throw err;
    });
};

const event = eventId => {
  return Event.findById(eventId)
    .then(event => {
      return transformEvent(event);
    })
    .catch(err => {
      throw err;
    });
};

const user = userId => {
  return User.findById(userId)
    .then(user => {
      return transformUser(user);
    })
    .catch(err => {
      throw err;
    });
};

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;
exports.transformUser = transformUser;
