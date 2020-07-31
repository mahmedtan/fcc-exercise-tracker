const express = require("express");
const Router = express.Router();
const database = require("./database");
const bodyParser = require("body-parser");

Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: false }));

Router.post("/new-user/", (req, res) => {
  database.addNewUser(req.body.username, (err, data) => {
    if (err) res.json({ error: err });
    else {
      console.log(data);
      res.json({ username: data.username, _id: data._id });
    }
  });
});

Router.post("/add/", (req, res) => {
  database.addNewExercise(req.body, (err, data) => {
    if (err) res.json({ error: err });
    else {
      res.json(data);
    }
  });
});

Router.get("/log/", (req, res) => {
  database.getUserLogs(req.query, (err, data) => {
    if (err) res.json({ error: err });
    else res.json(data);
  });
});

module.exports = Router;
