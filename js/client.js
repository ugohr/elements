class Client {

    constructor() {
        this.socket = io()
        this.socketId = ''
        this.isPlaying = false
        this.preload()
    }

    preload() {

        this.socket.on('connect', () => {
            this.socketId = this.socket.id
        })

    }

    /**
     * Create a new room
     */
    createNewRoom() {
        room = new Room()
        this.socket.emit('hostCreateNewRoom', {username: document.getElementById('username').value})
    }

    /**
     * Join existing room by code
     */
    joinRoomByCode() {
        if (!room)
            room = new Room()
        let username = document.getElementById('username').value
        let gameId = document.getElementById('privateCode').value
        document.getElementById('roomCode').innerHTML = gameId
        this.socket.emit('joinRoomByCode', {gameId: gameId, username: username})
    }
}