const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "userData.db");
let db = null;

const bcrypt = require("bcrypt");

const foo = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};
foo();

//api 1

app.post("/register/", async (req, res) => {
  const { username, name, password, gender, location } = req.body;
  const q1 = `
    SELECT * FROM user WHERE username = '${username}';
    `;
  const userdata = await db.get(q1);
  if (userdata === undefined) {
    if (password.length < 5) {
      res.status(400);
      res.send("Password is too short");
    } else {
      const hashPass = await bcrypt.hash(password, 10);
      const q2 = `
        INSERT INTO user (username,name,password,gender,location)
        VALUES (
            '${username}',
            '${name}',
            '${hashPass}',
            '${gender}',
            '${location}'
        );
        `;
      await db.run(q2);
      res.send("User created successfully");
    }
  } else {
    res.status(400);
    res.send("User already exists");
  }
});

//api 2

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const q1 = `
    SELECT * FROM user WHERE username = '${username}';
    `;
  const userdata = await db.get(q1);
  if (userdata === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const passCheck = await bcrypt.compare(password, userdata.password);
    if (passCheck === true) {
      console.log("Login success!");
    } else {
      res.status(400);
      res.send("Invalid password");
    }
  }
});

//api 3

app.put("/change-password", async (req, res) => {
  const { username, oldpassword, newPassword } = req.body;
  const q1 = `
    SELECT * FROM user WHERE username = '${username}';
    `;
  const userdata = await db.get(q1);
  if (userdata === undefined) {
    res.status(400);
    res.send("Invalid user");
  } else {
    const passCheck = await bcrypt.compare(oldPassword, userdata.password);
    if (passCheck === true) {
      if (newPassword.length < 5) {
        res.status(400);
        res.send("Password is too short");
      } else {
        const hashPass = await bcrypt.hash(newPassword, 10);
        const q3 = `
        UPDATE user SET password = '${hashPass}'
        ;`;
        await db.run(q3);
        res.send("Password updated");
      }
    } else {
      res.status(400);
      res.send("Invalid current password");
    }
  }
});

module.exports = app;
