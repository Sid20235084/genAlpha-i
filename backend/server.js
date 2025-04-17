import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import  generateResult  from './services/ai.service.js';

const port = process.env.PORT || 3000;
console.log(port);



const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

//socket.io auth middleware

io.use(async (socket, next) => {
    try {
        // Extract JWT token either from socket.auth or Authorization header(method 2 is for testing using postman)
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

        // Get projectId from the query string sent during handshake (e.g., ?projectId=abc123)
        const projectId = socket.handshake.query.projectId;

        // Validate if projectId is a valid MongoDB ObjectId format
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid projectId'));
        }

        // Fetch the project from the database and attach it to the socket for later use
        socket.project = await projectModel.findById(projectId);

        // If no token is provided, block the socket connection
        if (!token) {
            return next(new Error('Authentication error'));
        }

        // Verify the JWT token using the server's secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // If token verification fails (decoded is falsy), block the connection
        if (!decoded) {
            return next(new Error('Authentication error'));
        }

        // Attach decoded user data (e.g., id, email) to the socket object for future use
        socket.user = decoded;

        // Proceed with establishing the socket connection
        next();

    } catch (error) {
        // If any error occurs during the process, reject the socket connection
        next(error);
    }
});




// Listen for new socket connections
io.on('connection', socket => {
    console.log('A user connected');

    // Assign a roomId to this socket based on the connected project
    // Assuming `socket.project` is set somehow before this
    socket.roomId = socket.project._id.toString();

    // Join the user to a room (for scoped messaging per project)
    socket.join(socket.roomId);

    /**
     * Listen for "project-message" events from the client
     * This event contains messages from users, possibly including "@ai" for AI replies
     */
    socket.on('project-message', async data => {
        const message = data.message;

        // Check if the message includes "@ai"
        const aiIsPresentInMessage = message.includes('@ai');

        // Broadcast the original message to all *other* clients in the room
        socket.broadcast.to(socket.roomId).emit('project-message', data);

        // If the message requests an AI response
        if (aiIsPresentInMessage) {
            // Remove "@ai" from the message to get the actual prompt
            const prompt = message.replace('@ai', '').trim();

            // Generate the AI's response (assumes generateResult is an async function)
            const result = await generateResult(prompt);

            // Send the AI-generated message to *all* clients in the room
            io.to(socket.roomId).emit('project-message', {
                message: result,
                sender: {
                    _id: 'ai',     // Identifier for the AI
                    email: 'AI'    // Display name for the AI
                }
            });
        }
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
        console.log('User disconnected');
        socket.leave(socket.roomId); // Remove the user from the room
    });
});






server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})