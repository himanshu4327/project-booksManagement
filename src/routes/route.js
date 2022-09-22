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
router.delete("/books/:bookId",bookController.deleteBooksbyId)
router.post("/books/:bookId/review", reviewController.createReview)

router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"Endpoint is not correct"})})

module.exports = router;