const express  = require("express")
const router =express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")
const reviewController = require("../controllers/reviewController")




router.post("/register", userController.createuser)
router.post("/login", userController.login)
router.post("/books", bookController.createBooks )
router.get("/books", bookController.getBooks)
router.get("/books/:bookId", bookController.getBookById)
router.put("/books/:bookId", bookController.Booksupdate)
router.delete("/books/:bookId",bookController.deleteBooksbyId)

//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>API's for review >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.post("/books/:bookId/review", reviewController.createReview)
router.put("/books/:bookId/review/:reviewId",reviewController.updateReviewByID)

router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"Invalid path params"})})

module.exports = router;