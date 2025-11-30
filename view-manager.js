/**
 * view-manager.js
 * Handles ONLY DOM manipulation and view updates
 * NO business logic, NO state management
 */

const ViewManager = {
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
            loadingIndicator: document.getElementById('loading-indicator'),

            // Welcome message
            welcomeMessage: document.querySelector('.welcome-message')
        };

        return this.elements;
    },

    // ==================== VIEW SWITCHING ====================

    showLoginView() {
        const { loginContainer, chatContainer, usernameInput, roomIdInput } = this.elements;

        if (loginContainer) loginContainer.style.display = 'flex';
        if (chatContainer) chatContainer.style.display = 'none';
        if (usernameInput) usernameInput.value = '';
        if (roomIdInput) roomIdInput.value = '';
    },

    showChatView(roomId) {
        const { loginContainer, chatContainer, roomDisplay } = this.elements;

        if (roomDisplay) roomDisplay.textContent = this.sanitize(roomId);
        if (loginContainer) loginContainer.style.display = 'none';
        if (chatContainer) chatContainer.style.display = 'flex';
    },

    // ==================== CONNECTION STATUS ====================

    showConnected() {
        const { statusDot, statusText } = this.elements;
        if (statusDot) statusDot.className = "status-dot connected";
        if (statusText) statusText.textContent = "Connected";
    },

    showConnecting() {
        const { statusDot, statusText } = this.elements;
        if (statusDot) statusDot.className = "status-dot";
        if (statusText) statusText.textContent = "Connecting...";
    },

    // ==================== BUTTON STATES ====================

    enableJoinButton() {
        const { joinButton } = this.elements;
        if (joinButton) {
            joinButton.disabled = false;
            joinButton.innerHTML = '<span>Join Chat</span><i class="fas fa-arrow-right"></i>';
        }
    },

    disableJoinButton(text = "Enter Data") {
        const { joinButton } = this.elements;
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.textContent = text;
        }
    },

    setJoinButtonLoading(text = "Joining...") {
        const { joinButton } = this.elements;
        if (joinButton) {
            joinButton.disabled = true;
            joinButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        }
    },

    enableSendButton() {
        const { sendButton } = this.elements;
        if (sendButton) sendButton.disabled = false;
    },

    disableSendButton() {
        const { sendButton } = this.elements;
        if (sendButton) sendButton.disabled = true;
    },

    setSendButtonLoading() {
        const { sendButton } = this.elements;
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }
    },

    setSendButtonNormal() {
        const { sendButton } = this.elements;
        if (sendButton) {
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        }
    },

    // ==================== INPUT VALIDATION DISPLAY ====================

    markInputValid(inputElement) {
        if (inputElement) inputElement.style.borderColor = "";
    },

    markInputInvalid(inputElement) {
        if (inputElement) inputElement.style.borderColor = "#dc3545";
    },

    // ==================== MESSAGE INPUT ====================

    clearMessageInput() {
        const { messageInput } = this.elements;
        if (messageInput) {
            messageInput.value = '';
            messageInput.placeholder = 'Type a message...';
            messageInput.disabled = false;
        }
    },

    setImageUploadMode(filename) {
        const { messageInput } = this.elements;
        if (messageInput) {
            messageInput.placeholder = `Image selected: ${filename}. Add caption or send.`;
            messageInput.disabled = true;
        }
    },

    clearImageUpload() {
        const { imageUpload } = this.elements;
        if (imageUpload) imageUpload.value = '';
    },

    // ==================== CHAR COUNT ====================

    updateCharCount(current, max) {
        const { charCount } = this.elements;
        if (!charCount) return;

        charCount.textContent = `${current}/${max}`;
        charCount.style.color = current > max ? "var(--error-color)" : "var(--text-muted)";
    },

    // ==================== ACTIVE USERS ====================

    setActiveUsersText(text) {
        const { activeUsers } = this.elements;
        if (activeUsers) activeUsers.textContent = text;
    },

    // ==================== TYPING INDICATOR ====================

    showTypingIndicator(text) {
        const { typingIndicator } = this.elements;
        if (!typingIndicator) return;

        typingIndicator.innerHTML = `${text}<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;
        typingIndicator.style.display = 'flex';
    },

    hideTypingIndicator() {
        const { typingIndicator } = this.elements;
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
            typingIndicator.innerHTML = '';
        }
    },

    // ==================== WELCOME MESSAGE ====================

    showWelcome() {
        const { welcomeMessage } = this.elements;
        if (welcomeMessage) welcomeMessage.style.display = 'flex';
    },

    hideWelcome() {
        const { welcomeMessage } = this.elements;
        if (welcomeMessage) welcomeMessage.style.display = 'none';
    },

    // ==================== MESSAGES CONTAINER ====================

    clearAllMessages() {
        const { messagesContainer, loadingIndicator, welcomeMessage } = this.elements;
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        if (loadingIndicator) messagesContainer.appendChild(loadingIndicator);
        if (welcomeMessage) messagesContainer.appendChild(welcomeMessage);
    },

    appendMessage(messageElement) {
        const { messagesContainer } = this.elements;
        if (messagesContainer) messagesContainer.appendChild(messageElement);
    },

    prependMessage(messageElement) {
        const { messagesContainer, loadingIndicator } = this.elements;
        if (!messagesContainer) return;

        const firstMessage = messagesContainer.querySelector('.message');
        if (firstMessage) {
            messagesContainer.insertBefore(messageElement, firstMessage);
        } else if (loadingIndicator) {
            messagesContainer.insertBefore(messageElement, loadingIndicator.nextSibling);
        } else {
            messagesContainer.appendChild(messageElement);
        }
    },

    // ==================== LOADING INDICATOR ====================

    showLoadingIndicator() {
        const { loadingIndicator } = this.elements;
        if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    },

    hideLoadingIndicator() {
        const { loadingIndicator } = this.elements;
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    },

    // ==================== SCROLLING ====================

    scrollToBottom() {
        const { messagesContainer } = this.elements;
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },

    isNearBottom(tolerance = 100) {
        const { messagesContainer } = this.elements;
        if (!messagesContainer) return true;

        return messagesContainer.scrollHeight - messagesContainer.clientHeight
            <= messagesContainer.scrollTop + tolerance;
    },

    getScrollHeight() {
        const { messagesContainer } = this.elements;
        return messagesContainer ? messagesContainer.scrollHeight : 0;
    },

    setScrollTop(position) {
        const { messagesContainer } = this.elements;
        if (messagesContainer) messagesContainer.scrollTop = position;
    },

    // ==================== NOTIFICATIONS ====================

    showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `notification ${type}`;
        toast.innerHTML = message.replace(/\*\*(.*?)\*\*/g, '<b><i>$1</i></b>');
        toast.style.cssText = `
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
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = "slideOut 0.3s ease";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ==================== UTILITIES ====================

    sanitize(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty("--vh", `${vh}px`);
    }
};

if (typeof window !== "undefined") window.ViewManager = ViewManager;
if (typeof module !== "undefined") module.exports = ViewManager;
