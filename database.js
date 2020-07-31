const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uuid = require("uuid").v4;
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let userSchema = new Schema({
  username: { type: String, required: true },
  _id: { type: String, required: true },
  log: [
    {
      description: { type: String, required: true },
      duration: { type: Number, required: true },
      date: Date,
    },
  ],
});
let userModel = mongoose.model("users", userSchema);

const addNewUser = (username, done) => {
  userModel.findOne({ username: username }, (err, data) => {
    if (data) {
      console.log(data);
      done("Username already taken");
    } else {
      var newUser = new userModel({
        username,
        _id: uuid().slice(0, 6),
      });
      newUser.save((err, data) => {
        if (err) done(error);
        done(null, data);
      });
    }
  });
};

const addNewExercise = ({ userId, description, duration, date }, done) => {
  userModel.findById(userId, (err, data) => {
    if (!data) done("User not found");
    else {
      console.log(`User found: ${data}`);
      if (!date) date = new Date();

      data.log.push({ description, duration, date });
      data.save((err, data) => {
        if (err) done(err);
        else
          done(null, {
            _id: data._id,
            username: data.username,
            date,
            duration,
            description,
          });
      });
    }
  });
};
const getUserLogs = (reqBody, done) => {
  var from = new Date(reqBody.from).getTime();
  var to = new Date(reqBody.to).getTime();

  userModel
    .findById(reqBody.userId)
    .select({ username: 1, log: 1 })
    .exec((err, data) => {
      if (!data) done("User not found");
      else {
        if (reqBody.to && reqBody.from)
          data.log = data.log.filter((item) => {
            return item.date.getTime() >= from && item.date.getTime() <= to;
          });
        else if (reqBody.from)
          data.log = data.log.filter((item) => {
            return item.date.getTime() >= from;
          });
        else
          data.log = data.log.filter((item) => {
            return item.date.getTime() <= to;
          });
        if (reqBody.limit) {
          data.log.splice(reqBody.limit);
        }

        console.log(data);
        done(null, data);
      }
    });
};

module.exports.addNewUser = addNewUser;
module.exports.addNewExercise = addNewExercise;
module.exports.getUserLogs = getUserLogs;
