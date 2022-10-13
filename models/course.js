'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.hasMany(models.Class)
    }

    //* instance method
    showStatus() {
      let status = ''
      if (this.totalStudent == 0) {
        status = 'Kelas sepi parah'
      } else if (this.totalStudent <= 10) {
        status = 'Ada murid tp dikit'
      } else if (this.totalStudent > 10) {
        status = 'Ada banyak murid'
      }
      return status
    }
    get status() {
      return this.showStatus()
    }
  }
  Course.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    totalStudent: DataTypes.INTEGER,
    author: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  Course.beforeCreate(user => {
    user.totalStudent = 0
  })
  return Course;
};