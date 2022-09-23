const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const moment = require('moment');

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Validation>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};

const isValidObjectId = function (objectId) {
  return /^[0-9a-fA-F]{24}$/.test(objectId)
}
const isValidName = function (value) {
  if (
    typeof value === "string" &&
    value.trim().length > 0 &&
    /^[A-Z][a-z]*(\s[A-Z][a-z]*)*$/.test(value)
  )
    return true;
  return false;
};

const isValidRequestBody = function (requestbody) {
  return Object.keys(requestbody).length > 0
}

const isValidrating = function (rating) {
  return (/^\s*([1-5]){1}\s*$/.test(rating))
}
//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Create Review>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>



const createReview = async (req, res) => {
  try {

    let bookId = req.params.bookId
    let data = req.body
    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please Enter Some Data in request body" })
    }
    data['bookId'] = bookId

    if (!bookId) {
      return res.status(400).send({ status: false, msg: "Please Enter BookId" })
    }
    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: "Invalid BookId" })
    }
    let allbooks = await bookModel.findById(bookId)
    if (!allbooks) { return res.status(404).send({ status: false, msg: "No Book Found" }) }
    if (allbooks['isDeleted'] === true) { return res.status(400).send({ status: false, msg: "Book is Deleted" }) }

    if (!data.rating) {
      return res.status(400).send({ status: false, msg: "Please Enter some rating" })

    }
    if (isValid(data.rating)) {
      return res.status(400).send({ status: false, msg: "Please Enter Only Number in rating" })

    }
    if (data.rating < 1 || data.rating > 5 || !isValidrating(data.rating)) {
      return res.status(400).send({ status: false, msg: "Please Enter rating b/w 1 to 5" })
    }

    if (!data.reviewedBy) {
      let reviewedBy = "Guest"
      data['reviewedby'] = reviewedBy
    }
    if (!data.review) {
      return res.status(400).send({ status: false, msg: "Please write the review on Book" })
    }

    let date = Date.now()
    let reviewedAt = moment(date).format("YYYY-MM-DD, hh:mm:ss")
    data['reviewedAt'] = reviewedAt

    const reviewes = await reviewModel.create(data)
    const bookReviwes = await bookModel.findOneAndUpdate({ _id: data.bookId }, { $inc: { reviews: +1 } }, { new: true })

    let result = bookReviwes.toObject()
    result.reviewData = reviewes
    return res.status(201).send({ status: true, msg: "Reviewes Added Succesfully", data: result })

  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
}




//const createReview = async function (req, res) {
//try {
// let bookId = req.params.bookId
//let data = req.body
//if (Object.keys(data).length == 0) {
//return res.status(400).send({ status: false, msg: "Please Provide Some Data" })
//}

//data['bookId'] = bookId
//if (!bookId) {
//return res.status(400).send({ status: false, msg: "Please Provide BookId" })
//}

//if (!isValidObjectId(bookId)) { return res.status(400).send({ status: false, message: 'please Enter a valid book id' }) }

//let allbooks = await bookModel.findById(bookId);
//if (!allbooks) { return res.status(404).send({ status: false, message: 'No Book Found' }) }

//let isDeleted = allbooks.isDeleted;
//if (isDeleted == true) { return res.status(404).send({ status: false, message: 'Book is deleted, can not find book' }) }

//let AllBooks = await bookModel.findById(bookId);
//if (!AllBooks) { return res.status(404).send({ status: false, message: 'this id is not exist, please Enter a valid book Id' }) }

//if (!isValid(rating)) { return res.status(400).send({ status: false, message: "Rating is required" }) }

//if (rating < 1 || rating > 5) { return res.status(400).send({ status: false, message: "please Enter rating b/w 1 to 5" }) }

//data.reviewedAt = new Date();

//const updatedBook = await bookModel.findOneAndUpdate({ _id: data.bookId }, { $inc: { reviews: +1 } }, { new: true })

//const reviews = await reviewModel.create(data);
//return res.status(201).send({ status: true, message: 'success', data: { ...updatedBook.toObject(), reviewsData: reviews } })

//}
//catch (error) {
//return res.status(500).send({ status: false, message: error.message })
//}
//}

// ### PUT /books/:bookId/review/:reviewId
// - Update the review - review, rating, reviewer's name.
// - Check if the bookId exists and is not deleted before updating the review. Check if the review exist before updating the review. Send an error response with appropirate status code like [this](#error-response-structure) if the book does not exist
// - Get review details like review, rating, reviewer's name in request body.
// - Return the updated book document with reviews data on successful operation. The response body should be in the form of JSON object like [this](#book-details-response)

const updateReviewByID = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res.status(404).send({ status: false, msg: " Invalid bookId" });
    }
    let validBook = await bookModel.findById(bookId);
    if (!validBook || validBook.isDeleted == true) {
      return res.status(404).send({ status: false, message: "book not found OR deleted already" });
    }
    let reviewId = req.params.reviewId;
    if (!isValidObjectId(reviewId)) {
      return res.status(404).send({ status: false, msg: " Invalid reviewId" });
    }

    let validReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId });
    if (!validReview || validReview.isDeleted == true) {

      return res.status(404).send({ status: false, message: "Review not found OR deleted already" });
    }

    const { rating, review, reviewedBy } = req.body;
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, msg: "Provide Details for update" });
    }

    if (isValid(rating)) {
      return res.status(400).send({ status: false, msg: "Please Enter Only Number in rating" })
    }

    if (rating < 1 || rating > 5 || !isValidrating(rating)) {
      return res.status(400).send({ status: false, msg: "Please Enter rating b/w 1 to 5 AND no decimal value accepted" });
    }

    if (!review) {
      return res.status(400).send({ status: false, msg: "Provide review " });
    }

    if (!reviewedBy) {
      return res.status(400).send({ status: false, msg: " provide proper name for reviewedBy" });
    }


    let data = {};
    data.rating = rating;
    data.reviewedBy = reviewedBy;
    data.review = review;

    let updatedReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      data,
      { new: true }
    );
    return res.status(200).send({
      status: true,
      message: "successfully updated",
      data: updatedReview,
    });
  } catch (error) {
    return res.status(400).send({ status: false, msg: error.message });
  }
};



module.exports.createReview = createReview
module.exports.updateReviewByID = updateReviewByID