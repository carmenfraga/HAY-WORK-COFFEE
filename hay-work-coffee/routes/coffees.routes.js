const router = require('express').Router()
const fileUploader = require("../config/cloudinary.config")
const Coffee = require('./../models/Coffee.model')
const Experience = require('./../models/Experience.model')
const Comment = require('./../models/Comment.model')

const { isLoggedIn, checkRole } = require('./../middlewares/route-guard')


router.get('/coffees/new', (req, res, next) => {

    Coffee
        .find()
        .then(coffees => {
            res.render('coffees/new-coffee', { coffees })
        })
        .catch(err => next(err))
})

router.post('/coffees/new', fileUploader.single('coffeeImage'), (req, res, next) => {

    const { name, address, latitude, longitude } = req.body
    const { path } = req.file

    Coffee
        .create({ name, image: path, address: { address, location: { type: "Point", coordinates: [latitude, longitude] } } })
        .then(() => {
            res.redirect('/coffees')
        })
        .catch(err => next(err))
})

router.get('/coffees', (req, res, next) => {
    Coffee
        .find()
        .then(coffees => {
            res.render('coffees/coffees', { coffees })
        })
        .catch(err => next(err))
});

router.get('/coffees/:id', isLoggedIn, (req, res, next) => {


    const { id } = req.params

    const promise1 = Coffee.findById(id)
    const promise2 = Experience.find({ coffee: id }).populate('owner')

    const promises = [promise1, promise2]

    const viewInfo = {}
    const isAdmin = req.session.currentUser.role === 'ADMIN'

    Promise
        .all(promises)
        .then(([coffeeRes, experiencesRes]) => {



            const comments = experiencesRes.map(eachExperience => {
                return Comment.find({ experience: eachExperience._id })
            })

            viewInfo.coffeeInfo = coffeeRes
            viewInfo.experiences = experiencesRes

            return Promise.all(comments)
        })
        .then(allComments => {

            viewInfo.experiences = viewInfo.experiences.map((eachExperience, idx) => {
                return { ...eachExperience._doc, comments: allComments[idx] }
            })
            // console.log('LA VIEWINFO ---->', viewInfo)
            // res.json(viewInfo)

            // res.render('coffees/coffee-details', viewInfo)
            res.render('coffees/coffee-details', {viewInfo, isAdmin})
        })

        // console.log('LOS COMENTARIOS------------------>', comments)
        // res.render('coffees/coffee-details', { coffeeRes, experiencesRes, commentsMapped })
        // console.log('LA DEL CAFE', coffeeRes, 'LA DE LAS EXPERIENCIAS', experiencesRes)
        .catch(err => next(err))


})

router.post('/coffees/:id/delete', checkRole('ADMIN'), (req, res, next) => {

    const { id } = req.params

    Coffee
        .findByIdAndDelete(id)
        .then(() => {

            res.redirect('/coffees')
        })
        .catch(err => next(err))

});

router.get('/coffees/:id/edit', checkRole('ADMIN'), (req, res, next) => {

    const { id } = req.params


    Coffee
        .findById(id)
        .then(coffees => {

            res.render('coffees/edit-coffee', { coffees })
        })
        .catch(err => next(err))
})

router.post('/coffees/:id/edit', fileUploader.single('coffeeImage'), (req, res, next) => {

    const { id } = req.params
    const { name, address, latitude, longitude } = req.body
    const { path } = req.file

    Coffee
        .findByIdAndUpdate(id, { name, image: path, address: { address, location: { type: "Point", coordinates: [latitude, longitude] } } })
        .then(() => {
            res.redirect('/coffees')
        })
        .catch(err => next(err))
})


module.exports = router;