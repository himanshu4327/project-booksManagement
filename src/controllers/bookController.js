const bookModel = require('../Models/bookModel.js')
const getBooks = async function (req, res) {
    try {
        const queries = req.query;
        if (Object.keys(queries).length == 0) {

            let data = await bookModel.find({ isDeleted: false }).select({ $sort: { title: 1 }, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
            if (data.length == 0) {
                return res.status(404).send({ status: "false", message: "Sorry, Requested Data not Found." })
            } else {
                return res.status(200).send({ status: true, message: data });
            }
        } else {
            let data1 = await bookModel.find({
                $or: [{ userId: queries.userId }, { category: queries.category },
                { subcategory: queries.subcategory }]
            }).find({ isDeleted: false }).select({ $sort: { title: 1 }, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
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
module.exports.getBooks = getBooks