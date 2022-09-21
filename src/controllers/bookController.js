const userModel = require("../Models/userModel")
const bookModel = require('../Models/bookModel.js')

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Validation Function>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
  };
  

const isValidISBN = function (value) {
    return  /^[6-9]{3}[\-][\d]{10}$/.test(value);
}

const isValidObjectId = function (objectId) {
    return /^[0-9a-fA-F]{24}$/.test(objectId)
}

const isValidReleasedAt = function (value) {
    return /((\d{4}[\/-])(\d{2}[\/-])(\d{2}))/.test(value)
}


const createBooks = async function (req, res) {
    try {
        const data = req.body;
        
        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: 'please provided data' }) }

        if (!isValid(data.title)) { return res.status(400).send({ status: false, message: 'title is required' }) }
        
        let isUniquetitle = await bookModel.findOne({ title: data.title })
        if (isUniquetitle) { return res.status(400).send({ status: false, message: 'title already exist' }) }

        if (!isValid(data.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt is required' }) }

        if (!isValid(data.userId)) { return res.status(400).send({ status: false, message: 'User Id is required' }) }

        if (!isValidObjectId(data.userId)) { return res.status(400).send({ status: false, message: 'Please inter a valid userId' }) }

        let checkId = await userModel.findOne({ _id: data.userId })
        if (!checkId) { return res.status(400).send({ status: false, message: 'no user found, Please inter a valid User Id' }) }

        if (!isValid(data.ISBN)) { return res.status(400).send({ status: false, message: 'ISBN is required' }) }

        if (!isValidISBN(data.ISBN)) { return res.status(400).send({ status: false, message: 'Please provide a valid ISBN' }) }

        let isISBNUnique = await bookModel.findOne({ ISBN: data.ISBN })
        if (isISBNUnique) { return res.status(400).send({ status: false, message: 'ISBN already exist, please try again' }) }

        if (!isValid(data.category)) { return res.status(400).send({ status: false, message: 'Category is required' }) }
        if (!isValid(data.subcategory)) { return res.status(400).send({ status: false, message: 'Subcategory is required' }) }

        if (!isValid(data.releasedAt)) { return res.status(400).send({ status: false, message: 'Released date is required' }) }

        if (!isValidReleasedAt(data.releasedAt)) { return res.status(400).send({ status: false, message: 'Please provide date in format YYYY/MM/DD ' }) }

        const newBook = await bookModel.create(data);
        return res.status(201).send({ status: true, message: 'success', data: newBook })
}
catch (error) {
    console.log(error)
    return res.status(500).send({ message: error.message })
}
}


const getBooks = async function (req, res) {
    try {
        const queries = req.query;
        if (Object.keys(queries).length == 0) {

            let data = await bookModel.find({ isDeleted: false }).select({ $sort: { title: 1 }, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
            if (data.length == 0) {
                return res.status(404).send({ status: "false", message: "Sorry, Requested Data not Found." })
            } else {
                return res.status(200).send({ status: true, message: data });
            }
        } else {
            let data1 = await bookModel.find({
                $or: [{ userId: queries.userId }, { category: queries.category },
                { subcategory: queries.subcategory }]
            }).find({ isDeleted: false }).select({ $sort: { title: 1 }, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
            if (data1.length == 0) {
                return res.status(404).send({ status: "false", message: "Sorry,Requested Data not Found." })
            } else {
                return res.status(200).send({ status: true, message: data1 });
            }
        }
    } catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}










module.exports.createBooks = createBooks
module.exports.getBooks = getBooks

