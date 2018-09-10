import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import db from '../model/postgres-connect';
dotenv.config();

export default class Users {

  constructor() {
    this.userSignIn = this.userSignIn.bind(this);
    this.registerNewUser = this.registerNewUser.bind(this);
    this.secret = process.env.SECRET;
    this.generateAuthToken = this.generateAuthToken.bind(this);
  }

  /**
   * 
   * @param {object} req 
   * @param {object} res 
   */
  userProfile(req, res) {
    res.status(200).json(req.user);
  }
  /**
   * generates a token by user id
   * @param {object} userData 
   * @returns {string} token
   */
  generateAuthToken(data) {
    let username = data.username;
    let id = data.id;
    let token = jwt.sign({id,username},this.secret,{expiresIn:'6hr'}).toString();
    return token;
  }


  /**
   * Regex Source: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
   * returns a token for the new user to sign in
   * @param {string} email 
   */
  checkValidEmail(email){
    let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let isValid = reg.test(String(email).toLowerCase());
    if (!isValid) return false;
    return true;
  }


/**
   * 
   * @param {object} req 
   * @param {object} res
   * 
   */
  registerNewUser(req, res) {
    const { email, username, password } = req.body;
    const validateEmail = this.checkValidEmail(email);
    if (!validateEmail) {
      return res.status(400).json({
        errMsg: 'invalid email'
      });
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        db.one('INSERT INTO users(email,username,password) values($1,$2,$3) RETURNING id,username', [email, username, hash])
          .then((data) => {
            const token = this.generateAuthToken(data);
            return res.header('x-auth', token)
              .status(200)
              .json({
                id: data.id,
                username: data.username,
                msg: "Success!",
              });
          }, (err)=>{
            res.status(401).json({
              err: 'username or email taken'
            });
          })
          .catch((err) => {
            res.status(500).send(err)
          });
      });
    });
  }  

/**
   * 
   * @param {object} req 
   * @param {object} res 
   */
  userSignIn(req, res) {
    const {
      email,
      password
    } = req.body;
    if (!email || !password) return res.status(400).json({
      err: 'invalid credentials'
    });
    db.one('SELECT * FROM users where email = $1', email)
      .then((data) => {
        return data;
      },()=>{
        return res.status(401).json({errMsg:'invalid email'});
      })
      .then((data) => {
        return bcrypt.compare(password, data.password)
          .then((result) => {
            if (result) {
              return data;
            }
            return res.status(401).json({
              err: 'invalid password'
            });
          })
      },)
      .then((data) => {
        const {username, id} = data;
        const token = this.generateAuthToken(data);
        const user = {id,username,token}
        return user;
      })
      .then((user)=>{
        res.header('x-auth', user.token).json({
          id: user.id,
          username: user.username,
        });
      })
      .catch((err) => {
        res.status(500).json({errMsg:'server error'});
      });

  }

}
