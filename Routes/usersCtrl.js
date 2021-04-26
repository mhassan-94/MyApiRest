// IMPORT // 
var bcrypt = require ('bcrypt');
var jwtUtils = require ('../utils/jwt.utils');
var models = require('../models');
var asyncLib = require('async');

// CONST //
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;

// Routes //
module.exports = {
    register: (req,res) => {
        // params //
        var email = req.body.email
        var username = req.body.username
        var password = req.body.password
        var bio = req.body.bio
      
        if (email == null || username == null || password == null ) {
            return res.status(400).json({'error': 'missing parameters'})
        }

        if(username.length >= 13 || username.length <= 4) {
            return res.status(400).json({'error': 'erreur, entre 4 et 13 caractères'})
        }

        if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({'error': 'email is not valid'})
        }
        if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({'error': 'password is not valid (doit etre entre 4 et 13 caractères dont un chiffre minimum)'})
        }

        asyncLib.waterfall([
            (done) => {
                models.User.findOne({
                    attributes: ['email'],
                    where: { email: email }
                  })
                  .then((userFound) => {
                    done(null, userFound);
                  })
                  .catch((err) => {
                    return res.status(500).json({ 'error': 'unable to verify user' });
                  });
              },
              (userFound, done) => {
                if (!userFound) {
                    bcrypt.hash(password, 5, ( err, bcryptedPassword ) => {
                      done(null, userFound, bcryptedPassword);
                    });
                  } else {
                    return res.status(409).json({ 'error': 'user already exist' });
                  }
              },
              (userFound, bcryptedPassword, done) => {
                var newUser = models.User.create({
                  email: email,
                  username: username,
                  password: bcryptedPassword,
                  bio: bio,
                  isAdmin: 0
                })
                .then((newUser) => {
                  done(newUser);
                })
                .catch((err) => {
                  return res.status(500).json({ 'error': 'cannot add user' });
                });
              }
            ], (newUser) => {
                if (newUser) {
                    console.log('--------------------',newUser)
                  return res.status(201).json({
                    'userId': newUser.id,
                    'message': 'User successfully created',
                  });
                } else {
                  return res.status(500).json({ 'error': 'cannot add user' });
                }
            });
    },
    login: (req,res) => {
        // PARAMS //
        var email = req.body.email;
        var password = req.body.password;

        if (email == null || password == null) {
            return res.status(400).json({'error': 'missing parameters'})
        }

        models.User.findOne({
            where: {email: email}
        })
        .then((userFound) => {
            if (userFound) {
                bcrypt.compare(password,userFound.password, (errBycrypt, resBycrypt) => {
                    if (resBycrypt) {
                        return res.status(200).json({
                            'userId': userFound.id,
                            'token': jwtUtils.generateTokenForUser(userFound)
                        });
                    } else {
                        return res.status(403).json({'error': 'invalid password'});
                    }
                });
            } else {
                return res.status(404).json({'error': 'user not exist in DB'})
            }    
        })       
        .catch((err) => {
            return res.status(500).json({'error': 'unable to verify user' });
        });
    },
    getUserProfile: (req, res) => {
        models.User.findOne({
            attributes: [ 'id', 'email', 'username', 'bio' ],
            where: { id: req.params.id }
        }).then((user) => {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
        }).catch((err) => {
            res.status(500).json({ 'error': 'cannot fetch user' });
        });
    },
    getAllUserProfile: (req, res) => {
        
        models.User.findAll({
            attributes: [ 'id', 'email', 'username', 'bio' ],
        }).then((user) => {
            if (user) {
              res.status(201).json(user);
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
        }).catch((err) => {
            res.status(500).json({ 'error': 'cannot fetch user' });
        });
    },
    updateUserProfile: (req, res) => {
        // Getting auth header
        var headerAuth  = req.headers['authorization'];
        var userId      = jwtUtils.getUserId(headerAuth);
    
        // Params
        var bio = req.body.bio;
    
        asyncLib.waterfall([
          (done) => {
            models.User.findOne({
              attributes: ['id', 'bio'],
              where: { id: userId }
            }).then((userFound) => {
              done(null, userFound);
            })
            .catch((err) => {
              return res.status(500).json({ 'error': 'unable to verify user' });
            });
          },
          (userFound, done) => {
            if(userFound) {
              userFound.update({
                bio: (bio ? bio : userFound.bio)
              }).then(() => {
                done(userFound);
              }).catch((err) => {
                res.status(500).json({ 'error': 'cannot update user' });
              });
            } else {
              res.status(404).json({ 'error': 'user not found' });
            }
          },
        ], (userFound) => {
          if (userFound) {
            return res.status(201).json(userFound);
            } else {
            return res.status(500).json({ 'error': 'cannot update user profile' });
            }
        });
    },
    deleteUser: (req, res) => {

      asyncLib.waterfall([
          (done) => {
              models.User.findOne({
                  where : {id: req.params.id}
              })
              .then((userFound) => {
                  done(null, userFound);
              })
              .catch(function(err) {
                  return res.status(500).json({ 'error' : 'unable to verify user'});
              });
          },
          (userFound, done) => {
              if(userFound){
                  userFound.destroy({
                  })
                  .then((userFound) => {
                      done(null, userFound);
                  })
                  .catch((err) => {
                      return res.status(500).json({ 'error' : 'unable to destroy user'});
                  });
              } else {
                  res.status(404).json({ 'error' : 'user not found'});
              }
          }
      ],
      (userFound) => {
          if(!userFound){
              return res.status(200).json({ 'message' : 'User successfully deleted'});
          } else {
              return res.status(500).json({ 'error' : 'cannot delete user'});
          }
      });
    } 
}