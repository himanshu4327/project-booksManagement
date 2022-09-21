//Returns all books in the collection that aren't deleted. Return only book _id, title, excerpt, userId, category, releasedAt, reviews field. Response example here
// Return the HTTP status 200 if any documents are found. The response structure should be like this
// If no documents are found then return an HTTP status 404 with a response like this
// Filter books list by applying filters. Query param can have any combination of below filters.
// By userId
// By category
// By subcategory example of a query url: books?filtername=filtervalue&f2=fv2
// Return all books sorted by book name in Alphabatical order

const bookModel = require('../Models/bookModel.js')
const getBooks = async function (req, res) {
    try {
        const queries = req.query;
        if (Object.keys(queries).length==0) {

            let data = await bookModel.find({ isDeleted: false}).select({$sort : {title:1}, excerpt:1, userId:1, category:1,releasedAt:1,reviews:1});
            if (data.length == 0) {
                return res.status(404).send({ status: "false", message: "Sorry, Requested Data not Found." })
            } else {
                return res.status(200).send({ status: true, message: data });
            }
        } else {
            let data1 = await bookModel.find({
                $or: [{ userId: queries.authorId }, { category: queries.category },
                { subcategory: queries.subcategory }]
            }).find({ isDeleted: false}).select({$sort:{title:1},excerpt:1, userId:1, category:1,releasedAt:1,reviews:1});
            if (data1.length == 0) {
                return res.status(404).send({ status: "false", message: "Sorry,Requested Data not Found." })
            } else {
                return res.status(200).send({ status: true, message: data1 });
            }
        }
    } catch (error) {
        return res.status(500).send({ msg: error.message })
    }
}
module.exports.getBooks=getBooks