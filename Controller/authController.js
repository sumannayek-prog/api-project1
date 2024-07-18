// const ProductModel = require("../model/product");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const AuthModel = require("../model/authModel");
const mongoose = require("mongoose");


// Authentication
const authSignUp = (req, res) => {
  res.render("auth/authSignUp", { title: "Authentication SignUp" });
};

// Post data from body
const postData = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log("Email: ", email);

    const user = await AuthModel.findOne({ email: email });

    if (user) {
      console.log("User exits: ");
      res.render("auth/authSignUp", {
        title: "Authentication SignUp",
       
      });
    }

    if (req.body.password === req.body.confirm_password) {
      let hashPassword = await bcrypt.hash(req.body.password, 12);
      // console.log("hashPassword : ", hashPassword);

      let authData = new AuthModel({
        full_name: req.body.full_name.toLowerCase(),
        email: req.body.email.toLowerCase(),
        password: hashPassword,
        gender: req.body.gender,
        user_image: req.files.user_image[0].filename,
        identity_proof: req.files.identity_proof[0].filename,
      });

      // console.log("AuthData: ", authData);

      let saveUser = await authData.save();
      // console.log("Save user: ", saveUser);

      if (saveUser) {
        console.log("User Registered");
        res.redirect("/auth/signIn"); 
      } else {
        console.log("User Not Registered");
      }
    }
  } catch (error) {
    console.log("Error at collecting product: ", error);
  }
};

// Sing in Page Render
const authSignIn =  (req, res) => {
 
  let errMsg = req.flash("error");
    console.log("Error messege: ", errMsg)

  // if (errMsg.length > 0) {
  //   errMsg = errMsg[0];
  // }
  // else{
  //   errMsg = null;
  // }

  res.render("auth/sign-in", {
    title: "Auth Sign In",
    errMsg: errMsg,
  });
};

// Post Data from Auth sign in body

const postAuthLogin = async (req, res) => {
  try {
     // console.log("Sign in page : ", req.body);
    let email = req.body.email;
    let password = req.body.password;
    // console.log("Email : ", email);
    // console.log("Password : ", password);

    let user_exist = await AuthModel.findOne({ email: email });
    // console.log("User Exist: ", user_exist);
    if (user_exist) {
      let user_password = await bcrypt.compare(password, user_exist.password);

      if (user_password) {
        console.log("Password Matched");
        // res.redirect("/viewProducts");
        req.session.isLoggedIn = true;
        req.session.user = user_exist;

        await req.session.save((err) => {
          if (err) {
            console.log("Session saving error: ", err);
          } else {
            console.log("Login successfull");
            return res.redirect("/auth/dashboard");
          }
        });
      } else {
        console.log("Password Not Matched");
        req.flash("error", "Wrong Password!");
        res.redirect("/auth/signIn");
      }
    } else {
      req.flash("error", "Invalid email!");
      res.redirect("/auth/signIn");
    }
  } catch (err) {
    console.log("Auth Login: ", err);
  }
};

const getAuthDetails=async(req,res)=>{
  try{
      let id=req.session.user._id;
      console.log(id);
      let user_detail=await AuthModel.findById(id);
      console.log(user_detail);
      if(user_detail){
          res.render('auth/dashboard',{
              title:"user Profile",
              data:user_detail
          })
          res.redirect('/login');
      }
  }
  catch(error){
      console.log("Error to find",error);
  }
}
const logOut=async(req,res)=>{
  req.session.destroy();
  res.redirect('/login')
}



module.exports = {
  authSignUp,
  postData,
  authSignIn,
  postAuthLogin,
  getAuthDetails,
  logOut,

};
