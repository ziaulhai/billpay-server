const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();

app.use(express.json());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://ebillpay.netlify.app'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const database = client.db("paybill_db");
        const billCollection = database.collection("bills");
        const myBillCollection = database.collection("mybills");

        const billRoutes = require('./routes/bills')(client);
        app.use('/api/v1/bills', billRoutes);

        const myBillRoutes = require('./routes/mybills')(myBillCollection);
        app.use('/api/v1/mybills', myBillRoutes);

        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        app.get('/', (req, res) => {
            res.send('Bill Pay Server is running!');
        });

    } catch(e) {
        console.error("Server startup error:", e);
    }
}

run().catch(console.dir);
module.exports = app;




