const mongoose = require("mongoose");
const e = require("express");
const Schema = mongoose.Schema;
const uuid = require("uuid").v4;
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let userSchema = new Schema({
  username: { type: String, required: true },
});

let userModel = mongoose.model("users", userSchema);

let exerciseSchema = new Schema({
  username: String,
  userId: {
    type: String,
    ref: "Users",
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, default: Date.now() },
});

let exerciseModel = mongoose.model("exercises", exerciseSchema);

const addNewUser = (username, done) => {
  userModel.findOne({ username: username }, (err, data) => {
    if (data) {
      console.log(data);
      done("Username already taken");
    } else {
      var newUser = new userModel({
        username,
      });
      newUser.save((err, data) => {
        if (err) done(err);
        done(null, data);
      });
    }
  });
};

const addNewExercise = (body, done) => {
  userModel.findById(body.userId, (err, data) => {
    if (!data) done("User not found");
    else {
      console.log(`User found: ${data}`);

      var exercise = new exerciseModel(body);
      if (!exercise.date) exercise.date = new Date();
      exercise.username = data.username;
      exercise.save((err, nData) => {
        if (err) done(err);
        else {
          const resExercise = {
            ...data.toObject(),
            date: new Date(nData.date).toDateString(),
            duration: nData.duration,
            description: nData.description,
          };
          delete resExercise.__v;
          done(null, resExercise);
          console.log("exercise:" + exercise);
        }
      });
    }
  });
};
const getUserLogs = (reqBody, done) => {
  var from = new Date(reqBody.from);
  var to = new Date(reqBody.to);
  userModel.findById(reqBody.userId, (err, user) => {
    if (err) done(err);
    else if (!user) done("User not found");
    else
      exerciseModel
        .find({
          userId: reqBody.userId,
          date: {
            $lte: to != "Invalid Date" ? to.toISOString() : Date.now(),
            $gte: from != "Invalid Date" ? from.toISOString() : 0,
          },
        })
        .sort("-date")
        .limit(parseInt(reqBody.limit))
        .exec((err, exercises) => {
          if (err) done(err);
          else if (!exercises) done("No exercises logged");
          else {
            delete user.__v;
            done(null, {
              ...user.toObject(),
              count: exercises.length,
              log: exercises.map((item) => ({
                duration: item.duration,
                description: item.description,
                date: item.date,
              })),
            });
          }
        });
  });
};
const getAllUsers = (done) => {
  userModel.find({}, (err, users) => {
    if (err) done(err);
    else done(null, users);
  });
};
module.exports.getAllUsers = getAllUsers;
module.exports.addNewUser = addNewUser;
module.exports.addNewExercise = addNewExercise;
module.exports.getUserLogs = getUserLogs;
