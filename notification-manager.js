/**
 * notification-manager.js
 * Unified notification system - merges notification-ui-controller.js functionality
 * Handles ALL notification-related UI logic
 */

const NotificationManager = {
    elements: {},

    /**
     * Initialize notification UI
     */
    init() {
        this.elements = {
            settings: document.getElementById('notificationSettings'),
            toggle: document.getElementById('notificationToggle'),
            badge: document.getElementById('notificationBadge'),
            status: document.getElementById('notificationStatus'),
            statusText: document.getElementById('statusText'),
            enableBtn: document.getElementById('enableNotifications'),
            disableBtn: document.getElementById('disableNotifications'),
            testBtn: document.getElementById('testNotification'),
            closeBtn: document.getElementById('closeSettings')
        };

        this.setupEventListeners();
        this.updateUI();

        console.log('NotificationManager initialized');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        this.elements.toggle?.addEventListener('click', () => this.toggleSettings());
        this.elements.closeBtn?.addEventListener('click', () => this.hide());
        this.elements.enableBtn?.addEventListener('click', () => this.enableNotifications());
        this.elements.disableBtn?.addEventListener('click', () => this.disableNotifications());
        this.elements.testBtn?.addEventListener('click', () => this.sendTestNotification());
    },

    /**
     * Show/hide notification button (when entering/leaving room)
     */
    show() {
        if (this.elements.toggle) {
            this.elements.toggle.style.display = 'flex';
        }
    },

    hide() {
        if (this.elements.toggle) {
            this.elements.toggle.style.display = 'none';
        }
        this.hideSettings();
    },

    /**
     * Toggle settings panel
     */
    toggleSettings() {
        const isShown = this.elements.settings?.classList.contains('show');
        isShown ? this.hideSettings() : this.showSettings();
    },

    showSettings() {
        this.elements.settings?.classList.add('show');
        this.updateUI();
    },

    hideSettings() {
        this.elements.settings?.classList.remove('show');
    },

    /**
     * Update UI based on current permission status
     */
    updateUI() {
        if (!window.PushNotificationManager) return;

        const status = window.PushNotificationManager.getPermissionStatus();

        if (!status.isSupported) {
            this.setStatus('disabled', '❌ Not supported in this browser');
            this.hideAllButtons();
            this.hideBadge();
        } else if (status.permission === 'denied') {
            this.setStatus('blocked', '🚫 Notifications blocked. Enable in browser settings.');
            this.hideAllButtons();
            this.showBadge();
        } else if (status.isSubscribed) {
            this.setStatus('enabled', '✅ Notifications enabled');
            this.showButtons({ disable: true, test: true });
            this.hideBadge();
        } else {
            this.setStatus('disabled', '🔕 Notifications disabled');
            this.showButtons({ enable: true });
            this.showBadge();
        }
    },

    /**
     * Set status text and style
     */
    setStatus(type, text) {
        if (this.elements.status) {
            this.elements.status.className = `notification-status ${type}`;
        }
        if (this.elements.statusText) {
            this.elements.statusText.textContent = text;
        }
    },

    /**
     * Show specific buttons
     */
    showButtons(buttons = {}) {
        if (this.elements.enableBtn) {
            this.elements.enableBtn.style.display = buttons.enable ? 'block' : 'none';
        }
        if (this.elements.disableBtn) {
            this.elements.disableBtn.style.display = buttons.disable ? 'block' : 'none';
        }
        if (this.elements.testBtn) {
            this.elements.testBtn.style.display = buttons.test ? 'block' : 'none';
        }
    },

    hideAllButtons() {
        this.showButtons({});
    },

    showBadge() {
        if (this.elements.badge) {
            this.elements.badge.style.display = 'block';
        }
    },

    hideBadge() {
        if (this.elements.badge) {
            this.elements.badge.style.display = 'none';
        }
    },

    /**
     * Enable notifications
     */
    async enableNotifications() {
        this.elements.enableBtn.disabled = true;
        this.elements.enableBtn.textContent = 'Enabling...';

        const result = await window.PushNotificationManager.requestPermission();

        if (result.success) {
            UIController?.notify('Notifications enabled!', 'info');
        } else {
            UIController?.notify(result.error || 'Failed to enable notifications', 'error');
        }

        this.elements.enableBtn.disabled = false;
        this.elements.enableBtn.textContent = 'Enable Notifications';
        this.updateUI();
    },

    /**
     * Disable notifications
     */
    async disableNotifications() {
        this.elements.disableBtn.disabled = true;
        this.elements.disableBtn.textContent = 'Disabling...';

        const result = await window.PushNotificationManager.unsubscribe();

        if (result.success) {
            UIController?.notify('Notifications disabled', 'info');
        } else {
            UIController?.notify(result.error || 'Failed to disable notifications', 'error');
        }

        this.elements.disableBtn.disabled = false;
        this.elements.disableBtn.textContent = 'Disable Notifications';
        this.updateUI();
    },

    /**
     * Send test notification
     */
    async sendTestNotification() {
        this.elements.testBtn.disabled = true;
        this.elements.testBtn.textContent = 'Sending...';

        const result = await window.PushNotificationManager.sendTestNotification();

        if (result.success) {
            UIController?.notify('Test notification sent!', 'info');
        } else {
            UIController?.notify(result.error || 'Failed to send test', 'error');
        }

        this.elements.testBtn.disabled = false;
        this.elements.testBtn.textContent = 'Send Test Notification';
    }
};

if (typeof window !== "undefined") window.NotificationManager = NotificationManager;
if (typeof module !== "undefined") module.exports = NotificationManager;
