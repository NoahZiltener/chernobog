const express = require('express')
const port = process.env.PORT || 3000
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
const { createRoom } = require('./utils/room')

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var v4 = require('uuid');

app.use(express.static(__dirname + '/dist'))
app.get(/.*/, (req, res) => {
	res.sendFile(__dirname + '/dist/index.html')
})

http.listen(port, () => {
	console.log(`Listening on port ${port}`)
})

io.on('connection', (socket) => {
	console.log(`Client ${socket.id} connected to the server.`)

	socket.on('join', ({ name, room }) => {
		let isAdmin = false
		if (room == undefined) {
			room = v4();
			isAdmin = true;
		}

		const user = userJoin(socket.id, name, room, isAdmin)
		socket.join(user.room)
		createRoom(user.room, 0);

		socket.emit('joined', user);

		io.to(user.room).emit('roomUsers',
			getRoomUsers(user.room)
		);
	});

	socket.on('start', ({ user }) => {
		if (user.isAdmin) {
			io.to(user.room).emit('started', true);
		}
	});

	socket.on('send', message => {
		const user = getCurrentUser(socket.id);

		io.to(user.room).emit('message', { user, message });
	});

	socket.on('drawing', (data) => {
		const user = getCurrentUser(socket.id);
		socket.to(user.room).broadcast.emit('drawing', data)
	});

	socket.on('started', (data) => {
		const user = getCurrentUser(socket.id);
		socket.to(user.room).broadcast.emit('started', data)
	});

	socket.on('stoped', (data) => {
		const user = getCurrentUser(socket.id);
		socket.to(user.room).broadcast.emit('stoped', data)
	});

	socket.on('disconnect', () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit('roomUsers',
				getRoomUsers(user.room)
			);
		}
	});
})