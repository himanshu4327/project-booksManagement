const bookModel = require("../Models/bookModel")
const reviewModel = require("../Models/reviewModel")
const moment = require('moment');

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
    if (data.rating < 1 || data.rating > 5) {
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


const updateReviewByID = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    if (!isValidObjectId(bookId)) {
      return res.status(404).send({ status: false, msg: " Invalid bookId" });
    }
    let validBook = await bookModel.findById(bookId);
    if (!validBook || validBook.isDeleted == true) {
      return res.status(404).send({ status: false, message: "book not found" });
    }
    let reviewId = req.params.reviewId;
    if (!isValidObjectId(reviewId)) {
      return res.status(404).send({ status: false, msg: " Invalid reviewId" });
    }

    let validReview = await reviewModel.findOne({ _id: reviewId, bookId: bookId });
    if (!validReview || validReview.isDeleted == true) {

      return res.status(404).send({ status: false, message: "Review not found" });
    }

    const { review, rating, reviewedBy } = req.body;
    if (!isValidRequestBody(req.body)) {
      return res.status(400).send({ status: false, msg: "Provide Details for update" });
    }
    if (rating) {
      if (!(rating >= 1 && rating <= 5)) {
        return res.status(400).send({ status: false, msg: " Provide rating between 1 - 5" });
      }
    }
    if (reviewedBy) {
      if (!isValidName(reviewedBy)) {
        return res.status(400).send({ status: false, msg: " provide proper name for reviewedBy" });
      }
    }
    if (review) {
      if (!isValid(review)) {
        return res.status(400).send({ status: false, msg: "review must be string" });
      }
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


const deleteReview = async (req, res) => {
  try{
      let bookId = req.params.bookId;
      let reviewId = req.params.reviewId;

       if (Object.keys(bookId) == 0) { return res.status(400).send({ status: false, message: "Please Enter book Id in params" }) }
       if (Object.keys(reviewId) == 0) { return res.status(400).send({ status: false, message: "please Enter review Id in params" }) }


      if(!isValidObjectId(bookId)){
          return res.status(400).send({status: false,msg:"Please Enter valid BookId"})
      }
      let book = await bookModel.findById(bookId);
      if(book){
          if(book['isDeleted'] == true) return res.status(400).send({status: false, message: "Book does not exist already deleted"});
      }else return res.status(404).send({status: false, message: "Book not found"});

      if(!isValidObjectId(reviewId)){
          return res.status(400).send({status: false,msg:"Please Enter valid reviewId"})
      }
      let review = await reviewModel.findById(reviewId);
      if(review){
          if(review['isDeleted'] == true) return res.status(400).send({status: false, message:"Review does not exist already deleted"});
      }else return res.status(404).send({status: false, message: "Review not found"});

      const Reviewdeleted = await reviewModel.findOneAndUpdate({_id: reviewId},{isDeleted: true},{new: true});
      await bookModel.findOneAndUpdate({_id: bookId},{$inc: {reviews: -1}}, {new: true});

      res.status(200).send({status: true, message: "Review has been deleted successfully", data: Reviewdeleted });
  }
  catch(err){
      res.status(500).send({ status: false, message: error.message });
  }
}


module.exports.createReview = createReview
module.exports.updateReviewByID = updateReviewByID
module.exports.deleteReview = deleteReview