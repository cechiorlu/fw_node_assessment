const express = require("express")
const app = express()
const dotenv = require('dotenv')
const connectDB = require('./db')

dotenv.config()

connectDB()

app.use(express.json())
app.use(express.urlencoded({
    extended: false
}));

const PORT = process.env.PORT || 3000

const fees = require("./routes/Fees")
const computeTransactionFees = require("./routes/ComputeTransactionFee")

app.use('/', fees)
app.use('/', computeTransactionFees)


app.listen(PORT, () => console.log('server running on ' + PORT))