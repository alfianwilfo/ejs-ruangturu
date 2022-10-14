const { User, Course, Profile, Class } = require("../models/")
const url = require('url');
const { query } = require("express");
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')
const showDay = require('../helper/showDay')

class Controller {
    static redirectLandingPage(req, res) {
        res.redirect("/ruangturu")
    }
    static renderLandingPage(req, res) {
        res.render("home")
    }
    static renderAbout(req, res) {
        res.render("about")
    }
    static renderRegister(req, res) {
        let { value, message } = req.query
        res.render("register", { value, message })
    }
    static handlerRegister(req, res) {
        const { username, email, password, role } = req.body
        User.create({ username, email, password, role })
        .then(data => {
            const { id, username, email, role } = data
            return Profile.createProfileName(id, username, role)
        })
        .then(success=>{
            res.redirect("/ruangturu/login")
        })
        .catch(err => {
            let value = err.errors[0].value
            let message = err.errors[0].message
            res.redirect(url.format({
                pathname: `/ruangturu/register`,
                query: { value, message }
            }))
        })
    }
    static registerTeacher(req, res) {
        let { value, message } = req.query
        res.render("regisTeacher", { message })
    }
    static handlerRegisTeacher(req, res) {
        const { username, email, password, role = 'Teacher' } = req.body
        User.create({ username, email, password, role })
        .then(success =>{
            const { id, username, email, role } = success
            return Profile.createProfileName(id, username, role)
        })
        .then((profile) => {
            
            res.redirect("/ruangturu/login")
        })
        .catch(err =>{
            let value = err.errors[0].value
            let message = err.errors[0].message
            res.redirect(url.format({
                pathname: `/ruangturu/register/teacher`,
                query: { value, message }
            }))
        })
    }
    static renderLogin(req, res) {
        const { error } = req.query
        res.render("login", { error })
    }
    static handlerLogin(req, res) {
        const { username, password } = req.body
        User.findOne({ where: { username } })
        .then(data => {
            if (data) {
                const isValidPassword = bcrypt.compareSync(password, data.password) // true or false
                if (isValidPassword) {
                    //case berhasil login
                    req.session.userId = data.id //set session di controller login
                    req.session.role = data.role

                    if (req.session.role === 'Teacher') {
                        return res.redirect(`/ruangturu/teacher/dashboard`)
                    } else {
                        return res.redirect('/ruangturu/student/dashboard')
                    }
                } else {
                    throw new Error(`Username / Password salah!`)
                }
            } else {
                throw new Error(`Username tidak ditemukan`)
            }
        })
        .catch(err => {
            let error = err.message
            res.redirect(url.format({
                pathname: `/ruangturu/login`,
                query: { error }
            }))
        })
    }
    
    //! Accessible AFTER login
    static getLogout(req, res) {
        req.session.destroy((err) => {
            if (err) res.send(err)
            else {
                res.redirect('/')
            }
        })
    }
    static renderProfile(req, res) {
        let userId = req.params.userId
        User.findByPk(userId, { //! hardcode dulu
            include: {
                model: Profile
            }
        }) 
        .then((data) => {
            let role = req.session.role
            console.log(role);
            res.render('profile', { data, role })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }

    //! Accessible ONLY for STUDENTS
    static dashboard(req, res) {
        const userId = req.session.userId
        let course // ini buat apa yak
        Course.findAll()
        .then((data) => {
            course = data
            return User.findByPk(userId, {
                include: {
                    model: Class
                }
            })
        })
        .then(user =>{
            //* show table course
            let userCourseId = user.Classes.map(el => el.CourseId)
            let courseIds = course.map(el => el.id)

            let availableCourse = courseIds.filter(function(e) {
                return this.indexOf(e) < 0
            }, userCourseId)

            //* search feature
            let { search } = req.query
            let options = {
                where: { id: availableCourse },
                order: [ ['name', 'ASC'] ]
            }
            if (search) {
                options.where = {
                    ...options.where,
                    name : {[Op.iLike]: `%${search}%`}
                }
            }

            return Course.findAll(options)
        })
        .then(course => {
            let userId = req.session.userId //! hardcode dulu
            const { error } = req.query
            // console.log(course);
            res.render('dashboard', { course, error, showDay, userId  })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static myCourse(req, res) {
        let course
        Course.findAll()
        .then((data) => {
            course = data
            return User.findByPk(req.session.userId, { //! masih hardcode
                include: {
                    model: Class
                }
            })
        })
        .then(user =>{
            let userCourseId = user.Classes.map(el => el.CourseId)

            return Course.findAll({
                where: { id: userCourseId }
            })
        })
        .then(mycourse => {
            const { error } = req.query
            res.render('my-course', { mycourse, error })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static courseDetail(req, res) {
        let final;

        Course.findAll({
            include: {
                model: Class,
                include: User
            }
        })
        .then((data) => {
            final = data.map(el => {
                console.log(el);
                let name = el.name
                let description = el.description
                let teacher = el.author
                let totalStudent = el.totalStudent
                let student = el.Classes.map(({ User }) => {
                    return User.username
                })
                let status = el.status
                return { name, teacher, student, description, totalStudent, status }
            })
            console.log(final);
            return Course.findAll()
        })
        .then((success) => {
            
            res.render('course-detail', { final, success })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static addRelation(req, res) {
        const UserId = req.session.userId
        const { CourseId } = req.params

        Class.create({UserId, CourseId})
        .then((success) => {
            return Course.increment({ totalStudent: 1}, {
                where: { id: CourseId }
            })
        })
        .then((data) => {
            res.redirect('/ruangturu/student/dashboard')
        })
        .catch(err => {
            console.log(err);
            res.send(err)
        })
    }

    //! Accessible ONLY for TEACHERS
    static teacherDashboard(req, res) {
        User.findByPk(req.session.userId, {}) //! hardcode dulu
        .then((data) => {
            return Course.findAll({
                where: {
                    author: data.username
                }
            })
        })
        .then((mycourse) => {
            let userId = req.session.userId //! hardcode dulu
            const { error } = req.query
            res.render('dashboard-teacher', { mycourse, error, userId })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static renderAddCourse(req, res) {
        let teacherName
        User.findByPk(req.session.userId, { //! hardcode dulu
        })
        .then((data) => {
            teacherName = data.username
            res.render('add-course', { teacherName })
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static handlerAddCourse(req, res) {
        const { name, description } = req.body

        let author
        User.findByPk(req.session.userId, { //! hardcode dulu
        })
        .then((data) => {
            author = data.username
            return Course.create({ name, description, author })
        })
        .then((success) => {
            res.redirect('/ruangturu/teacher/dashboard')
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static renderEdit(req, res) {
        let courseId = +req.params.courseId
        // console.log(courseId);

        Course.findByPk(courseId)
        .then((data) => {
            res.render('edit-course', { data })
        })
        .catch((err) => {
            res.send(err)
        })
    }
    static handlerEdit(req, res) {
        const { name, description } = req.body
        let courseId = +req.params.courseId

        let author
        User.findByPk(req.session.userId, { //! hardcode dulu
        })
        .then((data) => {
            author = data.username
            return Course.update({ name, description, author }, {
                where: { id: courseId }
            })
        })
        .then((success) => {
            res.redirect('/ruangturu/teacher/dashboard')
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }
    static deleteCourse(req, res) {
        let courseId = +req.params.courseId

        Course.destroy({
            where: { id: courseId }
        })
        .then((success) => {
            res.redirect('/ruangturu/teacher/dashboard')
        })
        .catch((err) => {
            console.log(err);
            res.send(err)
        })
    }


}

module.exports = Controller