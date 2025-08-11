const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log('Database Connected')
    } catch (error) {
        console.log('connectDB : ' + error.message)
    }
}

connectDB()

module.exports = mongoose;