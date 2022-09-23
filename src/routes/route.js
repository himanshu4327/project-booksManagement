const express  = require("express")
const router =express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")




router.post("/register", userController.createuser)
router.post("/login", userController.login)
router.post("/books", bookController.createBooks )//authentication
router.get("/books", bookController.getBooks)//authentication
router.get("/books/:bookId", bookController.getBookById)//authenticaion
router.put("/books/:bookId", bookController.Booksupdate)//authentication nd authorization
router.delete("/books/:bookId", bookController.deleteBooksbyId)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>API's for review >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviewByID)
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)


router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"Invalid path params"})})

module.exports = router;