/**
 * ui-controller.js
 * Handles UI business logic and coordinates between ViewManager and state
 * NO direct DOM manipulation - delegates to ViewManager
 */

const UIController = {

    /**
     * Update connection status display
     */
    updateConnectionStatus(isConnected, canJoin) {
        if (isConnected) {
            ViewManager.showConnected();
            canJoin ? ViewManager.enableJoinButton() : ViewManager.disableJoinButton();
        } else {
            ViewManager.showConnecting();
            ViewManager.disableJoinButton("Connecting...");
        }
    },

    /**
     * Validate and update input fields
     */
    validateInputs(username, roomId) {
        const usernameValid = Validators.validateUsername(username);
        const roomIdValid = Validators.validateRoomId(roomId);

        if (usernameValid) {
            ViewManager.markInputValid(ViewManager.elements.usernameInput);
        } else {
            ViewManager.markInputInvalid(ViewManager.elements.usernameInput);
        }

        if (roomIdValid) {
            ViewManager.markInputValid(ViewManager.elements.roomIdInput);
        } else {
            ViewManager.markInputInvalid(ViewManager.elements.roomIdInput);
        }

        return usernameValid && roomIdValid;
    },

    /**
     * Update character count and send button state
     */
    updateCharCount(current, max, hasImage = false) {
        ViewManager.updateCharCount(current, max);

        const isValid = current > 0 && current <= max;
        if (isValid || hasImage) {
            ViewManager.enableSendButton();
        } else {
            ViewManager.disableSendButton();
        }
    },

    /**
     * Update active users display with formatting
     */
    updateActiveUsers(currentUser, otherUsers) {
        const count = otherUsers.length;
        let text;

        if (count === 0) {
            text = "You are alone in the room";
        } else if (count === 1) {
            text = `Active: ${ViewManager.sanitize(otherUsers[0])}`;
        } else if (count <= 3) {
            text = `Active: ${otherUsers.map(u => ViewManager.sanitize(u)).join(', ')}`;
        } else {
            text = `${count} active users`;
        }

        ViewManager.setActiveUsersText(text);
    },

    /**
     * Update typing indicator with formatted text
     */
    updateTypingIndicator(typingUsers) {
        if (typingUsers.length === 0) {
            ViewManager.hideTypingIndicator();
            return;
        }

        let text;
        if (typingUsers.length === 1) {
            text = `${ViewManager.sanitize(typingUsers[0])} is typing`;
        } else if (typingUsers.length === 2) {
            text = `${ViewManager.sanitize(typingUsers[0])} and ${ViewManager.sanitize(typingUsers[1])} are typing`;
        } else {
            text = `${typingUsers.length} users are typing`;
        }

        ViewManager.showTypingIndicator(text);
    },

    /**
     * Handle image upload in UI
     */
    handleImageSelection(filename) {
        ViewManager.setImageUploadMode(filename);
        ViewManager.enableSendButton();
    },

    /**
     * Reset message input to normal state
     */
    resetMessageInput() {
        ViewManager.clearMessageInput();
        ViewManager.clearImageUpload();
        ViewManager.setSendButtonNormal();
    },

    /**
     * Show message in container (with welcome message logic)
     */
    displayMessage(messageElement, shouldHideWelcome = true) {
        if (shouldHideWelcome) {
            ViewManager.hideWelcome();
        }
        ViewManager.appendMessage(messageElement);
    },

    /**
     * Clear messages and show welcome
     */
    clearMessages() {
        ViewManager.clearAllMessages();
        ViewManager.showWelcome();
    },

    /**
     * Handle new message arrival (hide welcome if shown)
     */
    onMessageReceived(messageElement) {
        ViewManager.hideWelcome();
        ViewManager.appendMessage(messageElement);

        if (ViewManager.isNearBottom()) {
            ViewManager.scrollToBottom();
        }
    },

    /**
     * Handle history loaded
     */
    onHistoryLoaded(messages, messageElements) {
        ViewManager.clearAllMessages();

        if (messages.length === 0) {
            ViewManager.showWelcome();
        } else {
            ViewManager.hideWelcome();
            messageElements.forEach(el => ViewManager.appendMessage(el));
        }

        ViewManager.scrollToBottom();
    },

    /**
     * Show notification
     */
    notify(message, type = "info") {
        ViewManager.showToast(message, type);
    }
};

if (typeof window !== "undefined") window.UIController = UIController;
if (typeof module !== "undefined") module.exports = UIController;
