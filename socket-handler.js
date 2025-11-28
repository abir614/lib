/**
 * socket-handler.js
 * Manages all Socket.IO communication
 */

const SocketHandler = {
    socket: null,

    /**
     * Initialize socket connection
     */
    init(socketInstance) {
        this.socket = socketInstance;
        this.registerListeners();
        return this;
    },

    /**
     * Register all socket event listeners
     */
    registerListeners() {
        this.socket.on('connect', this.onConnect.bind(this));
        this.socket.on('disconnect', this.onDisconnect.bind(this));
        this.socket.on('connectionError', this.onConnectionError.bind(this));
        this.socket.on('error', this.onError.bind(this));
        this.socket.on('joinError', this.onJoinError.bind(this));
        this.socket.on('joinConfirmed', this.onJoinConfirmed.bind(this));
        this.socket.on('userPublicKey', this.onUserPublicKey.bind(this));
        this.socket.on('roomPublicKeys', this.onRoomPublicKeys.bind(this));
        this.socket.on('previousMessages', this.onPreviousMessages.bind(this));
        this.socket.on('chatMessage', this.onChatMessage.bind(this));
        this.socket.on('updateActiveUsers', this.onUpdateActiveUsers.bind(this));
        this.socket.on('messageStatusUpdate', this.onMessageStatusUpdate.bind(this));
        this.socket.on('messageSeen', this.onMessageSeen.bind(this));
        this.socket.on('typing', this.onTyping.bind(this));
        this.socket.on('stopTyping', this.onStopTyping.bind(this));
    },

    /**
     * Event: Connected to server
     */
    onConnect() {
        console.log("Connected to server with ID:", this.socket.id);

        if (this.onConnectionChange) {
            this.onConnectionChange(true);
        }

        // Auto-rejoin if we have saved state
        if (this.onReconnect) {
            this.onReconnect();
        }
    },

    /**
     * Event: Disconnected from server
     */
    onDisconnect(reason) {
        console.log("Disconnected from server:", reason);

        if (this.onConnectionChange) {
            this.onConnectionChange(false);
        }
    },

    /**
     * Event: Connection error
     */
    onConnectionError({ message }) {
        console.error("Connection error:", message);

        if (this.onErrorReceived) {
            this.onErrorReceived("Connection error: " + message);
        }
    },

    /**
     * Event: Server error
     */
    onError(message) {
        console.error("Server Error:", message);

        if (this.onErrorReceived) {
            this.onErrorReceived("Server Error: " + message);
        }
    },

    /**
     * Event: Join error (e.g., duplicate user)
     */
    onJoinError(message) {
        console.log("Join error:", message);

        if (this.onJoinFailed) {
            this.onJoinFailed(message);
        }
    },

    /**
     * Event: Join confirmed
     */
    async onJoinConfirmed({ username, roomId, users }) {
        console.log("Join confirmed:", roomId);

        if (this.onJoinSuccess) {
            await this.onJoinSuccess({ username, roomId, users });
        }
    },

    /**
     * Event: Received user's public key
     */
    async onUserPublicKey({ username, publicKey }) {
        console.log(`E2EE: Received public key from ${username}`);

        if (this.onPublicKeyReceived) {
            await this.onPublicKeyReceived(username, publicKey);
        }
    },

    /**
     * Event: Received room public keys
     */
    async onRoomPublicKeys(publicKeys) {
        console.log(`E2EE: Received ${Object.keys(publicKeys).length} public keys`);

        if (this.onRoomKeysReceived) {
            await this.onRoomKeysReceived(publicKeys);
        }
    },

    /**
     * Event: Previous messages loaded
     */
    async onPreviousMessages(messages) {
        console.log(`Received ${messages.length} previous messages`);

        if (this.onHistoryReceived) {
            await this.onHistoryReceived(messages);
        }
    },

    /**
     * Event: New chat message
     */
    async onChatMessage(data) {
        if (this.onMessageReceived) {
            await this.onMessageReceived(data);
        }
    },

    /**
     * Event: Active users updated
     */
    onUpdateActiveUsers(users) {
        if (this.onUsersUpdated) {
            this.onUsersUpdated(users);
        }
    },

    /**
     * Event: Message status updated
     */
    onMessageStatusUpdate(data) {
        if (this.onMessageStatusChanged) {
            this.onMessageStatusChanged(data);
        }
    },

    /**
     * Event: Message seen
     */
    onMessageSeen(data) {
        if (this.onMessageSeenUpdate) {
            this.onMessageSeenUpdate(data);
        }
    },

    /**
     * Event: User is typing
     */
    onTyping(username) {
        if (this.onUserTyping) {
            this.onUserTyping(username);
        }
    },

    /**
     * Event: User stopped typing
     */
    onStopTyping(username) {
        if (this.onUserStoppedTyping) {
            this.onUserStoppedTyping(username);
        }
    },

    /**
     * Emit: Join room
     */
    joinRoom(token, roomId, integrityToken, integrityScore) {
        this.socket.emit('joinRoom', {
            token,
            roomId,
            integrityToken,
            integrityScore
        });
    },

    /**
     * Emit: Share public key
     */
    sharePublicKey(roomId, publicKey) {
        this.socket.emit('sharePublicKey', { roomId, publicKey });
    },

    /**
     * Emit: Send chat message
     */
    sendMessage(roomId, encryptedData) {
        this.socket.emit('chatMessage', { roomId, encryptedData });
    },

    /**
     * Emit: Typing indicator
     */
    typing(roomId) {
        this.socket.emit('typing', roomId);
    },

    /**
     * Emit: Stop typing indicator
     */
    stopTyping(roomId) {
        this.socket.emit('stopTyping', roomId);
    },

    /**
     * Emit: Mark messages as seen
     */
    markAllSeen(roomId) {
        this.socket.emit('markAllSeen', { roomId });
    },

    /**
     * Emit: Leave room
     */
    leaveRoom() {
        this.socket.emit('leaveRoom');
    },

    /**
     * Check if socket is connected
     */
    isConnected() {
        return this.socket && this.socket.connected;
    },

    /**
     * Get socket ID
     */
    getSocketId() {
        return this.socket ? this.socket.id : null;
    }
};

// Export for use in other modules
if (typeof module !== "undefined") {
    module.exports = SocketHandler;
}
if (typeof window !== "undefined") {
    window.SocketHandler = SocketHandler;
}
