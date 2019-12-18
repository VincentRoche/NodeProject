const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const fs = require('fs')
// Chargement de socket.io
const server = require('http').createServer(app)
const { GamesHandler } = require('./game.js')
const game = new GamesHandler(server)

app.use(morgan('tiny'))
app.use(cors())
app.use(bodyParser.json())
 
app.get('/', (req, res) => {
    res.json({
        message: 'Behold The MEVN Stack!'
    })
})

function getFileName (name) {
    const types = ['.jpg', '.png', '.jpeg', '.bmp']
    for (type of types) {
        if (fs.existsSync('./productPictures/' + name + type)) {
            return name + type
        }
    }
    return -1
}

app.use(express.static(__dirname+'/productPictures'))

app.get('/socket', (req, res) => {
    res.json(game.getHostNumber())
})

const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`listening on ${port}`)
})