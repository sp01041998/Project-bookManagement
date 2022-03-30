const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidTitle = function (title) {
    return ['Mr', "Mrs", "Miss"].indexOf(title) !== -1
}

// const typeString = function(value){
//     if(typeof value !== "string") return false
//     return true
// }

// tst cases need to be handled in 400
const createUser = async function (req, res) {
    try {
        data = req.body


        if (Object.keys(data).length > 0) {

            const { title, name, phone, email, password, address: { street, city, pincode } } = data

            //validation

            if (!isValid(title)) {
                return res.status(400).send({ status: false, msg: "title is not valid/title is missing" })
            }

            if (!isValidTitle(title)) {
                return res.status(400).send({ status: false, msg: "title is not correct" })
            }


            if (!isValid(name)) {
                return res.status(400).send({ status: false, msg: "name is not valid/name is missing" })
            }

            //email validation

            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: "email is required" })
            }

            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, msg: "Email should be valid email address" })
            }

            const isEmailalredyUsed = await userModel.findOne({ email }) //{email :email} object shorthand property
            //console.log(isEmailalredyUsed)
            if (isEmailalredyUsed) {
                return res.status(400).send({ status: false, msg: "email already in use" })

            }



            //phone number validation



            if (!isValid(phone)) {
                return res.status(400).send({ status: false, msg: "phone is not valid/phone is missing" })
            }

            if (phone.length != 10) {
                return res.status(400).send({ status: false, msg: "phone length needs to be of 10 digit" })
            }

            if (!/^[0-9]{10}$/.test(phone)) {
                return res.status(400).send({ status: false, msg: "phone should be valid phone number" })
            }

            let isphonealreadyused = await userModel.findOne({ phone: phone })
            if (isphonealreadyused) {
                return res.status(400).send({ status: false, msg: "phone number is already in use" })
            }

            //password validation

            if (!isValid(password)) {
                return res.status(400).send({ status: false, msg: "password is not valid/password is missing" })
            }

            if (password.length < 8 || password.length > 15) {
                return res.status(400).send({ status: false, msg: "passowrd min length is 8 and max len is 15" })
            }


            //address validation

            if (street) {
                if (!isValid(street)) {
                    return res.status(400).send({ status: false, msg: "street is not valid" })
                }

            }

            if (city) {
                if (!isValid(city)) {
                    return res.status(400).send({ status: false, msg: "city is not valid" })
                }

            }

            if (pincode) {
                if (!isValid(pincode)) {
                    return res.status(400).send({ status: false, msg: "pincode is not valid" })
                }

                if (!/^[0-9]{6}$/.test(pincode)) {
                    return res.status(400).send({ status: false, msg: "pincode should be valid pin number" })
                }

            }

            //console.log(data)
            const userCreated = await userModel.create(data)
            return res.status(201).send({ status: true, msg: "user Created", data: userCreated })



        } else {
            return res.status(400).send({ status: false, msg: "Body is missing" })
        }


    } catch (err) {

        return res.status(500).send({ status: false, msg: err.message })
    }
}


const userLogin = async function (req, res) {
    try {
        let data = req.body


        if (Object.keys(data).length > 0) {
            let email = req.body.email
            let password = req.body.password
            if (!email) {
                return res.status(400).send({ status: false, msg: "email is missing" })
            }

            if (!password) {
                return res.status(400).send({ status: false, msg: "password is missing" })
            }

            if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
                return res.status(400).send({ status: false, msg: "Email should be valid email address" })

            }


            const credentialCheck = await userModel.findOne({ email, password })
            if (!credentialCheck) return res.status(401).send({ status: false, msg: "username or password is incorrect" })

            let token = jwt.sign(
                {
                    userId: credentialCheck._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60

                },
                "Ronaldo-007"
            )

            res.setHeader("x-api-token", token)
            res.status(200).send({ status: true, msg: "Author login successful", data: token })
        }
        else res.status(400).send({ status: false, msg: "username or password is missing" })

    } catch (err) {
        res.status(500).send({ msg: "error", error: err.message })

    }


};

module.exports.createUser = createUser
module.exports.userLogin = userLogin
