const { json } = require("express");
const userModel = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res, next) => {
  try {
    // check first user exist or not
    const user = await userModel.findOne({ email: req?.body?.email });
    if (user) {
      return res.status(409).send({
        success: false,
        message: "user already exist",
      });
    }

    const newUser = new userModel(req?.body);
    await newUser.save();
    res.status(201).send({
      success: true,
      message: "user successfully registered !",
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    // check first user exist of not
    const email = req?.body?.email.toLowerCase();
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user does not exist!! Register please",
      });
    }

    // check password
    if (req?.body?.password !== user.password) {
      return res.status(401).send({
        success: false,
        message: "Enter correct password",
      });
    }

    // after sucessfully verifying user generate a token with default signing algo
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).send({
      success: true,
      message: "Logged In sucessfully!",
      token: token,
    });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const currentUser = async (req, res) => {
  try {
    const user = await userModel.findById(req?.body?.userId);
    res.send({
      success: true,
      message: "user detail fetched sucessfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, currentUser };
