const User = require("../models/User");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const generateOtp = require("../tools/generateOtp");

// create error with next  for better than error handling
exports.signUp = async (req, res, next) => {
  try {
    const fullname = req.body.fullname;
    const secretString = req.body.secretString;

    if (fullname == null || secretString == null) {
      return res.status(404).send("Please provide all requested data.");
    }

    // just to handle secret string not having dots or dashes
    if (secretString.includes(".") && secretString.includes("-")) {
      return res
        .status(422)
        .send(
          "Provided data is not valid! Secret String should not contain - and . in the same time."
        );
    } else {
      const exists = await User.findOne({ secretString: secretString });

      if (exists) {
        return res
          .status(409)
          .send(
            "User can not be created because a document with this secret string already exists."
          );
      } else {
        const user = await User.create({
          fullname: fullname,
          secretString: secretString,
          //   change to function generateOtp in tools folder
          otp: await generateOtp(),
        });
        return res
          .status(201)
          .json({ message: "User created successfully.", user });
      }
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "server error signUp", err.message));
  }
};

// remove then and catch and replace async and await
// create error with next  for better than error handling
exports.login = async (req, res, next) => {
  try {
    const secretString = req.body.secretString;
    const otp = req.body.otp;

    const findUser = await User.findOne({ secretString: secretString });

    if (!findUser) {
      return res.status(404).send("Please provide valid credentials.");
    } else {
      if (findUser.otp == otp) {
        const fullname = findUser.fullname;
        const token = jwt.sign(
          { userId: findUser._id.toString() },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res
          .status(200)
          .json({ message: `Dear ${fullname} you are logged in`, token });
      } else {
        return res.status(404).send("Please provide valid credentials.");
      }
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "server error login", err.message));
  }
};

// remove then and catch and replace async and await
// create error with next  for better than error handling
exports.getName = async (req, res, next) => {
  try {
    const secretString = req.body.secretString;

    // just to handle secret string not having dots or dashes
    if (secretString.includes(".") && secretString.includes("-")) {
      return res
        .status(422)
        .send(
          "Provided data is not valid! Secret String should not contain - and . in the same time."
        );
    }

    const find = await User.findOne({ secretString: secretString });

    User.findOne({ secretString: secretString });

    const userId = find.id;

    if (userId.toString() !== req.userId) {
      return res.status(401).send("Credentials not valid.");
    }

    if (!find) {
      return res.status(401).send("User not found.");
    } else {
      const fullname = find.fullname;
      return res
        .status(200)
        .send(`You are authenticated and your name is ${fullname}`);
    }
  } catch (err) {
    console.log(err);
    next(createError(500, "server error getName", err.message));
  }
};
