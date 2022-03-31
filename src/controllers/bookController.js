const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const mongoose = require("mongoose")
const reviewModel = require("../models/reviewModel")
const { reviewer } = require("./reviewController")
const moment = require("moment")


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const checkFormat = function (check) {
    if (typeof check == "string" && check.length == 0) return false
    return true
}

const isValidObjectId = function (collegeId) {
    return mongoose.Types.ObjectId.isValid(collegeId)
}




const createBook = async function (req, res) {
    try {
        let data = req.body

        if (Object.keys(data).length > 0) {
            const { title, excerpt, userId, ISBN, category, subCategory, releasedAt } = data


            //book validation

            if (!isValid(title)) {
                return res.status(400).send({ status: false, msg: 'title is missing/invalid' })
            }

            let isBookNameUniue = await bookModel.findOne({ title: title })
            if (isBookNameUniue) {
                return res.status(400).send({ status: false, msg: "Book name is already taken" })
            }

            // excerp validation

            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, msg: 'excerpt is missing/invalid' })
            }

            //user id validation   

            if (!isValid(userId)) {
                return res.status(400).send({ status: false, msg: 'user id is missing/invalid' })
            }

            if (!isValidObjectId(userId)) {
                return res.status(400).send({ status: false, msg: " userId is not in valid format" })
            }

            const isUserIdExist = await userModel.findOne({ _id: userId })
            if (!isUserIdExist) {
                return res.status(400).send({ status: false, msg: "user id does not exist in our system" })
            }

            //ISBN validtion

            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, msg: 'ISBN is missing/inavlid' })
            }

            if (!/\b(?:ISBN(?:: ?| ))?((?:97[89])?\d{9}[\dx])\b/.test(ISBN)) {
                return res.status(400).send({ status: false, msg: "ISBN is not in vlid format" })
            }

            let isISBNalreadyExist = await bookModel.findOne({ ISBN: ISBN })
            if (isISBNalreadyExist) {
                return res.status(400).send({ status: false, nsg: "ISBN number already exist" })

            }



            if (!isValid(category)) {
                return res.status(400).send({ status: false, msg: 'category is missing/invalid' })
            }

            if (!isValid(subCategory)) {
                return res.status(400).send({ status: false, msg: 'sub Category is missing/invalid' })
            }
            
            //releasedAT validation 

            if (!isValid(releasedAt)) {
                return res.status(400).send({ status: false, msg: 'release date is missing/invalid' })
            }

            if(!/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/.test(releasedAt)){
                return res.status(400).send({status : false, msg:"Date is expected to be in YYYY-MM-DD format"})
            }


            const bookCreated = await bookModel.create(data)

            return res.status(201).send({ status: false, msg: "Created", data: bookCreated })

        } else {
            return res.status(400).send({ status: false, msg: "body is missing" })
        }

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}





const getBooks = async function (req, res) {
    try {
        data = req.query
       // console.log(data)
        const filter = {}
        filter.isDeleted = false

        if (Object.keys(data).length > 0) {
            const { userId, category, subCategory } = data

            //console.log(userId)
            if (isValid(userId) && isValidObjectId(userId)) {
                filter.userId = userId
            }

            if (isValid(category)) {
                filter.category = category.trim()
            }

            if (isValid(subCategory)) {
                filter.subCategory = subCategory.trim()
            }

        }

        const bookList = await bookModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, category: 1, reviews: 1, releasedAt: 1 }).sort({ title: 1 })

        if (bookList.length == 0) {
            return res.status(400).send({ status: false, msg: "nothing is found, pls change your filter value" })
        }

        return res.status(200).send({ status: false, msg: "Books List", data: bookList })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}




