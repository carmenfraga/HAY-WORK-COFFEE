const router = require('express').Router();
const fileUploader = require("../config/cloudinary.config")
const Coffee = require('./../models/Coffee.model')
const Experience = require('./../models/Experience.model')


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
router.get('/coffees/:id', (req, res, next) => {

    const { id } = req.params

    const promises = [Coffee.findById(id), Experience.find({ coffee: id }).populate('owner')]

    Promise
        .all(promises)
        .then(([coffeeRes, experiencesRes]) => {
            // console.log('------------------>', experiencesRes)
            res.render('coffees/coffee-details', { coffeeRes, experiencesRes })
            // console.log('LA DEL CAFE', coffeeRes, 'LA DE LAS EXPERIENCIAS', experiencesRes)
        })
        .catch(err => next(err))


})

router.post('/coffees/:id/delete', (req, res, next) => {

    const { id } = req.params

    Coffee
        .findByIdAndDelete(id)
        .then(() => {
            res.redirect('/coffees')
        })
        .catch(err => next(err))

});

router.get('/coffees/:id/edit', (req, res, next) => {

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