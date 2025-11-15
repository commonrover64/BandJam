const userModel = require("../models/userSchema");

const registerUser = async (req, res, next) => {
  try {
    // check first user exist of not
    const userExist = await userModel.findOne({ email: req?.body?.email });
    if (!userExist) {
      return res.send({
        success: false,
        message: "user already exist",
      });
    }

    const newUser = new userModel(req?.body);
    await newUser.save();
    res.send({
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
    const userExist = await userModel.findOne({ email: req?.body?.email });
    if (!userExist) {
      return res.send({
        success: false,
        message: "user does not exist!! Register please",
      });
    }

    // check password
    if(req?.body?.password !== userExist.password) {
        return res.send({
            success: false,
            message: "Enter correct password"
        })
    }

    res.send({
        success: true,
        message: "Logged In sucessfully!"
    })

  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = { registerUser, loginUser };
