/**
 * message-display.js
 * Complete message rendering system - includes all features from message-renderer.js
 * Handles ONLY message DOM creation and rendering - NO state management
 */

const MessageDisplay = {

    /**
     * Create a complete message element
     */
    createMessageElement(username, message, isCurrentUser, timestamp, imageUrl, messageId, seenStatus = false, userColor = null) {
        const messageElement = document.createElement("div");
        messageElement.className = isCurrentUser ? "message user" : "message receiver";

        if (messageId) {
            messageElement.dataset.messageId = messageId;
        }

        const contentElement = document.createElement("div");
        contentElement.className = "message-content";

        // Handle non-current user styling
        if (!isCurrentUser) {
            // Apply color based on room size and user color
            if (StateManager.totalRoomUsers === 2) {
                messageElement.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            } else if (userColor) {
                messageElement.style.background = userColor;
            }

            // Add username
            const usernameElement = document.createElement("span");
            usernameElement.className = "message-username";
            usernameElement.textContent = this.sanitize(username);
            contentElement.appendChild(usernameElement);
        } else {
            // Apply color for current user in group chats
            if (StateManager.totalRoomUsers > 2) {
                const senderColor = StateManager.assignUserColor(username);
                messageElement.style.background = senderColor;
            }
        }

        // Add image or text content
        if (imageUrl) {
            const imgElement = this.createImageElement(imageUrl);
            contentElement.appendChild(imgElement);
        } else if (message) {
            const messageText = this.createTextElement(message);
            contentElement.appendChild(messageText);
        }

        // Add footer with timestamp and seen status
        if (timestamp) {
            const footer = this.createMessageFooter(timestamp, isCurrentUser, seenStatus);
            contentElement.appendChild(footer);
            messageElement.dataset.timestamp = timestamp;
        }

        messageElement.appendChild(contentElement);
        return messageElement;
    },

    /**
     * Create image element
     */
    createImageElement(imageUrl) {
        const imgElement = document.createElement("img");
        imgElement.src = this.sanitize(imageUrl);
        imgElement.alt = "User uploaded image";
        imgElement.style.cssText = "max-width: 100%; max-height: 300px; border-radius: 12px; cursor: pointer; margin: 5px 0;";
        imgElement.onclick = () => window.open(imageUrl, "_blank");
        return imgElement;
    },

    /**
     * Create text element
     */
    createTextElement(message) {
        const messageText = document.createElement("div");
        messageText.className = "message-text";
        messageText.style.cssText = "word-wrap: break-word; white-space: pre-wrap;";
        messageText.textContent = message;
        return messageText;
    },

    /**
     * Create message footer with timestamp and seen status
     */
    createMessageFooter(timestamp, isCurrentUser, seenStatus) {
        const messageFooter = document.createElement("div");
        messageFooter.className = "message-footer";
        messageFooter.style.cssText = 'display: flex; justify-content: flex-end; align-items: center; gap: 10px; margin-top: 5px;';

        const timeElement = document.createElement("span");
        timeElement.className = "message-time";
        timeElement.textContent = this.formatTimestamp(timestamp);

        // Add seen indicator for current user's messages
        if (isCurrentUser && seenStatus) {
            const seenElement = document.createElement('i');
            seenElement.className = 'fas fa-check-double seen-status';
            messageFooter.appendChild(seenElement);
        }

        messageFooter.appendChild(timeElement);
        return messageFooter;
    },

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        const messageDate = new Date(timestamp);
        const now = new Date();

        if (messageDate.toDateString() === now.toDateString()) {
            // Today - show time only
            return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (messageDate.getFullYear() === now.getFullYear()) {
            // This year - show month and day
            return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } else {
            // Different year - show full date
            return messageDate.toLocaleDateString();
        }
    },

    /**
     * Update seen status on a message
     * Handles both small room (1-on-1) and large room seen indicators
     */
    updateMessageSeenStatus(messageId, seenBy, currentUser, isSmallRoom) {
        const messageElement = document.querySelector(`.message[data-message-id='${messageId}']`);
        if (!messageElement) return;

        if (!isSmallRoom) {
            // Large room - show list of viewers
            const viewers = seenBy.filter(user => user !== currentUser);
            let statusElement = messageElement.querySelector('.message-status-text');

            if (viewers.length > 0) {
                const seenText = `Seen: ${viewers.join(', ')}`;

                if (!statusElement) {
                    const messageFooter = messageElement.querySelector('.message-footer');
                    if (!messageFooter) return;

                    statusElement = document.createElement('span');
                    statusElement.classList.add('message-status-text');
                    statusElement.style.cssText = 'font-size: 0.7rem; color: #FFFFFF;';

                    const timeElement = messageFooter.querySelector('.message-time');
                    if (timeElement) {
                        messageFooter.insertBefore(statusElement, timeElement);
                    } else {
                        messageFooter.appendChild(statusElement);
                    }
                }

                statusElement.textContent = seenText;

                // Remove double tick if present (replaced by text)
                const doubleTick = messageElement.querySelector('.seen-status');
                if (doubleTick) {
                    doubleTick.remove();
                    messageElement.classList.remove('seen');
                }
            } else if (statusElement) {
                statusElement.remove();
            }
        } else {
            // Small room (1-on-1) - show double tick
            const messageFooter = messageElement.querySelector('.message-footer');
            const existingSeenIcon = messageElement.querySelector('.seen-status');

            if (messageFooter && !existingSeenIcon && messageElement.classList.contains('user')) {
                const seenElement = document.createElement('i');
                seenElement.className = 'fas fa-check-double seen-status';
                messageFooter.insertBefore(seenElement, messageFooter.firstChild);
                messageElement.classList.add('seen');
            }
        }
    },

    /**
     * Clear all seen status indicators from messages
     */
    clearSeenStatus() {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

        messagesContainer.querySelectorAll('.message.user.seen').forEach((messageElement) => {
            messageElement.classList.remove('seen');
            const seenIcon = messageElement.querySelector('.seen-status');
            if (seenIcon) {
                seenIcon.remove();
            }
        });
    },

    /**
     * Update username visibility based on chat mode (1-on-1 vs group)
     */
    updateUsernameVisibility(isOneOnOne) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

        const allMessages = messagesContainer.querySelectorAll('.message.receiver');
        allMessages.forEach(messageEl => {
            const usernameEl = messageEl.querySelector('.message-username');
            if (usernameEl) {
                usernameEl.style.display = isOneOnOne ? 'none' : 'block';
            }
        });
    },

    /**
     * Create chat history for export
     * Returns array of message objects suitable for JSON export
     */
    createChatHistory(currentUser) {
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return null;

        const messageElements = messagesContainer.querySelectorAll('.message:not(.hidden)');
        const history = [];

        messageElements.forEach(el => {
            const usernameEl = el.querySelector('.message-username');
            const username = el.classList.contains('user')
            ? currentUser
            : (usernameEl?.textContent || 'Unknown User');

            const text = el.querySelector('.message-text')?.textContent || "";
            const timestamp = el.dataset.timestamp;
            const imageUrl = el.querySelector('img')?.src || "";
            const messageId = el.dataset.messageId;

            history.push({
                id: messageId,
                user: username,
                message: text,
                imageUrl: imageUrl,
                timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString()
            });
        });

        return history;
    },

    /**
     * Sanitize input to prevent XSS
     */
    sanitize(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};

// Export for both browser and Node.js environments
if (typeof module !== "undefined") {
    module.exports = MessageDisplay;
}

if (typeof window !== "undefined") {
    window.MessageDisplay = MessageDisplay;
}
