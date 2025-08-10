require('dotenv').config()
const express = require('express')
const cookie = require('cookie-parser')
const path = require('path')
const cluster = require('cluster')
const os = require('os')
const totalCPUs = os.cpus().length;
const port = process.env.PORT;
const miniyHTML = require('express-minify-html-terser')
const compression = require('compression')

if (cluster.isPrimary) {
    for (let i = 0; i < totalCPUs; i++) cluster.fork()
    cluster.fork().on('online', () => console.log(`worker online`))
} else {
    const app = express()
    const adminRoutes = require('./routes/admin.routes')
    const siteRoutes = require('./routes/site.routes')
    // Use Cookie parser to send cookie
    app.use(cookie())
    app.use(compression(
        {
            level: 4, // compression level
            threshold: 0, // Compress all
            memLevel: 9, // memory usuage
            filter: (req, res) => compression.filter(req, res)
        }
    ))

    // TO Pass json Data
    app.use(express.json())
    app.use(express.urlencoded({ extended: false }))

    app.use(miniyHTML({
        override: true,
        htmlMinifier: {
            removeComments: true,
            collapseWhitespace: true,
            collapseBooleanAttributes: true,
            removeAttributeQuotes: true,
            removeEmptyAttributes: true,
            minifyJS: true
        }
    }))

    // Serve static files from the "public" directory
    app.use(express.static(path.join(__dirname, 'public')))

    // Serve uploads img to frontend
    app.use('/uploads', express.static('uploads'))
    app.use('/images', express.static('images'))

    // Setup View ENgine To Excute EJS File
    app.set('views', path.join(__dirname, 'views'))
    app.set('view engine', 'ejs')


    app.use('/admin', adminRoutes)
    app.use('/', siteRoutes)

    app.listen(port, console.log(`http://localhost:${port}/admin/login`))
}