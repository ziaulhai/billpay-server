const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function (myBillCollection) {
    const router = express.Router();

    router.post('/', async (req, res) => {
        const billData = req.body;

        if (!billData.email || !billData.amount) {
            return res.status(400).send({ message: "Missing required bill data (email or amount)." });
        }

        try {
            const result = await myBillCollection.insertOne(billData);
            res.status(201).send({
                message: "Bill payment recorded successfully",
                insertedId: result.insertedId
            });

        } catch (error) {
            console.error("Error saving bill payment:", error);
            res.status(500).send({ message: "Internal Server Error: Failed to save bill payment." });
        }
    });

    router.get('/:email', async (req, res) => {
        const emailParam = req.params.email;
        const email = decodeURIComponent(emailParam);

        if (!email) {
            return res.status(400).send({ message: "Email parameter is missing or invalid." });
        }

        try {
            const myBills = await myBillCollection.find({ email: email }).toArray();

            if (!myBills || myBills.length === 0) {
                return res.send({ myBills: [] });
            }

            res.send({ myBills: myBills });

        } catch (error) {
            console.error("Error fetching my bills:", error);
            res.status(500).send({ message: "Internal Server Error fetching paid bills." });
        }
    });

    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const updatedData = req.body;

        
        const updateDoc = {
            $set: {
                username: updatedData.username,
                address: updatedData.address,
                lastUpdated: new Date().toLocaleString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', hour12: true
                }),
            },
        };

        try {
            const result = await myBillCollection.updateOne(
                { _id: new ObjectId(id) },
                updateDoc
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({ message: "Bill ID not found." });
            }

            res.send({
                message: "Bill record updated successfully",
                modifiedCount: result.modifiedCount
            });

        } catch (error) {
            console.error("Error updating bill record:", error);
            res.status(500).send({ message: "Internal Server Error updating record." });
        }
    });

    router.delete('/:id', async (req, res) => {
        const id = req.params.id;

        try {
            const result = await myBillCollection.deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).send({ message: "Bill ID not found or already deleted." });
            }

            res.send({
                message: "Bill record deleted successfully",
                deletedCount: result.deletedCount
            });

        } catch (error) {
            console.error("Error deleting bill record:", error);
            res.status(500).send({ message: "Internal Server Error deleting record." });
        }
    });

    return router;
};