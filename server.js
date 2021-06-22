const express = require('express')
const port = process.env.PORT || 3000
const { users, userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/user')
const { createRoom, getRoom } = require('./utils/room')

var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var v4 = require('uuid');

var words = ["Baum", "Haus", "Mensch"]
var word = ""

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

		const user = userJoin(socket.id, name, room, isAdmin, false)
		socket.join(user.room)

		socket.emit('joined', user);

		io.to(user.room).emit('roomUsers',
			getRoomUsers(user.room)
		);
	});

	socket.on('start', ({ user }) => {
		if (user.isAdmin) {
			io.to(user.room).emit('started', true);


			io.to(user.id).emit('choose', words)
		}
	});

	socket.on('send', message => {
		const user = getCurrentUser(socket.id);

		if (message == word) {
			message = `has guest the right word. It was ${message} `
			io.to(user.room).emit('erase');
			io.to(user.room).emit('message',
				{ user, message }
			);
			io.to(user.id).emit('choose', words)
			io.to(user.room).emit('guessed');
		}
		else {
			io.to(user.room).emit('message', { user, message });
		}

	});

	socket.on('choosed', (data) => {
		word = data;
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

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getIndex(oldindex, user) {
	let index = 0;
	do {
		index = getRandomInt(0, users.filter(u => u.draw == false && u.room == user.room).length)

	} while (index == oldindex);
	return index;
}