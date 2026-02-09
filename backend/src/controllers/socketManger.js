import { Server } from "socket.io"


let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });


    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED")

        socket.on("join-call", (path) => {
            console.log('=== USER JOINING CALL ===');
            console.log('path:', path);
            console.log('socket.id:', socket.id);
            console.log('connections before:', connections);

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date();

            console.log('connections after:', connections);
            console.log('users in room', path, ':', connections[path]);

            for (let a = 0; a < connections[path].length; a++) {
                console.log('📤 Emitting user-joined to:', connections[path][a]);
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if (messages[path] !== undefined) {
                console.log('📜 Loading previous messages for room:', path);
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            } else {
                console.log('📜 No previous messages for room:', path);
            }
            console.log('=== END USER JOINING CALL ===');
        })

        socket.on("check-host", (data) => {
            console.log('=== CHECK HOST REQUEST ===');
            console.log('roomId:', data.roomId);
            console.log('userId:', data.userId);
            console.log('connections:', connections);
            
            // Check if this is the first user in the room
            if (connections[data.roomId] && connections[data.roomId].length === 1) {
                console.log('👑 Assigning host to first user:', data.userId);
                socket.emit('host-assigned', { isHost: true });
                
                // Store host information
                if (!global.hosts) global.hosts = {};
                global.hosts[data.roomId] = data.userId;
            } else {
                console.log('👤 User is not host:', data.userId);
                socket.emit('host-assigned', { isHost: false });
            }
            console.log('=== END CHECK HOST ===');
        });

        socket.on("hand-raise", (data) => {
            console.log('=== HAND RAISE ===');
            console.log('userId:', data.userId);
            console.log('isRaised:', data.isRaised);
            
            // Find the room and broadcast to all participants
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && connections[matchingRoom]) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("hand-raise", data);
                });
            }
            console.log('=== END HAND RAISE ===');
        });

        socket.on("reaction", (emoji) => {
            console.log('=== REACTION ===');
            console.log('emoji:', emoji);
            console.log('socket.id:', socket.id);
            
            // Find the room and broadcast reaction
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && connections[matchingRoom]) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("reaction", emoji);
                });
            }
            console.log('=== END REACTION ===');
        });

        socket.on("recording-started", (data) => {
            console.log('=== RECORDING STARTED ===');
            console.log('userId:', data.userId);
            
            // Find the room and broadcast recording status
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && connections[matchingRoom]) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("recording-started", data);
                });
            }
            console.log('=== END RECORDING STARTED ===');
        });

        socket.on("recording-stopped", (data) => {
            console.log('=== RECORDING STOPPED ===');
            console.log('userId:', data.userId);
            
            // Find the room and broadcast recording status
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && connections[matchingRoom]) {
                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("recording-stopped", data);
                });
            }
            console.log('=== END RECORDING STOPPED ===');
        });

        socket.on("mute-participant", (data) => {
            console.log('=== MUTE PARTICIPANT ===');
            console.log('targetUserId:', data.targetUserId);
            console.log('hostId:', data.hostId);
            
            // Check if sender is host
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && global.hosts && global.hosts[matchingRoom] === data.hostId) {
                // Forward mute request to target user
                io.to(data.targetUserId).emit("mute-participant", data);
                console.log('✅ Mute request sent to:', data.targetUserId);
            } else {
                console.log('❌ Unauthorized mute attempt');
            }
            console.log('=== END MUTE PARTICIPANT ===');
        });

        socket.on("remove-participant", (data) => {
            console.log('=== REMOVE PARTICIPANT ===');
            console.log('targetUserId:', data.targetUserId);
            console.log('hostId:', data.hostId);
            
            // Check if sender is host
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && global.hosts && global.hosts[matchingRoom] === data.hostId) {
                // Forward remove request to target user
                io.to(data.targetUserId).emit("remove-participant", data);
                console.log('✅ Remove request sent to:', data.targetUserId);
            } else {
                console.log('❌ Unauthorized remove attempt');
            }
            console.log('=== END REMOVE PARTICIPANT ===');
        });

        socket.on("end-meeting", (data) => {
            console.log('=== END MEETING ===');
            console.log('hostId:', data.hostId);
            
            // Check if sender is host
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && global.hosts && global.hosts[matchingRoom] === data.hostId) {
                // End meeting for all participants
                if (connections[matchingRoom]) {
                    connections[matchingRoom].forEach((elem) => {
                        io.to(elem).emit("end-meeting");
                    });
                }
                console.log('✅ Meeting ended for all participants');
            } else {
                console.log('❌ Unauthorized end meeting attempt');
            }
            console.log('=== END END MEETING ===');
        });

        socket.on("typing", (data) => {
            console.log('=== TYPING INDICATOR ===');
            console.log('userId:', data.userId);
            console.log('username:', data.username);
            console.log('isTyping:', data.isTyping);
            
            // Find the room and broadcast typing status
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found && connections[matchingRoom]) {
                connections[matchingRoom].forEach((elem) => {
                    if (elem !== socket.id) { // Don't send back to sender
                        io.to(elem).emit("user-typing", data);
                    }
                });
            }
            console.log('=== END TYPING INDICATOR ===');
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            console.log('=== BACKEND CHAT MESSAGE RECEIVED ===');
            console.log('data:', data);
            console.log('sender:', sender);
            console.log('socket.id:', socket.id);
            console.log('connections:', connections);

            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            console.log('matchingRoom:', matchingRoom);
            console.log('found:', found);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("✅ Message stored in room", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    console.log('📤 Emitting to socket:', elem);
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            } else {
                console.log('❌ User not in any room, not broadcasting message');
            }
            console.log('=== END BACKEND CHAT MESSAGE ===');
        })

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)


                        if (connections[key].length === 0) {
                            delete connections[key]
                        }
                    }
                }

            }


        })


    })


    return io;
}

