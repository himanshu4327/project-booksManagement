const userModel = require("../Models/userModel")
const bookModel = require('../Models/bookModel')
const reviewModel = require('../Models/reviewModel')

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Validation Function>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
};


const isValidISBN = function (value) {
    return /^[6-9]{3}[\-][\d]{10}$/.test(value);
}

const isValidObjectId = function (objectId) {
    return /^[0-9a-fA-F]{24}$/.test(objectId)
}

const isValidReleasedAt = function (value) {
    return /^\d{4}\-\d{1,2}\-\d{1,2}$/.test(value)
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Create Book>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const createBooks = async function (req, res) {
    try {
        const data = req.body;

        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: 'please provided data' }) }

        if (!isValid(data.title)) { return res.status(400).send({ status: false, message: 'title is required' }) }

        let isUniquetitle = await bookModel.findOne({ title: data.title })
        if (isUniquetitle) { return res.status(400).send({ status: false, message: 'title already exist' }) }

        if (!isValid(data.excerpt)) { return res.status(400).send({ status: false, message: 'Excerpt is required' }) }

        if (!isValid(data.userId)) { return res.status(400).send({ status: false, message: 'User Id is required' }) }

        if (!isValidObjectId(data.userId)) { return res.status(400).send({ status: false, message: 'Please enter a valid userId' }) }

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

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Get Book>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const getBooks = async function (req, res) {
    try {
        const queries = req.query;
        if (Object.keys(queries).length == 0) {

            let booksDocuments = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 })
            if (booksDocuments.length == 0) {
                return res.status(404).send({ status: false, message: "Sorry, Required books Documents not Found." })
            } else {
                return res.status(200).send({ status: true, message: booksDocuments });
            }
        } else {
            let booksDocuments = await bookModel.find({
                $or: [{ userId: queries.userId }, { category: queries.category },
                { subcategory: queries.subcategory }]
            }).find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 }).sort({ title: 1 });
            if (booksDocuments.length == 0) {
                return res.status(404).send({ status: false, message: "Sorry, Required books Documents not Found." })
            } else {
                return res.status(200).send({ status: true, message: booksDocuments });
            }
        }
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Get BookbyId>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// ### GET /books/:bookId
// - Returns a book with complete details including reviews. Reviews array would be in the form of Array. Response example [here](#book-details-response)
// - Return the HTTP status 200 if any documents are found. The response structure should be like [this](#successful-response-structure) 
// - If the book has no reviews then the response body should include book detail as shown [here](#book-details-response-no-reviews) and an empty array for reviewsData.
// - If no documents are found then return an HTTP status 404 with a response like [this](#error-response-structure) 


const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let bookDocument = await bookModel.findById({ _id: bookId }).select({ ISBN: 0, deletedAt: 0 })
        if (!bookDocument || bookDocument.isDeleted === true) {
            return res.status(404).send({
                status: false,
                message: "books Documents not found"
            })
        }
        let review = await reviewModel.find({ bookId }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 })
        let result = {
            bookDocument,
            reviewsData: review
        };
        return res.status(200).send({ status: true, message: "Books list", data: result })
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
}






const Booksupdate = async function (req, res) {
    try {
        let book_Id = req.params.bookId
        if (!isValidObjectId(book_Id)) { return res.status(400).send({ status: false, message: 'please Enter a valid id' }) }
        let data = req.body

        if (Object.keys(book_Id) == 0) return res.status(400).send({ status: false, message: "please Enter a required book_Id" })

        if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: 'please provided data' }) }

        let book = await bookModel.findById(book_Id)
        if (!book) return res.status(404).send({ status: false, message: "Book does not exists" })

        let is_Deleted = book.isDeleted
        if (is_Deleted == true) return res.status(404).send({ status: false, message: "no Book with this Id or Book is already deleted" })

        let isTitleUnique = await bookModel.findOne({ title: data.title })
        if (isTitleUnique) { return res.status(400).send({ status: false, message: 'Title already exist, Please provide a unique title' }) }

        let isISBNUnique = await bookModel.findOne({ ISBN: data.ISBN })
        if (isISBNUnique) { return res.status(400).send({ status: false, message: 'ISBN already exist, Please provide a unique ISBN' }) }


        let updatedBook = await bookModel.findOneAndUpdate({ _id: book_Id }, { ...data }, { new: true })
        return res.status(202).send({ status: true, message: 'Success', data: updatedBook })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Delete BooksbyId>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// # DELETE /books/:bookId
// Check if the bookId exists and is not deleted. If it does, mark it deleted and return an HTTP status 200 with a response body with status and message.
// If the book document doesn't exist then return an HTTP status of 404 with a body like this


const deleteBooksbyId = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let bookDocument = await bookModel.findById({ _id: bookId })
        if (!bookDocument) return res.status(404).send({ status: false, message: "Book document does not exists" })

        if (bookDocument.isDeleted == true) return res.status(404).send({ status: false, msg: "Book document is already deleted" })
        await bookModel.findOneAndUpdate({ _id: bookId },
            {
                $set: { isDeleted: true, deletedAt: new Date() }
            }
        )
        res.status(200).send({ message: "Deleted" })
    } catch (error) {
        return res.status(500).send({ message: error.message });
    }
}





module.exports.createBooks = createBooks
module.exports.getBooks = getBooks
module.exports.getBookById = getBookById
module.exports.Booksupdate = Booksupdate
module.exports.deleteBooksbyId = deleteBooksbyId


//--------------------------------------------------------//----------------------------------------------------------//
// const getBooks = async function (req, res) {
//     try {
//         const queries = req.query;

//         if (Object.keys(queries).length == 0) {

//             let data = await bookModel.find({ isDeleted: false }).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 })
//             if (data.length == 0) {
//                 return res.status(404).send({ status: "false", message: "Sorry, Requested Data not Found." })
//             } else {
//                 data.sort((a, b) => a.title.localeCompare(b.title))
//                 return res.status(200).send({ status: true, message: data });
//             }
//         } else {
//             const { userId, category, subcategory } = queries
//             let obj = {
//                 isDeleted: false

//             }
//             if (userId) obj.userId = userId
//             if (category) obj.category = category
//             if (subcategory) obj.subcategory = subcategory
//             let data1 = await bookModel.find(obj).select({ title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
//             if (data1.length == 0) {
//                 return res.status(404).send({ status: "false", message: "Sorry,Requested Data not Found." })
//             } else {
//                 data1.sort((a, b) => a.title.localeCompare(b.title))
//                 return res.status(200).send({ status: true, message: data1 });
//             }
//         }
//     } catch (error) {
//         return res.status(500).send({ msg: error.message })
//     }
// }







