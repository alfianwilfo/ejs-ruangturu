const isLoggedIn = function (req, res, next) {
    // console.log(req.session, "dari app.js");
    if (!req.session.userId) {
        const error = 'Please login first!'
        res.redirect(`/ruangturu/login?error=${error}`)
    } else {
        next()
    }
}

const isTeacher = function (req, res, next) {
    if (req.session.userId && req.session.role !== 'Teacher') {
        const error = `You have no POWER HEREEE, get ur teacher`
        res.redirect(`/ruangturu/dashboard?error=${error}`)
    } else {
        next()
    }
}

const isStudent = function (req, res, next) {
    if (req.session.userId && req.session.role !== 'Student') {
        const error = `You have no POWER HEREEE, get ur student`
        res.redirect(`/ruangturu/teacher/dashboard?error=${error}`)
    } else {
        next()
    }
}

module.exports = {
    isLoggedIn,
    isTeacher,
    isStudent
}