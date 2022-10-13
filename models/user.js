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
      unique: {msg: 'Username telah terdaftar'}
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {msg: 'Email sudah terdaftar'}
    },
    password: DataTypes.STRING,
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