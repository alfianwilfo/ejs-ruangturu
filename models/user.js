'use strict';
const {
  Model
} = require('sequelize');

//* require bycrypt
const bcrypt = require('bcryptjs')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile)
      User.hasMany(models.Class)
    }
  }
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {msg: 'Username telah terdaftar'},
      validate:{
        notEmpty: {msg: 'Username gabisa kosong'},
        notNull: {msg: 'Username gabisa null'}
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {msg: 'Email sudah terdaftar'},
      validate:{
        notEmpty: {msg: 'email gabisa kosong'},
        notNull: {msg: 'email gabisa null'},
        isEmail: {msg: 'format harus email'}
      }

    },
    password: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        //!"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$"
        isValid(value){
          let re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
          if (re.test(value) == false) {
            throw new Error('min 8 letter password, with at least a symbol, upper and lower case letters and a number')
          }
        },
        isGreaterThanEight(value){
          if (value.length < 8) {
            throw new Error('Password minimum 8 karakter')
          }
        }
      }
    },
    role:{
      type: DataTypes.STRING
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  User.beforeCreate(user =>{
    //* default register role = student
    if (!user.role) {
      user.role = 'Student'
    }
    //* bycrypt hashing
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(user.password, salt);
    user.password = hash
  })
  return User;
};