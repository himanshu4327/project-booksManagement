const bookModel = require("../models/bookModel")
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const isValidObjectId = (ObjectId) => {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}


const authentication = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"]
        if (!token) {
            return res.send({ msg: "Enter a token" })
        }
        jwt.verify(token, "secretkey", function (err, decodedToken) {
            if (err) {
                return res.status(401).send({ msg: "invalid token" })
            } else {
                req["x-api-key"] = decodedToken
                next()
            }
        })
    } catch (err) { return res.status(500).send({ msg: err.message }) }
}


const authorisation = async function (req, res, next) {
    try {
        let decodedToken = req["x-api-key"]
        let bookId = req.params.bookId
        if (!isValidObjectId(bookId)) {
            return res.status(403).send({ msg: "not valid bookId" })
        }
        let book = await bookModel.findOne({ _id: bookId })
        if (!book)
            return res.status(404).send({ msg: "request book not found" })
        if (decodedToken.userId !== book.userId.toString()) {
            return res.status(403).send({ msg: "not authorised" })
        } else {
            next()
        }
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}
module.exports.authentication = authentication
module.exports.authorisation = authorisation