const getBookDetailsById = async function (req, res) {
    try {
        let data = req.params.bookId

        //console.log(data)

        if (!isValid(data)) {
            return res.status(400).send({ status: false, msg: "path param is missing/invalid" })
        }

        if (!isValidObjectId(data)) {
            return res.status(400).send({ status: false, msg: "path param is not in valid format" })
        }



        let Book = await bookModel.findOne({ _id: data, isDeleted: false })
        // console.log(bookDetails)
        if (!Book) {
            return res.status(400).send({ status: false, msg: "no book found/alredy deleted" })
        }

        let reviewer = await reviewModel.find({ bookId: data, isDeleted: false }).sort({ rating: -1 })

        const { ...data1 } = Book
        console.log(data1)
        data1._doc.reviewsData = reviewer


        return res.status(200).send({ status: true, msg: "done", data: data1._doc })

    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}


const updateBooks = async function (req, res) {
    try {
        data = req.body
        bookId = req.params.bookId
        //console.log(bookId)

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "book Id is either not valid or missing" })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "book id is not valid" })
        }

        // const isBookexist = await bookModel.findOne({ _id: bookId, isDeleted: false })
        // if (!isBookexist) {
        //     return res.status(404).send({ status: false, msg: "no book exist with this id/may be revomed from server" })
        // }

        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "no data in the body" })
        }

        let obj = {}


        const { title, excerpt, releasedAt, ISBN } = data

        if (title) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, msg: "title you want to update is not valid " })
            }
            const checkIsUnique = await bookModel.find({ title: title })  //object shorthand property
            if (checkIsUnique.length > 0) {
                return res.status(400).send({ status: false, msg: "title you want to update is already present in dataBase" })
            }

            obj.title = title.trim()


        }

        if (excerpt) {
            if (!isValid(excerpt)) {
                return res.status(400).send({ status: false, msg: "excerpt you want to update is not valid" })
            }
            obj.excerpt = excerpt.trim()
        }

        if (releasedAt) {
            if (!isValid) {
                return res.status(400).send({ status: false, msg: "released at you want to update is not valid" })
            }
            obj.releasedAt = releasedAt.trim()
        }

        if (ISBN) {
            if (!isValid(ISBN)) {
                return res.status(400).send({ status: false, msg: "ISBN you want to update is not valid" })
            }

            if (ISBN.length != 10) {
                return res.status(400).send({ status: false, msg: 'only 10 digit ISBN number is allowed' })
            }

            if (!/\b(?:ISBN(?:: ?| ))?((?:97[89])?\d{9}[\dx])\b/.test(ISBN)) {
                return res.status(400).send({ status: false, msg: "ISBN is not in vlid format" })
            }

            let checkIsbnIsUnique = await bookModel.find({ ISBN: ISBN })
            if (checkIsbnIsUnique.length > 0) {
                return res.status(400).send({ status: false, msg: "ISBN you want to update is already taken" })
            }

            obj.ISBN = ISBN.trim()
        }
        // console.log(obj)

        const updatingBook = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: obj },// {$set :{ title:obj.title, excerpt : obj.excerpt , releasedAt:obj.releasedAt, ISBN:obj.ISBN }},
            { new: true }

        )
        return res.status(200).send({ status: true, msg: "Updated", data: updatingBook })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}





const deleteBooks = async function (req, res) {
    try {

        bookId = req.params.bookId
        // console.log(bookId)

        if (!isValid(bookId)) {
            return res.status(400).send({ status: false, msg: "book id is not valid" })
        }

        if (!isValidObjectId(bookId)) {
            return res.status(400).send({ status: false, msg: "Book id is not in valid format" })
        }

        // checkBookIdExist = await bookModel.findById({ _id: bookId })
        // if (!checkBookIdExist) {
        //     return res.status(404).send({ status: false, msg: "id does not exist" })
        // }

        // if (checkBookIdExist.isDeleted == true) {
        //     return res.status(404).send({ status: false, msg: "book is already deleted" })
        // }

        const updateIsDeleted = await bookModel.findOneAndUpdate(
            { _id: bookId },
            { $set: { isDeleted: true, deletedAt: Date.now() } }
        )

        return res.status(200).send({ status: true, msg: "Blog Deleted successfully" })


    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}











module.exports.createBook = createBook
module.exports.getBooks = getBooks
module.exports.getBookDetailsById = getBookDetailsById
module.exports.updateBooks = updateBooks
module.exports.deleteBooks = deleteBooks
