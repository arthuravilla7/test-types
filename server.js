import app from './src/app.js'

const PORT = process.env.NODE_PORT


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})