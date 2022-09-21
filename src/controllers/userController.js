const userModel = require("../Models/userModel")
const jwt = require("jsonwebtoken")


//**************************************VALIDATION FUNCTIONS****************************** */
const isValid = function (value) {
    if (typeof (value) === undefined || typeof (value) === null) { return false }
    if (value.trim().length == 0) { return false }
    if (typeof (value) === "string" && value.trim().length > 0) { return true }
}

const isValidEmail = function (value) {
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return regexForEmail.test(value)
}
const isValidRequest = function (object) {
    return Object.keys(object).length > 0
}


const isValidPassword = function (password) {
    if (/^[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(password)) return true
}

const isValidphone = function (phone) {
    return /^[6-9]\d{9}$/.test(phone);
}

const regixValidator = function (value) {
    let regex = /^[a-zA-Z]+([\s][a-zA-Z]+)*$/
    return regex.test(value)
}


//****************************************REGISTER NEW USER********************************* */
const createuser = async function (req, res) {
    try {
        let data = req.body
        if (!isValidRequest(data)) { return res.status(400).send({ status: false, message: "user data is required" }) }
        const { title, name, phone, email, password, address } = data;

        if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is required" }) }
        if (!(title.trim() == 'Mr' || title.trim() == 'Miss' || title.trim() == 'Mrs')) { return res.status(400).send({ status: false, message: 'Please enter valid title' }) }

        if (!isValid(name) || !regixValidator(name)) { return res.status(400).send({ status: false, message: "name is required and its should contain character" }) }


        if (!isValid(phone)) { return res.status(400).send({ status: false, message: "phone number is required" }) }
        if (!isValidphone(phone)) { return res.status(400).send({ status: false, message: "please enter right phone number" }) }

        let isPhoneUnique = await userModel.findOne({ phone: phone })
        if (isPhoneUnique) { return res.status(400).send({ status: false, message: "phone number already exist" }) }

        if (!isValid(email)) { return res.status(400).send({ status: false, message: "Email is required" }) }
        if (!isValidEmail(email)) { return res.status(400).send({ status: false, message: "Please provide a valid email" }) }

        let isEmailUnique = await userModel.findOne({ email: email })
        if (isEmailUnique) { return res.status(400).send({ status: false, message: "Email already exist" }) }

        if (!isValid(password)) { return res.status(400).send({ status: false, message: "Password is required" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password should be in right format" }) }

        if (address) {
            if (!isValid(address.street)) { return res.status(400).send({ status: false, message: "invalid city" }) }
            if (!isValid(address.city) || !isNameValid(address.city)) { return res.status(400).send({ status: false, message: "invalid city" }); }
            if (! /^\+?([1-9]{1})\)?([0-9]{5})$/.test(address.pincode) && !isValid(address.pincode)) { return res.status(400).send({ status: false, message: "invalid pin" }) }

        }

        let obj = {
            title: title.trim(),
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password: password.trim(),
            address: address
        }
        const newUser = await userModel.create(obj);
        return res.status(201).send({ status: true, message: 'New User created successfully', data: newUser })

    }
    catch (error) { return res.status(500).send({ message: error.message }) }

}

//****************************USER LOGIN****************************** */

const login = async function (req, res) {
    try {
        const data = req.body;
        const queryParams = req.query;

        if (isValidRequest(queryParams)) { return res.status(400).send({ status: false, message: "Invalid request" }); }

        if (!isValidRequest(data)) { return res.status(400).send({ status: false, message: "data is required" }); }

        const userName = data.email;
        const password = data.password;


        if (!isValid(userName)) { return res.status(400).send({ status: false, message: "Email is required" }) }
        if (!isValidEmail(userName)) { return res.status(400).send({ status: false, message: "enter a valid email address" }) }

        if (!isValid(password)) { return res.status(400).send({ status: false, message: "Password is required" }) }
        if (!isValidPassword(password)) { return res.status(400).send({ status: false, message: "Password should be in right format" }) }

        const user = await userModel.findOne({ email: userName, password: password });
        if (!user) { return res.status(404).send({ status: false, message: "no user found " }) }

        //creating a jsonWebToken and sending it to responce header and body

        let token = jwt.sign({
            userId: user._id.toString()
        },
            "group14project3", { expiresIn: "500s" }
        );

        res.header("x-api-key", token);
        return res.status(200).send({ status: true, message: "User Login Successfully", data: token })
    }
    catch (error) {
        console.log(error)
        return res.status(500).send({ message: error.message })
    }
}

module.exports.createuser = createuser;
module.exports.login = login;