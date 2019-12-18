const io = require('socket.io-client')

class GameListener {
    constructor (name, gameNumber) {
        this.socket = io.connect('http://localhost:8080')
        //this.socket.emit('hostGame', 3)
        this.socket.emit('joinGame', {name: 'JP', gameNumber: gameNumber})
    }

    addEvents () {
        this.socket.on('clock', function(message) {
            console.log(message)
            //  Automatic client answer
            if(message === 3) {
                this.emit('answer', 3000)
            }
        })
        this.socket.on('GameStart', function(message) {
            console.log('game started!')
        })
        this.socket.on('RoundStart', function() {
            this.emit('ready')
        })
    }
}

const g = new GameListener('Jean', 3)
g.addEvents()
//module.exports = { GameListener }