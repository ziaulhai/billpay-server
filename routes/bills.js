const express = require('express');
const { ObjectId } = require('mongodb');


module.exports = function (client) {
    const router = express.Router();

    const billCollection = client.db("paybill_db").collection("bills");

    router.get('/', async (req, res) => {
        try {
            const { category, search } = req.query;
            let query = {};

            if (category) {
                query.category = category;
            }

            if (search) {
                const searchRegex = new RegExp(search, 'i');
                query.$or = [
                    { title: { $regex: searchRegex } },
                    { location: { $regex: searchRegex } }
                ];
            }

            const result = await billCollection.find(query).toArray();
            res.send(result);
        } catch (error) {
            console.error("Error fetching all bills:", error);
            res.status(500).send({ message: "Failed to fetch bills with criteria." });
        }
    });

    router.get('/:id', async (req, res) => {
        try {
            const id = req.params.id;

            if (!ObjectId.isValid(id)) {
                return res.status(400).send({ message: "Invalid Bill ID format." });
            }

            const query = { _id: new ObjectId(id) };
            const bill = await billCollection.findOne(query);

            if (!bill) {
                return res.status(404).send({ message: "Bill not found." });
            }
            res.send(bill);
        } catch (error) {
            console.error("Error fetching single bill:", error);
            res.status(500).send({ message: "Failed to fetch single bill." });
        }
    });

    return router;
};