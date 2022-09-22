const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")

const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length > 0) return true;
    return false;
  };
  
  const isValidObjectId = function (objectId) {
    return /^[0-9a-fA-F]{24}$/.test(objectId)
}

const createReview = async function (req, res) {
  try {
      let data = req.body;
      let id = req.params.bookId;
      const { bookId, rating } = data

      if (!isValidObjectId(id)) { return res.status(400).send({ status: false, message: 'please Enter a valid id in path params' }) }

      if (id != bookId) { return res.status(400).send({ status: false, message: 'Please Enter same bookId in body and path params' }) }

      let allbooks = await bookModel.findById(id);
      if (!allbooks) { return res.status(404).send({ status: false, message: 'No book found with given id, please Enter valid id' }) }

      let isDeleted = allbooks.isDeleted;
      if (isDeleted == true) { return res.status(404).send({ status: false, message: 'Book is deleted, can not find book' }) }

      if (Object.keys(data) == 0) { return res.status(400).send({ status: false, message: 'No input provided' }) }

      if (!isValid(bookId)) { return res.status(400).send({ status: false, message: 'Book Id is required' }) }

      if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'Please Enter a valid Book Id' }) }

      let AllBooks = await bookModel.findById(bookId);
      if (!AllBooks) { return res.status(404).send({ status: false, message: 'this id is not exist, please Enter a valid book Id' }) }

      if (!isValid(rating)) { return res.status(400).send({ status: false, message: "Rating is required" }) }

      if (rating < 1 || rating > 5) { return res.status(400).send({ status: false, message: "please Enter rating b/w 1 to 5" }) }

      data.reviewedAt = new Date();

      const updatedBook = await bookModel.findOneAndUpdate({ _id: id }, { $inc: { reviews: +1 } }, { new: true })

      const reviews = await reviewModel.create(data);
      return res.status(201).send({ status: true, message: 'success', data: { ...updatedBook.toObject(), reviewsData: reviews } })

  }
  catch (error) {
      return res.status(500).send({ status: false, message: error.message })
  }
}



module.exports.createReview = createReview