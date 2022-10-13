const router = require('express').Router();
const Controller = require("../controllers/controller")
const { isLoggedIn, isTeacher, isStudent } = require('../middlewares/auth')

//! Accessible BEFORE login
router.get("/", Controller.redirectLandingPage)
router.get("/ruangturu", Controller.renderLandingPage)
router.get("/ruangturu/about", Controller.renderAbout)
router.get("/ruangturu/register", Controller.renderRegister)
router.post("/ruangturu/register", Controller.handlerRegister)
router.get("/ruangturu/login", Controller.renderLogin)
router.post("/ruangturu/login", Controller.handlerLogin)
router.get("/ruangturu/register/teacher", Controller.registerTeacher)
router.post("/ruangturu/register/teacher", Controller.handlerRegisTeacher)

//! CEK login
router.use(isLoggedIn)

//! Accessible AFTER login
router.get("/ruangturu/logout", Controller.getLogout)
router.get("/ruangturu/profile/:userId", Controller.renderProfile)

//! Accessible ONLY for STUDENTS
// router.use(isStudent)
router.get("/ruangturu/dashboard", isStudent, Controller.dashboard)
router.get("/ruangturu/student/dashboard", isStudent, Controller.dashboard)
router.get("/ruangturu/student/my-course", isStudent, Controller.myCourse)
router.get("/ruangturu/detail-course", Controller.courseDetail)
// router.get("/ruangturu/addClass", Controller.addRelation)


//! Accessible ONLY for TEACHERS
router.use(isTeacher)
router.get("/ruangturu/teacher/dashboard", Controller.teacherDashboard)
router.get("/ruangturu/add-course", Controller.renderAddCourse)
router.post("/ruangturu/add-course", Controller.handlerAddCourse)
router.get("/ruangturu/edit-course/:courseId", Controller.renderEdit)
router.post("/ruangturu/edit-course/:courseId", Controller.handlerEdit)
router.get("/ruangturu/delete-course/:courseId", Controller.deleteCourse)

module.exports = router