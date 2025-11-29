/**
 * key-verification-ui.js - IMPROVED VERSION
 * Enhanced user interface for key verification with auto-trust options
 */

const KeyVerificationUI = {

    // Trust level constants
    TRUST_LEVELS: {
        UNTRUSTED: 0,
        AUTO_ACCEPTED: 1,
        VERIFIED: 2
    },

    /**
     * Show key verification modal with improved messaging
     */
    showVerificationModal(username, fingerprint, trustLevel = 0) {
        this.closeVerificationModal();

        const isVerified = trustLevel === this.TRUST_LEVELS.VERIFIED;
        const isAutoAccepted = trustLevel === this.TRUST_LEVELS.AUTO_ACCEPTED;

        const modal = document.createElement('div');
        modal.className = 'key-verification-modal';
        modal.id = 'key-verification-modal';

        // Status badge configuration
        let statusConfig;
        if (isVerified) {
            statusConfig = {
                icon: 'check-circle',
                text: 'Manually Verified',
                class: 'verified',
                color: '#10b981'
            };
        } else if (isAutoAccepted) {
            statusConfig = {
                icon: 'shield-alt',
                text: 'Auto-Accepted (First Use)',
                class: 'auto-accepted',
                color: '#3b82f6'
            };
        } else {
            statusConfig = {
                icon: 'info-circle',
                text: 'Ready to Verify',
                class: 'unverified',
                color: '#f59e0b'
            };
        }

        modal.innerHTML = `
        <div class="verification-overlay"></div>
        <div class="verification-content">
        <div class="verification-header">
        <h3>
        <i class="fas fa-fingerprint"></i>
        Encryption Key for ${this.escapeHtml(username)}
        </h3>
        <button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
        <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="verification-body">
        <div class="verification-status ${statusConfig.class}">
        <i class="fas fa-${statusConfig.icon}" style="color: ${statusConfig.color}"></i>
        <span>${statusConfig.text}</span>
        </div>

        ${isVerified ? `
            <div class="verification-info success">
            <i class="fas fa-check-circle"></i>
            <p>You've manually verified this key is authentic. Your messages are secure.</p>
            </div>
            ` : isAutoAccepted ? `
            <div class="verification-info info">
            <i class="fas fa-info-circle"></i>
            <p><strong>Trust on First Use (TOFU):</strong> This key was automatically accepted when you first connected. For maximum security, verify it manually.</p>
            </div>
            ` : `
            <div class="verification-info warning">
            <i class="fas fa-shield-alt"></i>
            <p><strong>New Key Detected:</strong> Compare this fingerprint with ${this.escapeHtml(username)}</p>
            </div>
            `}

            <div class="fingerprint-section">
            <label>Security Fingerprint:</label>
            <div class="fingerprint-display">
            <code>${fingerprint}</code>
            <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${fingerprint}')">
            <i class="fas fa-copy"></i> Copy
            </button>
            </div>
            </div>

            ${!isVerified ? `
                <div class="verification-explainer">
                <h4><i class="fas fa-question-circle"></i> Why Verify?</h4>
                <ul>
                <li><strong>Prevents impersonation:</strong> Ensures ${this.escapeHtml(username)}'s identity</li>
                <li><strong>Detects attacks:</strong> Alerts privacy threats</li>
                <li><strong>One-time process:</strong> Verify once, secure forever</li>
                </ul>
                </div>

                <div class="verification-methods">
                <h4><i class="fas fa-exchange-alt"></i> How to Verify:</h4>
                <div class="method-list">
                <div class="method-item">
                <i class="fas fa-user-friends"></i>
                <div>
                <strong>In Person</strong>
                <p>Show fingerprints on your devices</p>
                </div>
                </div>
                <div class="method-item">
                <i class="fas fa-qrcode"></i>
                <div>
                <strong>QR Code Scan</strong>
                <p>Scan to automatically verify</p>
                </div>
                <button class="method-action-btn" onclick="KeyVerificationUI.showQRScanner('${username}', '${fingerprint}')">
                <i class="fas fa-camera"></i>
                </button>
                </div>
                </div>
                </div>
                ` : ''}
                </div>

                <div class="verification-footer">
                ${!isVerified ? `
                    ${!isAutoAccepted ? `
                        <button class="btn-auto-accept" onclick="KeyVerificationUI.autoAcceptKey('${username}')">
                        <i class="fas fa-check"></i> Trust This KEY
                        </button>
                        ` : ''}
                        <button class="btn-verify" onclick="KeyVerificationUI.confirmVerification('${username}')">
                        <i class="fas fa-shield-check"></i> Mark as Secure
                        </button>
                        ` : `
                        <button class="btn-unverify" onclick="KeyVerificationUI.unverifyKey('${username}')">
                        <i class="fas fa-times"></i> Remove Verification
                        </button>
                        `}
                        <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
                        Close
                        </button>
                        </div>
                        </div>
                        `;

                        document.body.appendChild(modal);

                        modal.querySelector('.verification-overlay').onclick = () => {
                            this.closeVerificationModal();
                        };
    },

    /**
     * Auto-accept key (TOFU - Trust on First Use)
     */
    autoAcceptKey(username) {
        if (window.E2EE) {
            // Store with auto-accepted flag
            window.E2EE.markPeerAutoAccepted(username);
        }

        if (window.UIManager) {
            window.UIManager.showNotification(
                `✓ Auto-accepted ${username}'s key. Consider manual verification for higher security.`,
                'info'
            );
        }

        this.closeVerificationModal();

        if (window.App && window.App.updateActiveUsers) {
            window.App.updateActiveUsers();
        }
    },

    /**
     * Show your own fingerprint
     */
    async showOwnFingerprint() {
        if (!window.E2EE || !window.E2EE.keyPair) {
            if (window.UIManager) {
                window.UIManager.showNotification('No encryption keys available', 'error');
            }
            return;
        }

        const fingerprint = await window.E2EE.getPublicKeyFingerprint();
        const shortFingerprint = await window.E2EE.getShortFingerprint();

        if (!fingerprint) {
            if (window.UIManager) {
                window.UIManager.showNotification('Failed to generate fingerprint', 'error');
            }
            return;
        }

        const keyAge = window.E2EE.keyGenerationDate ?
        Math.floor((Date.now() - window.E2EE.keyGenerationDate) / (1000 * 60 * 60 * 24)) : 0;
        const needsRotation = window.E2EE.needsKeyRotation();

        const modal = document.createElement('div');
        modal.className = 'key-verification-modal';
        modal.id = 'key-verification-modal';

        modal.innerHTML = `
        <div class="verification-overlay"></div>
        <div class="verification-content">
        <div class="verification-header">
        <h3>
        <i class="fas fa-fingerprint"></i>
        Your Encryption Key
        </h3>
        <button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
        <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="verification-body">
        <div class="key-status-banner ${needsRotation ? 'warning' : 'success'}">
        <i class="fas fa-${needsRotation ? 'exclamation-triangle' : 'check-circle'}"></i>
        <div>
        <strong>${needsRotation ? 'Key Rotation Recommended' : 'Key Active'}</strong>
        <p>Key age: ${keyAge} days ${needsRotation ? '(>30 days old)' : ''}</p>
        </div>
        ${needsRotation ? `
            <button class="btn-small" onclick="KeyVerificationUI.rotateKeys()">
            <i class="fas fa-sync"></i> Rotate Now
            </button>
            ` : ''}
            </div>

            <div class="verification-info">
            <p>Share this fingerprint with others to verify your identity:</p>
            </div>

            <div class="fingerprint-section">
            <label>Full Fingerprint:</label>
            <div class="fingerprint-display">
            <code>${fingerprint}</code>
            <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${fingerprint}')">
            <i class="fas fa-copy"></i> Copy
            </button>
            </div>
            </div>

            <div class="fingerprint-section">
            <label>Short Version (Quick Compare):</label>
            <div class="fingerprint-display short">
            <code>${shortFingerprint}</code>
            <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${shortFingerprint}')">
            <i class="fas fa-copy"></i> Copy
            </button>
            </div>
            </div>

            <div class="key-security-info">
            <i class="fas fa-lock"></i>
            <div>
            <strong>Security:</strong> Your private key is stored securely in IndexedDB
            </div>
            </div>

            <div class="key-actions-grid">
            <button class="action-card" onclick="KeyVerificationUI.showQRCode()">
            <i class="fas fa-qrcode"></i>
            <span>Show QR Code</span>
            </button>
            <button class="action-card" onclick="KeyVerificationUI.exportBackup()">
            <i class="fas fa-download"></i>
            <span>Backup Messages</span>
            </button>
            <button class="action-card" onclick="KeyVerificationUI.showDebugInfo()">
            <i class="fas fa-info-circle"></i>
            <span>Security Info</span>
            </button>
            </div>
            </div>

            <div class="verification-footer">
            <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
            Close
            </button>
            </div>
            </div>
            `;

            document.body.appendChild(modal);

            modal.querySelector('.verification-overlay').onclick = () => {
                this.closeVerificationModal();
            };
    },

    /**
     * Show list of all users with trust levels
     */
    async showUserList(users, currentUser) {
        const modal = document.createElement('div');
        modal.className = 'key-verification-modal';
        modal.id = 'key-verification-modal';

        let userListHtml = '';
        let verifiedCount = 0;
        let autoAcceptedCount = 0;
        let unverifiedCount = 0;

        for (const user of users) {
            if (user.username === currentUser) continue;

            const fingerprint = window.E2EE.peerFingerprints.get(user.username);
            const trustLevel = this.getTrustLevel(user.username);

            const shortFingerprint = fingerprint ?
            fingerprint.split(' ').slice(0, 6).join(' ') :
            'Loading...';

        let statusBadge, statusClass, statusIcon;
        if (trustLevel === this.TRUST_LEVELS.VERIFIED) {
            statusBadge = 'Verified';
            statusClass = 'verified';
            statusIcon = 'check-circle';
            verifiedCount++;
        } else if (trustLevel === this.TRUST_LEVELS.AUTO_ACCEPTED) {
            statusBadge = 'Auto-Accepted';
            statusClass = 'auto-accepted';
            statusIcon = 'shield-alt';
            autoAcceptedCount++;
        } else {
            statusBadge = 'Not Verified';
            statusClass = 'unverified';
            statusIcon = 'info-circle';
            unverifiedCount++;
        }

        userListHtml += `
        <div class="user-list-item ${statusClass}">
        <div class="user-info">
        <div class="user-name">
        <i class="fas fa-user"></i>
        <strong>${this.escapeHtml(user.username)}</strong>
        </div>
        <div class="user-fingerprint">
        <code>${shortFingerprint}</code>
        </div>
        </div>
        <div class="user-actions">
        <span class="verification-badge ${statusClass}">
        <i class="fas fa-${statusIcon}"></i>
        ${statusBadge}
        </span>
        ${fingerprint ? `
            <button class="btn-small" onclick="KeyVerificationUI.verifyUser('${user.username}', '${fingerprint}', ${trustLevel})">
            <i class="fas fa-fingerprint"></i> View
            </button>
            ` : `
            <button class="btn-small disabled" disabled>
            <i class="fas fa-spinner fa-spin"></i> Loading
            </button>
            `}
            </div>
            </div>
            `;
        }

        const totalUsers = users.length - 1; // Excluding self
        const securityScore = totalUsers > 0 ? Math.round((verifiedCount / totalUsers) * 100) : 100;

        modal.innerHTML = `
        <div class="verification-overlay"></div>
        <div class="verification-content user-list-modal">
        <div class="verification-header">
        <h3>
        <i class="fas fa-users"></i>
        Room Security & Users
        </h3>
        <button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
        <i class="fas fa-times"></i>
        </button>
        </div>

        ${totalUsers > 0 ? `
            <div class="security-score-banner">
            <div class="score-circle ${securityScore === 100 ? 'perfect' : securityScore >= 50 ? 'good' : 'warning'}">
            <span class="score-number">${securityScore}%</span>
            <span class="score-label">Verified</span>
            </div>
            <div class="score-details">
            <div class="score-item">
            <i class="fas fa-check-circle" style="color: #10b981"></i>
            <span>${verifiedCount} Verified</span>
            </div>
            <div class="score-item">
            <i class="fas fa-shield-alt" style="color: #3b82f6"></i>
            <span>${autoAcceptedCount} Auto-Accepted</span>
            </div>
            <div class="score-item">
            <i class="fas fa-info-circle" style="color: #f59e0b"></i>
            <span>${unverifiedCount} Unverified</span>
            </div>
            </div>
            </div>
            ` : ''}

            <div class="verification-body">
            ${userListHtml || '<div class="empty-state"><i class="fas fa-users"></i><p>No other users in this room</p></div>'}
            </div>

            <div class="verification-footer">
            <button class="btn-primary" onclick="KeyVerificationUI.showOwnFingerprint()">
            <i class="fas fa-fingerprint"></i> Own KEY
            </button>
            ${unverifiedCount > 0 ? `
                <button class="btn-auto-accept-all" onclick="KeyVerificationUI.autoAcceptAll()">
                <i class="fas fa-check-double"></i> Auto-Accept All
                </button>
                ` : ''}
                <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
                Close
                </button>
                </div>
                </div>
                `;

                document.body.appendChild(modal);

                modal.querySelector('.verification-overlay').onclick = () => {
                    this.closeVerificationModal();
                };
    },

    /**
     * Get trust level for a user
     */
    getTrustLevel(username) {
        if (!window.E2EE) return this.TRUST_LEVELS.UNTRUSTED;

        if (window.E2EE.isPeerVerified(username)) {
            return this.TRUST_LEVELS.VERIFIED;
        }

        if (window.E2EE.isPeerAutoAccepted && window.E2EE.isPeerAutoAccepted(username)) {
            return this.TRUST_LEVELS.AUTO_ACCEPTED;
        }

        return this.TRUST_LEVELS.UNTRUSTED;
    },

    /**
     * Auto-accept all unverified keys
     */
    autoAcceptAll() {
        if (!confirm('Auto-accept all unverified keys? This is less secure than manual verification.')) {
            return;
        }

        if (window.E2EE && window.StateManager) {
            let count = 0;
            for (const user of window.StateManager.roomUsers || []) {
                if (user.username === window.StateManager.currentUser) continue;

                const trustLevel = this.getTrustLevel(user.username);
                if (trustLevel === this.TRUST_LEVELS.UNTRUSTED) {
                    window.E2EE.markPeerAutoAccepted(user.username);
                    count++;
                }
            }

            if (window.UIManager) {
                window.UIManager.showNotification(
                    `✓ Auto-accepted ${count} keys. Consider manual verification for maximum security.`,
                    'info'
                );
            }
        }

        this.closeVerificationModal();
    },

    /**
     * Verify a user's key
     */
    verifyUser(username, fingerprint, trustLevel) {
        this.showVerificationModal(username, fingerprint, trustLevel);
    },

    /**
     * Confirm manual verification
     */
    confirmVerification(username) {
        if (window.E2EE) {
            window.E2EE.markPeerVerified(username);
        }

        if (window.UIManager) {
            window.UIManager.showNotification(
                `✓ ${username}'s key manually verified - Maximum security enabled`,
                'success'
            );
        }

        this.closeVerificationModal();

        if (window.App && window.App.updateActiveUsers) {
            window.App.updateActiveUsers();
        }
    },

    /**
     * Unverify a key
     */
    unverifyKey(username) {
        if (confirm(`Remove verification for ${username}? This will not affect message delivery.`)) {
            if (window.E2EE) {
                window.E2EE.verifiedPeers.delete(username);
                if (window.E2EE.autoAcceptedPeers) {
                    window.E2EE.autoAcceptedPeers.delete(username);
                }
                window.E2EE.saveVerifiedPeers();
            }

            if (window.UIManager) {
                window.UIManager.showNotification(
                    `${username}'s key verification removed`,
                    'info'
                );
            }

            this.closeVerificationModal();
        }
    },

    /**
     * Show QR Code for own fingerprint
     */
    async showQRCode() {
        if (!window.E2EE || !window.E2EE.keyPair) {
            if (window.UIManager) {
                window.UIManager.showNotification('No encryption keys available', 'error');
            }
            return;
        }

        const fingerprint = await window.E2EE.getPublicKeyFingerprint();
        const publicKey = await window.E2EE.exportPublicKey();

        if (!fingerprint || !publicKey) {
            if (window.UIManager) {
                window.UIManager.showNotification('Failed to generate QR code', 'error');
            }
            return;
        }

        const username = window.StateManager ? window.StateManager.currentUser : 'User';

        // Create QR code data
        const qrData = JSON.stringify({
            type: 'e2ee-key',
            version: '3.0',
            username: username,
            fingerprint: fingerprint,
            publicKey: publicKey,
                timestamp: Date.now()
        });

        const modal = document.createElement('div');
        modal.className = 'key-verification-modal';
        modal.id = 'key-verification-modal';

        modal.innerHTML = `
        <div class="verification-overlay"></div>
        <div class="verification-content">
        <div class="verification-header">
        <h3>
        <i class="fas fa-qrcode"></i>
        Your QR Code
        </h3>
        <button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
        <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="verification-body">
        <div class="verification-info info">
        <i class="fas fa-info-circle"></i>
        <p>Have the other person scan this QR code to automatically verify your key.</p>
        </div>

        <div class="qr-code-container">
        <div id="qr-code-display"></div>
        </div>

        <div class="fingerprint-section">
        <label>Fingerprint (for manual comparison):</label>
        <div class="fingerprint-display short">
        <code>${fingerprint.split(' ').slice(0, 6).join(' ')}</code>
        </div>
        </div>
        </div>

        <div class="verification-footer">
        <button class="btn-primary" onclick="KeyVerificationUI.showQRScanner()">
        <i class="fas fa-camera"></i> Scan Someone's QR
        </button>
        <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
        Close
        </button>
        </div>
        </div>
        `;

        document.body.appendChild(modal);

        // Generate QR code using QRCode.js library
        this.generateQRCode('qr-code-display', qrData);

        modal.querySelector('.verification-overlay').onclick = () => {
            this.closeVerificationModal();
        };
    },

    /**
     * Generate QR Code (using basic canvas implementation)
     */
    generateQRCode(elementId, data) {
        const container = document.getElementById(elementId);
        if (!container) return;

        // Check if QRCode library is available
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: data,
                width: 280,
                height: 280,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } else {
            // Fallback: Load QRCode.js dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.onload = () => {
                new QRCode(container, {
                    text: data,
                    width: 280,
                    height: 280,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.H
                });
            };
            script.onerror = () => {
                container.innerHTML = '<p style="text-align: center; opacity: 0.7;">QR Code generation failed. Please verify manually.</p>';
            };
            document.head.appendChild(script);
        }
    },

    /**
     * Show QR Scanner to verify someone else's key
     */
    async showQRScanner(username = null, expectedFingerprint = null) {
        const modal = document.createElement('div');
        modal.className = 'key-verification-modal';
        modal.id = 'key-verification-modal';

        modal.innerHTML = `
        <div class="verification-overlay"></div>
        <div class="verification-content">
        <div class="verification-header">
        <h3>
        <i class="fas fa-camera"></i>
        Scan QR Code
        </h3>
        <button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
        <i class="fas fa-times"></i>
        </button>
        </div>

        <div class="verification-body">
        <div class="verification-info info">
        <i class="fas fa-info-circle"></i>
        <p>Position the QR code within the camera frame to automatically verify the encryption key.</p>
        </div>

        <div class="qr-scanner-container">
        <video id="qr-video" autoplay playsinline></video>
        <canvas id="qr-canvas" style="display: none;"></canvas>
        <div class="scanner-overlay">
        <div class="scanner-frame"></div>
        </div>
        </div>

        <div id="scan-result" class="scan-result" style="display: none;"></div>
        </div>

        <div class="verification-footer">
        <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
        Cancel
        </button>
        </div>
        </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('.verification-overlay').onclick = () => {
            this.stopQRScanner();
            this.closeVerificationModal();
        };

        // Start QR scanner
        this.startQRScanner(username, expectedFingerprint);
    },

    /**
     * Start QR code scanner using device camera
     */
    async startQRScanner(username, expectedFingerprint) {
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');

        if (!video || !canvas) return;

        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });

            video.srcObject = stream;
            this.qrScannerStream = stream;

            const context = canvas.getContext('2d');

            // Load jsQR library dynamically if not available
            if (typeof jsQR === 'undefined') {
                await this.loadJsQR();
            }

            // Start scanning loop
            const scanQR = () => {
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        this.handleQRScanResult(code.data, username, expectedFingerprint);
                        return; // Stop scanning
                    }
                }

                // Continue scanning
                this.qrScannerTimeout = setTimeout(scanQR, 100);
            };

            scanQR();

        } catch (err) {
            console.error('QR Scanner error:', err);

            const resultDiv = document.getElementById('scan-result');
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                <div class="verification-info warning">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Camera access denied or not available. Please verify keys manually.</p>
                </div>
                `;
            }
        }
    },

    /**
     * Load jsQR library dynamically
     */
    async loadJsQR() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    },

    /**
     * Handle QR scan result
     */
    async handleQRScanResult(data, expectedUsername, expectedFingerprint) {
        this.stopQRScanner();

        try {
            const qrData = JSON.parse(data);

            // Validate QR data structure
            if (qrData.type !== 'e2ee-key' || !qrData.username || !qrData.fingerprint || !qrData.publicKey) {
                throw new Error('Invalid QR code format');
            }

            const resultDiv = document.getElementById('scan-result');

            // Check if this matches expected user
            if (expectedUsername && qrData.username !== expectedUsername) {
                if (resultDiv) {
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = `
                    <div class="verification-info warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>Warning:</strong> This QR code is for "${this.escapeHtml(qrData.username)}", but you expected "${this.escapeHtml(expectedUsername)}".</p>
                    </div>
                    `;
                }
                return;
            }

            // Check if fingerprint matches expected
            if (expectedFingerprint && qrData.fingerprint !== expectedFingerprint) {
                if (resultDiv) {
                    resultDiv.style.display = 'block';
                    resultDiv.innerHTML = `
                    <div class="verification-info warning">
                    <i class="fas fa-times-circle"></i>
                    <p><strong>Verification Failed:</strong> Fingerprint mismatch! This could indicate a security issue.</p>
                    </div>
                    `;
                }

                if (window.UIManager) {
                    window.UIManager.showNotification(
                        '⚠️ Fingerprint mismatch detected!',
                        'error'
                    );
                }
                return;
            }

            // Import the public key
            if (window.E2EE) {
                const imported = await window.E2EE.importPublicKey(qrData.username, qrData.publicKey);

                if (imported) {
                    // Verify fingerprint
                    const verified = await window.E2EE.verifyPeerFingerprint(qrData.username, qrData.fingerprint);

                    if (verified) {
                        if (resultDiv) {
                            resultDiv.style.display = 'block';
                            resultDiv.innerHTML = `
                            <div class="verification-info success">
                            <i class="fas fa-check-circle"></i>
                            <p><strong>Success!</strong> ${this.escapeHtml(qrData.username)}'s key verified automatically via QR code.</p>
                            </div>
                            `;
                        }

                        if (window.UIManager) {
                            window.UIManager.showNotification(
                                `✓ ${qrData.username}'s key verified via QR scan`,
                                'success'
                            );
                        }

                        // Close modal after 2 seconds
                        setTimeout(() => {
                            this.closeVerificationModal();
                        }, 2000);
                    }
                }
            }

        } catch (err) {
            console.error('QR scan handling error:', err);

            const resultDiv = document.getElementById('scan-result');
            if (resultDiv) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                <div class="verification-info warning">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Invalid QR code. Please try again or verify manually.</p>
                </div>
                `;
            }
        }
    },

    /**
     * Stop QR scanner and release camera
     */
    stopQRScanner() {
        // Clear timeout
        if (this.qrScannerTimeout) {
            clearTimeout(this.qrScannerTimeout);
            this.qrScannerTimeout = null;
        }

        // Stop video stream
        if (this.qrScannerStream) {
            this.qrScannerStream.getTracks().forEach(track => track.stop());
            this.qrScannerStream = null;
        }
    },

    /**
     * Rotate keys
     */
    async rotateKeys() {
        if (!confirm('Rotate encryption keys? This will re-encrypt all stored messages.')) {
            return;
        }

        this.closeVerificationModal();

        if (window.UIManager) {
            window.UIManager.showNotification('Rotating keys...', 'info');
        }

        if (window.E2EE) {
            const success = await window.E2EE.rotateKeysWithMessages();

            if (success && window.UIManager) {
                window.UIManager.showNotification(
                    '✓ Keys rotated successfully',
                    'success'
                );
            }
        }
    },

    /**
     * Export message backup
     */
    async exportBackup() {
        const password = prompt('Enter a strong password to encrypt your backup:');
        if (!password) return;

        if (password.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }

        if (window.UIManager) {
            window.UIManager.showNotification('Creating encrypted backup...', 'info');
        }

        if (window.E2EE) {
            const backup = await window.E2EE.exportMessagesBackup(password);

            if (backup) {
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `e2ee-backup-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);

                if (window.UIManager) {
                    window.UIManager.showNotification(
                        '✓ Backup downloaded successfully',
                        'success'
                    );
                }
            }
        }
    },

    /**
     * Show debug information
     */
    showDebugInfo() {
        if (!window.E2EE) return;

        const debug = window.E2EE.getDebugInfo();

        alert(`E2EE Debug Information:

        Has KeyPair: ${debug.hasKeyPair}
        Key Age: ${debug.keyAge ? Math.floor(debug.keyAge / (1000 * 60 * 60 * 24)) + ' days' : 'N/A'}
        Keys Expired: ${debug.keysExpired}
        Needs Rotation: ${debug.needsRotation}
        Peer Count: ${debug.peerCount}
        Verified Peers: ${debug.verifiedPeerCount}
        Failed Decryptions: ${debug.failedDecryptions}
        Session Keys: ${debug.sessionKeys}
        Rotation Scheduler: ${debug.rotationSchedulerActive ? 'Active' : 'Inactive'}
        Secure Storage: ${debug.secureStorage}`);
    },

    /**
     * Copy fingerprint to clipboard
     */
    copyFingerprint(fingerprint) {
        navigator.clipboard.writeText(fingerprint).then(() => {
            if (window.UIManager) {
                window.UIManager.showNotification('📋 Fingerprint copied', 'info');
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    },

    /**
     * Close verification modal
     */
    closeVerificationModal() {
        // Stop scanner if active
        this.stopQRScanner();

        const modal = document.getElementById('key-verification-modal');
        if (modal) {
            modal.remove();
        }
    },

    /**
     * Show decryption error with recovery options
     */
    showDecryptionError(messageId, errorInfo) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;

        const errorBadge = document.createElement('div');
        errorBadge.className = 'decryption-error-badge';
        errorBadge.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>Decryption failed</span>
        <button class="retry-btn" onclick="KeyVerificationUI.retryDecryption('${messageId}')">
        <i class="fas fa-redo"></i> Retry
        </button>
        `;

        const messageContent = messageElement.querySelector('.message-content');
        if (messageContent) {
            const existingError = messageContent.querySelector('.decryption-error-badge');
            if (existingError) existingError.remove();
            messageContent.appendChild(errorBadge);
        }
    },

    /**
     * Retry decryption
     */
    async retryDecryption(messageId) {
        if (window.App && window.App.retryMessageDecryption) {
            await window.App.retryMessageDecryption(messageId);
        }
    },

    /**
     * Add verification button to chat header
     */
    addVerificationButton() {
        const chatHeader = document.querySelector('.chat-header .header-content');
        if (!chatHeader) return;

        if (document.getElementById('verify-keys-btn')) return;

        const verifyBtn = document.createElement('button');
        verifyBtn.id = 'verify-keys-btn';
        verifyBtn.className = 'icon-button';
        verifyBtn.setAttribute('aria-label', 'View encryption status');
        verifyBtn.innerHTML = '<i class="fas fa-shield-alt"></i>';
        verifyBtn.onclick = () => {
            if (window.StateManager && window.StateManager.roomUsers) {
                this.showUserList(
                    window.StateManager.roomUsers,
                    window.StateManager.currentUser
                );
            }
        };

        const downloadBtn = document.getElementById('download-history-button');
        if (downloadBtn) {
            downloadBtn.parentNode.insertBefore(verifyBtn, downloadBtn);
        } else {
            chatHeader.appendChild(verifyBtn);
        }
    },

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Initialize verification UI
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => this.addVerificationButton(), 1000);
            });
        } else {
            setTimeout(() => this.addVerificationButton(), 1000);
        }

        if (window.E2EE) {
            window.E2EE.loadVerifiedPeers();
        }
    }
};

// Auto-initialize
if (typeof window !== 'undefined') {
    window.KeyVerificationUI = KeyVerificationUI;
    KeyVerificationUI.init();
}

if (typeof module !== "undefined") {
    module.exports = KeyVerificationUI;
}
