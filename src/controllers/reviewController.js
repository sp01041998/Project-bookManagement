const reviewModel = require("../models/reviewModel")
const bookModel = require("../models/bookModel")
const mongoose = require("mongoose")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidObjectId = function (collegeId) {
    return mongoose.Types.ObjectId.isValid(collegeId)
}


const reviewer = async function (req, res) {

    try {

        bookIdparam = req.params.bookId
        //console.log(bookIdparam)
        if (!isValid(bookIdparam)) {
            return res.status(400).send({ status: false, msg: "book Id is missing" })
        }

        if (!isValidObjectId(bookIdparam)) {
            return res.status(400).send({ status: false, msg: "Book Id is not valid" })
        }


        data = req.body
        //console.log(data)


        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "body is missing" })
        }

        const { bookId, reviewedBy, rating, review } = data
        //console.log(bookId)

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "book Id is missing" })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Book Id is not valid" })
        }

        if (bookId != bookIdparam) {
            return res.status(400).send({ status: false, msg: "book id in params and book id in body both are different" })
        }

        if (!isValid(reviewedBy)) {
            return res.status(400).send({ status: false, msg: " reviewd by is missing" })
        }
        // if(!isValid(reviewedAt)){
        //     return res.status(400).send({status : false, msg : "reviewedAt is missing"})
        // }
        if (!isValid(rating)) {
            return res.status(400).send({ status: false, msg: "rating is missing" })
        }
        if (!isValid(review)) {
            return res.status(400).send({ status: false, msg: "rating is missing" })
        }


        const checkbookIdexist = await bookModel.findOne({ _id: bookId, isDeletd: false })
        if (!checkbookIdexist) {
            return res.status(400).send({ status: false, msg: "no book record found with this id/book ypu are searching is alredy deleted" })

        }

        const reviewGenerated = await reviewModel.create(data)
        obj = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $inc: { reviews: 1 } },

            

        )


        return res.status(200).send({status : true, msg : "reviewed", data : reviewGenerated})

        
        

        


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}

module.exports.reviewer = reviewer