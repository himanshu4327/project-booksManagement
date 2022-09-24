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

const isValidRating =  function(rating){
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
    if (data.rating < 1 || data.rating > 5 || !isValidRating(data.rating)) {
      return res.status(400).send({ status: false, msg: "Rating must be greater than equal to 1 and less than equal to 5  AND not allowed rating in decimal." })
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


//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>UpdateReview>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const updateReviewByID = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res.status(404).send({ status: false, msg: "Invalid bookId" });
    }
    let validBook = await bookModel.findById(bookId).select({ ISBN: 0, deletedAt: 0 });
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

    if (rating < 1 || rating > 5 || !isValidRating) {
      return res.status(400).send({ status: false, msg: "Rating must be greater than equal to 1 and less than equal to 5  AND not allowed rating in decimal."});
    }

    let updatedReview = await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { $set: { rating: rating, reviewedBy: reviewedBy, review: review } },
      { new: true }
    );
    let result = {
      bookData: validBook,
      reviewsData: updatedReview
    }
    return res.status(200).send({ status: true, message: "successfully updated", data: result });
  } catch (error) {
    return res.status(400).send({ status: false, msg: error.message });
  }
};

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>delete review>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


const deleteReview = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    if (Object.keys(bookId) == 0) { return res.status(400).send({ status: false, message: "Please Enter book Id in params" }) }
    if (Object.keys(reviewId) == 0) { return res.status(400).send({ status: false, message: "please Enter review Id in params" }) }


    if (!isValidObjectId(bookId)) {
      return res.status(400).send({ status: false, msg: "Please Enter valid BookId" })
    }
    let book = await bookModel.findById(bookId);
    if (book) {
      if (book['isDeleted'] == true) return res.status(400).send({ status: false, message: "Book does not exist already deleted" });
    } else return res.status(404).send({ status: false, message: "Book not found" });

    if (!isValidObjectId(reviewId)) {
      return res.status(400).send({ status: false, msg: "Please Enter valid reviewId" })
    }
    let review = await reviewModel.findById(reviewId);
    if (review) {
      if (review['isDeleted'] == true) return res.status(400).send({ status: false, message: "Review does not exist already deleted" });
    } else return res.status(404).send({ status: false, message: "Review not found" });

    const Reviewdeleted = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true }, { new: true });
    await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } }, { new: true });

    res.status(200).send({ status:true, message: "Review has been deleted successfully" });
  }
  catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

//....................................................................................................................//

module.exports.createReview = createReview
module.exports.updateReviewByID = updateReviewByID
module.exports.deleteReview = deleteReview