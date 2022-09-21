const express  = require("express")
const router =express.Router()
const userController = require("../controllers/userController")
const bookController = require("../controllers/bookController")




router.post("/register", userController.createuser)
router.post("/login", userController.login)
router.post("/books", bookController.createBooks )
router.get("/books", bookController.getBooks)
router.all("/*",(req,res)=>{res.status(404).send({status:false,message:"Endpoint is not correct"})})

module.exports = router;