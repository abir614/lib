/**
 * ui-manager.js
 * Handles all UI updates and DOM manipulations
 */

const UIManager = {
    elements: {},

    /**
     * Initialize and cache DOM elements
     */
    init() {
        this.elements = {
            // Login screen
            loginContainer: document.querySelector('.login-container'),
            usernameInput: document.getElementById('username'),
            roomIdInput: document.getElementById('roomId'),
            joinButton: document.getElementById('join'),
            statusDot: document.querySelector('.connection-status .status-dot'),
            statusText: document.querySelector('.connection-status .status-text'),

            // Chat screen
            chatContainer: document.getElementById('chat-container'),
            messagesContainer: document.getElementById('messages'),
            messageInput: document.getElementById('message'),
            sendButton: document.getElementById('send'),
            backButton: document.getElementById('back-button'),
            downloadButton: document.getElementById('download-history-button'),

            // Header
            roomDisplay: document.getElementById('room-display'),
            activeUsers: document.getElementById('active-users'),

            // Input area
            imageUpload: document.getElementById('imageUpload'),
            charCount: document.getElementById('char-count'),
            typingIndicator: document.getElementById('typing-indicator'),
            loadingIndicator: document.getElementById('loading-indicator')
        };

        return this.elements;
    },

    /**
     * Show notification
     */
    showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        const formattedMessage = message.replace(/\*\*(.*?)\*\*/g, '<b><i>$1</i></b>');
        notification.innerHTML = formattedMessage;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === "error" ? "#dc3545" : "#28a745"};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    /**
     * Update connection status indicator
     */
    updateConnectionStatus(isConnected, canJoin = false) {
        const { statusDot, statusText, joinButton } = this.elements;

        if (isConnected) {
            if (statusDot) statusDot.className = "status-dot connected";
            if (statusText) statusText.textContent = "Connected";

            if (joinButton) {
                if (canJoin) {
                    joinButton.disabled = false;
                    joinButton.innerHTML = '<span>Join Chat</span><i class="fas fa-arrow-right"></i>';
                } else {
                    joinButton.disabled = true;
                    joinButton.textContent = "Enter Data";
                }
            }
        } else {
            if (statusDot) statusDot.className = "status-dot";
            if (statusText) statusText.textContent = "Connecting...";

            if (joinButton) {
                joinButton.disabled = true;
                joinButton.textContent = "Connecting...";
            }
        }
    },

    /**
     * Reset join button state
     */
    resetJoinButton() {
        const { joinButton } = this.elements;
        if (joinButton) {
            joinButton.disabled = false;
            joinButton.innerHTML = '<span>Join Chat</span><i class="fas fa-arrow-right"></i>';
        }
    },

    /**
     * Set join button loading state
     */
    setJoinButtonLoading(text = "Joining...") {
        const { joinButton } = this.elements;
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        }
    },

    /**
     * Switch to chat view
     */
    showChatView(roomId) {
        const { loginContainer, chatContainer, roomDisplay } = this.elements;

        if (roomDisplay) {
            roomDisplay.textContent = this.sanitizeInput(roomId);
        }

        if (loginContainer) loginContainer.style.display = 'none';
        if (chatContainer) chatContainer.style.display = 'flex';
    },

    /**
     * Switch to login view
     */
    showLoginView() {
        const { loginContainer, chatContainer, usernameInput, roomIdInput } = this.elements;

        if (loginContainer) loginContainer.style.display = 'flex';
        if (chatContainer) chatContainer.style.display = 'none';

        if (usernameInput) usernameInput.value = '';
        if (roomIdInput) roomIdInput.value = '';
    },

    /**
     * Update active users display
     */
    updateActiveUsers(currentUser, otherUsers, totalCount) {
        const { activeUsers } = this.elements;
        if (!activeUsers) return;

        const count = otherUsers.length;
        let text;

        if (count === 0) {
            text = "You are alone in the room";
        } else if (count === 1) {
            text = `Active: ${this.sanitizeInput(otherUsers[0])}`;
        } else if (count <= 3) {
            text = `Active: ${otherUsers.map(u => this.sanitizeInput(u)).join(', ')}`;
        } else {
            text = `${count} active users`;
        }

        activeUsers.textContent = text;
    },

    /**
     * Update typing indicator
     */
    updateTypingIndicator(typingUsers) {
        const { typingIndicator } = this.elements;
        if (!typingIndicator) return;

        if (typingUsers.length === 0) {
            typingIndicator.style.display = 'none';
            typingIndicator.innerHTML = '';
        } else {
            let text;
            if (typingUsers.length === 1) {
                text = `${this.sanitizeInput(typingUsers[0])} is typing`;
            } else if (typingUsers.length === 2) {
                text = `${this.sanitizeInput(typingUsers[0])} and ${this.sanitizeInput(typingUsers[1])} are typing`;
            } else {
                text = `${typingUsers.length} users are typing`;
            }

            typingIndicator.innerHTML = `${text}<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;
            typingIndicator.style.display = 'flex';
        }
    },

    /**
     * Update character count display
     */
    updateCharCount(currentLength, maxLength) {
        const { charCount, sendButton, messageInput } = this.elements;

        if (charCount) {
            charCount.textContent = `${currentLength}/${maxLength}`;

            if (currentLength > maxLength) {
                charCount.style.color = "var(--error-color)";
            } else {
                charCount.style.color = "var(--text-muted)";
            }
        }

        if (sendButton && messageInput) {
            const isValid = currentLength > 0 && currentLength <= maxLength;
            sendButton.disabled = !isValid;
        }
    },

    /**
     * Update send button state
     */
    updateSendButton(enabled, hasImage = false) {
        const { sendButton } = this.elements;
        if (sendButton) {
            sendButton.disabled = !(enabled || hasImage);
        }
    },

    /**
     * Set send button loading state
     */
    setSendButtonLoading(isLoading) {
        const { sendButton } = this.elements;
        if (!sendButton) return;

        if (isLoading) {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else {
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    },

    /**
     * Update message input for image upload
     */
    updateInputForImage(filename) {
        const { messageInput } = this.elements;
        if (messageInput) {
            messageInput.placeholder = `Image selected: ${filename}. Add caption or send.`;
            messageInput.disabled = true;
        }
    },

    /**
     * Reset message input
     */
    resetMessageInput() {
        const { messageInput, imageUpload } = this.elements;

        if (messageInput) {
            messageInput.value = '';
            messageInput.placeholder = 'Type a message...';
            messageInput.disabled = false;
        }

        if (imageUpload) {
            imageUpload.value = '';
        }
    },

    /**
     * Show/hide loading indicator
     */
    setLoadingIndicator(visible) {
        const { loadingIndicator } = this.elements;
        if (loadingIndicator) {
            if (visible) {
                loadingIndicator.classList.remove('hidden');
            } else {
                loadingIndicator.classList.add('hidden');
            }
        }
    },

    /**
     * Validate input fields and update UI
     */
    validateInputs(isUsernameValid, isRoomIdValid) {
        const { usernameInput, roomIdInput } = this.elements;

        if (usernameInput) {
            usernameInput.style.borderColor = isUsernameValid ? "" : "#dc3545";
        }

        if (roomIdInput) {
            roomIdInput.style.borderColor = isRoomIdValid ? "" : "#dc3545";
        }
    },

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        const { messagesContainer } = this.elements;
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },

    /**
     * Check if scrolled to bottom or near
     */
    isScrolledToBottomOrNear(tolerance = 100) {
        const { messagesContainer } = this.elements;
        if (!messagesContainer) return true;

        return messagesContainer.scrollHeight - messagesContainer.clientHeight
               <= messagesContainer.scrollTop + tolerance;
    },

    /**
     * Clear messages container
     */
    clearMessages() {
        const { messagesContainer, loadingIndicator } = this.elements;
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            if (loadingIndicator) {
                messagesContainer.appendChild(loadingIndicator);
            }
        }
    },

    /**
     * Add message element to container
     */
    appendMessage(messageElement) {
        const { messagesContainer } = this.elements;
        if (messagesContainer) {
            const welcomeMsg = messagesContainer.querySelector('.welcome-message');
            if (welcomeMsg) welcomeMsg.remove();

            messagesContainer.appendChild(messageElement);
        }
    },

    /**
     * Prepend message element (for loading older messages)
     */
    prependMessage(messageElement) {
        const { messagesContainer, loadingIndicator } = this.elements;
        if (messagesContainer) {
            const firstMessage = messagesContainer.querySelector('.message');
            if (firstMessage) {
                messagesContainer.insertBefore(messageElement, firstMessage);
            } else if (loadingIndicator) {
                messagesContainer.insertBefore(messageElement, loadingIndicator.nextSibling);
            } else {
                messagesContainer.appendChild(messageElement);
            }
        }
    },

    /**
     * Get scroll height (for maintaining scroll position)
     */
    getScrollHeight() {
        const { messagesContainer } = this.elements;
        return messagesContainer ? messagesContainer.scrollHeight : 0;
    },

    /**
     * Set scroll position
     */
    setScrollTop(position) {
        const { messagesContainer } = this.elements;
        if (messagesContainer) {
            messagesContainer.scrollTop = position;
        }
    },

    /**
     * Sanitize input for display
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Set viewport height CSS variable
     */
    setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
};

// Export for use in other modules
if (typeof module !== "undefined") {
    module.exports = UIManager;
}
if (typeof window !== "undefined") {
    window.UIManager = UIManager;
}
