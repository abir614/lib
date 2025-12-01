const KeyVerificationUI={TRUST_LEVELS:{UNTRUSTED:0,AUTO_ACCEPTED:1,VERIFIED:2},showVerificationModal(e,i,a=0){this.closeVerificationModal();let t=a===this.TRUST_LEVELS.VERIFIED,s=a===this.TRUST_LEVELS.AUTO_ACCEPTED,n=document.createElement("div");n.className="key-verification-modal",n.id="key-verification-modal";let r;r=t?{icon:"check-circle",text:"Manually Verified",class:"verified",color:"#10b981"}:s?{icon:"shield-alt",text:"Auto-Accepted (First Use)",class:"auto-accepted",color:"#3b82f6"}:{icon:"info-circle",text:"Ready to Verify",class:"unverified",color:"#f59e0b"},n.innerHTML=`
<div class="verification-overlay"></div>
<div class="verification-content">
<div class="verification-header">
<h3>
<i class="fas fa-fingerprint"></i>
Encryption Key for ${this.escapeHtml(e)}
</h3>
<button class="close-btn" onclick="KeyVerificationUI.closeVerificationModal()">
<i class="fas fa-times"></i>
</button>
</div>

<div class="verification-body">
<div class="verification-status ${r.class}">
<i class="fas fa-${r.icon}" style="color: ${r.color}"></i>
<span>${r.text}</span>
</div>

${t?`
    <div class="verification-info success">
    <i class="fas fa-check-circle"></i>
    <p>You've manually verified this key is authentic. Your messages are secure.</p>
    </div>
    `:s?`
    <div class="verification-info info">
    <i class="fas fa-info-circle"></i>
    <p><strong>Trust on First Use (TOFU):</strong> This key was automatically accepted when you first connected. For maximum security, verify it manually.</p>
    </div>
    `:`
    <div class="verification-info warning">
    <i class="fas fa-shield-alt"></i>
    <p><strong>New Key Detected:</strong> Compare this fingerprint with ${this.escapeHtml(e)}</p>
    </div>
    `}

    <div class="fingerprint-section">
    <label>Security Fingerprint:</label>
    <div class="fingerprint-display">
    <code>${i}</code>
    <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${i}')">
    <i class="fas fa-copy"></i> Copy
    </button>
    </div>
    </div>

    ${t?"":`
        <div class="verification-explainer">
        <h4><i class="fas fa-question-circle"></i> Why Verify?</h4>
        <ul>
        <li><strong>Prevents impersonation:</strong> Ensures ${this.escapeHtml(e)}'s identity</li>
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
        <button class="method-action-btn" onclick="KeyVerificationUI.showQRScanner('${e}', '${i}')">
        <i class="fas fa-camera"></i>
        </button>
        </div>
        </div>
        </div>
        `}
        </div>

        <div class="verification-footer">
        ${t?`
            <button class="btn-unverify" onclick="KeyVerificationUI.unverifyKey('${e}')">
            <i class="fas fa-times"></i> Remove Verification
            </button>
            `:`
            ${s?"":`
                <button class="btn-auto-accept" onclick="KeyVerificationUI.autoAcceptKey('${e}')">
                <i class="fas fa-check"></i> Trust This KEY
                </button>
                `}
                <button class="btn-verify" onclick="KeyVerificationUI.confirmVerification('${e}')">
                <i class="fas fa-shield-check"></i> Mark as Secure
                </button>
                `}
                <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
                Close
                </button>
                </div>
                </div>
                `,document.body.appendChild(n),n.querySelector(".verification-overlay").onclick=()=>{this.closeVerificationModal()}},autoAcceptKey(e){window.E2EE&&window.E2EE.markPeerAutoAccepted(e),window.UIManager&&window.UIManager.showNotification(`✓ Auto-accepted ${e}'s key. Consider manual verification for higher security.`,"info"),this.closeVerificationModal(),window.App&&window.App.updateActiveUsers&&window.App.updateActiveUsers()},async showOwnFingerprint(){if(!window.E2EE||!window.E2EE.keyPair){window.UIManager&&window.UIManager.showNotification("No encryption keys available","error");return}let e=await window.E2EE.getPublicKeyFingerprint(),i=await window.E2EE.getShortFingerprint();if(!e){window.UIManager&&window.UIManager.showNotification("Failed to generate fingerprint","error");return}let a=window.E2EE.keyGenerationDate?Math.floor((Date.now()-window.E2EE.keyGenerationDate)/864e5):0,t=window.E2EE.needsKeyRotation(),s=document.createElement("div");s.className="key-verification-modal",s.id="key-verification-modal",s.innerHTML=`
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
                <div class="key-status-banner ${t?"warning":"success"}">
                <i class="fas fa-${t?"exclamation-triangle":"check-circle"}"></i>
                <div>
                <strong>${t?"Key Rotation Recommended":"Key Active"}</strong>
                <p>Key age: ${a} days ${t?"(>30 days old)":""}</p>
                </div>
                ${t?`
                    <button class="btn-small" onclick="KeyVerificationUI.rotateKeys()">
                    <i class="fas fa-sync"></i> Rotate Now
                    </button>
                    `:""}
                    </div>

                    <div class="verification-info">
                    <p>Share this fingerprint with others to verify your identity:</p>
                    </div>

                    <div class="fingerprint-section">
                    <label>Full Fingerprint:</label>
                    <div class="fingerprint-display">
                    <code>${e}</code>
                    <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${e}')">
                    <i class="fas fa-copy"></i> Copy
                    </button>
                    </div>
                    </div>

                    <div class="fingerprint-section">
                    <label>Short Version (Quick Compare):</label>
                    <div class="fingerprint-display short">
                    <code>${i}</code>
                    <button class="copy-btn" onclick="KeyVerificationUI.copyFingerprint('${i}')">
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
                    `,document.body.appendChild(s),s.querySelector(".verification-overlay").onclick=()=>{this.closeVerificationModal()}},async showUserList(e,i){let a=document.createElement("div");a.className="key-verification-modal",a.id="key-verification-modal";let t="",s=0,n=0,r=0;for(let o of e){if(o.username===i)continue;let c=window.E2EE.peerFingerprints.get(o.username),l=this.getTrustLevel(o.username),d=c?c.split(" ").slice(0,6).join(" "):"Loading...",f,v,y;l===this.TRUST_LEVELS.VERIFIED?(f="Verified",v="verified",y="check-circle",s++):l===this.TRUST_LEVELS.AUTO_ACCEPTED?(f="Auto-Accepted",v="auto-accepted",y="shield-alt",n++):(f="Not Verified",v="unverified",y="info-circle",r++),t+=`
                        <div class="user-list-item ${v}">
                        <div class="user-info">
                        <div class="user-name">
                        <i class="fas fa-user"></i>
                        <strong>${this.escapeHtml(o.username)}</strong>
                        </div>
                        <div class="user-fingerprint">
                        <code>${d}</code>
                        </div>
                        </div>
                        <div class="user-actions">
                        <span class="verification-badge ${v}">
                        <i class="fas fa-${y}"></i>
                        ${f}
                        </span>
                        ${c?`
                            <button class="btn-small" onclick="KeyVerificationUI.verifyUser('${o.username}', '${c}', ${l})">
                            <i class="fas fa-fingerprint"></i> View
                            </button>
                            `:`
                            <button class="btn-small disabled" disabled>
                            <i class="fas fa-spinner fa-spin"></i> Loading
                            </button>
                            `}
                            </div>
                            </div>
                            `}let p=e.length-1,u=p>0?Math.round(s/p*100):100;a.innerHTML=`
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

                            ${p>0?`
                                <div class="security-score-banner">
                                <div class="score-circle ${100===u?"perfect":u>=50?"good":"warning"}">
                                <span class="score-number">${u}%</span>
                                <span class="score-label">Verified</span>
                                </div>
                                <div class="score-details">
                                <div class="score-item">
                                <i class="fas fa-check-circle" style="color: #10b981"></i>
                                <span>${s} Verified</span>
                                </div>
                                <div class="score-item">
                                <i class="fas fa-shield-alt" style="color: #3b82f6"></i>
                                <span>${n} Auto-Accepted</span>
                                </div>
                                <div class="score-item">
                                <i class="fas fa-info-circle" style="color: #f59e0b"></i>
                                <span>${r} Unverified</span>
                                </div>
                                </div>
                                </div>
                                `:""}

                                <div class="verification-body">
                                ${t||'<div class="empty-state"><i class="fas fa-users"></i><p>No other users in this room</p></div>'}
                                </div>

                                <div class="verification-footer">
                                <button class="btn-primary" onclick="KeyVerificationUI.showOwnFingerprint()">
                                <i class="fas fa-fingerprint"></i> Own KEY
                                </button>
                                ${r>0?`
                                    <button class="btn-auto-accept-all" onclick="KeyVerificationUI.autoAcceptAll()">
                                    <i class="fas fa-check-double"></i> Auto-Accept All
                                    </button>
                                    `:""}
                                    <button class="btn-secondary" onclick="KeyVerificationUI.closeVerificationModal()">
                                    Close
                                    </button>
                                    </div>
                                    </div>
                                    `,document.body.appendChild(a),a.querySelector(".verification-overlay").onclick=()=>{this.closeVerificationModal()}},getTrustLevel(e){return window.E2EE?window.E2EE.isPeerVerified(e)?this.TRUST_LEVELS.VERIFIED:window.E2EE.isPeerAutoAccepted&&window.E2EE.isPeerAutoAccepted(e)?this.TRUST_LEVELS.AUTO_ACCEPTED:this.TRUST_LEVELS.UNTRUSTED:this.TRUST_LEVELS.UNTRUSTED},autoAcceptAll(){if(confirm("Auto-accept all unverified keys? This is less secure than manual verification.")){if(window.E2EE&&window.StateManager){let e=0;for(let i of window.StateManager.roomUsers||[]){if(i.username!==window.StateManager.currentUser)this.getTrustLevel(i.username)===this.TRUST_LEVELS.UNTRUSTED&&(window.E2EE.markPeerAutoAccepted(i.username),e++)}window.UIManager&&window.UIManager.showNotification(`✓ Auto-accepted ${e} keys. Consider manual verification for maximum security.`,"info")}this.closeVerificationModal()}},verifyUser(e,i,a){this.showVerificationModal(e,i,a)},confirmVerification(e){window.E2EE&&window.E2EE.markPeerVerified(e),window.UIManager&&window.UIManager.showNotification(`✓ ${e}'s key manually verified - Maximum security enabled`,"success"),this.closeVerificationModal(),window.App&&window.App.updateActiveUsers&&window.App.updateActiveUsers()},unverifyKey(e){confirm(`Remove verification for ${e}? This will not affect message delivery.`)&&(window.E2EE&&(window.E2EE.verifiedPeers.delete(e),window.E2EE.autoAcceptedPeers&&window.E2EE.autoAcceptedPeers.delete(e),window.E2EE.saveVerifiedPeers()),window.UIManager&&window.UIManager.showNotification(`${e}'s key verification removed`,"info"),this.closeVerificationModal())},async showQRCode(){if(!window.E2EE||!window.E2EE.keyPair){window.UIManager&&window.UIManager.showNotification("No encryption keys available","error");return}let e=await window.E2EE.getPublicKeyFingerprint(),i=await window.E2EE.exportPublicKey();if(!e||!i){window.UIManager&&window.UIManager.showNotification("Failed to generate QR code","error");return}let a=JSON.stringify({type:"e2ee-key",version:"3.0",username:window.StateManager?window.StateManager.currentUser:"User",fingerprint:e,publicKey:i,timestamp:Date.now()}),t=document.createElement("div");t.className="key-verification-modal",t.id="key-verification-modal",t.innerHTML=`
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
                                    <code>${e.split(" ").slice(0,6).join(" ")}</code>
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
                                    `,document.body.appendChild(t),this.generateQRCode("qr-code-display",a),t.querySelector(".verification-overlay").onclick=()=>{this.closeVerificationModal()}},generateQRCode(e,i){let a=document.getElementById(e);if(a){if("undefined"!=typeof QRCode)new QRCode(a,{text:i,width:280,height:280,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});else{let t=document.createElement("script");t.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js",t.onload=()=>{new QRCode(a,{text:i,width:280,height:280,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H})},t.onerror=()=>{a.innerHTML='<p style="text-align: center; opacity: 0.7;">QR Code generation failed. Please verify manually.</p>'},document.head.appendChild(t)}}},async showQRScanner(e=null,i=null){let a=document.createElement("div");a.className="key-verification-modal",a.id="key-verification-modal",a.innerHTML=`
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
                                        `,document.body.appendChild(a),a.querySelector(".verification-overlay").onclick=()=>{this.stopQRScanner(),this.closeVerificationModal()},this.startQRScanner(e,i)},async startQRScanner(e,i){let a=document.getElementById("qr-video"),t=document.getElementById("qr-canvas");if(a&&t)try{"undefined"==typeof jsQR&&await this.loadJsQR();let s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1920},height:{ideal:1080},frameRate:{ideal:60,min:30}}});a.srcObject=s,this.qrScannerStream=s,this.qrScannerActive=!0;let n=t.getContext("2d",{willReadFrequently:!0,alpha:!1,desynchronized:!0});await new Promise(e=>{a.onloadedmetadata=()=>{a.play(),e()}});let r=0,o=0,c=performance.now(),l=()=>{if(document.getElementById("qr-video")&&this.qrScannerActive){if(a.readyState===a.HAVE_ENOUGH_DATA&&a.videoWidth>0&&a.videoHeight>0){let s=a.videoWidth,d=a.videoHeight,f=Math.floor(s/2),v=Math.floor(d/2);t.width=f,t.height=v,n.drawImage(a,0,0,f,v);let y=n.getImageData(0,0,f,v);try{let p=jsQR(y.data,y.width,y.height,{inversionAttempts:"dontInvert"});if(p&&p.data){this.qrScannerActive=!1;let u=performance.now()-c;console.log(`QR Code detected in ${u.toFixed(0)}ms (${r} frames, ${(1e3*r/u).toFixed(1)} fps)`),this.handleQRScanResult(p.data,e,i);return}}catch(h){console.error("QR decode error:",h)}r++,o++,performance.now()-c>1e3&&(console.log(`QR Scanner FPS: ${o}`),o=0,c=performance.now())}this.qrScannerActive&&requestAnimationFrame(l)}};requestAnimationFrame(l)}catch(d){console.error("QR Scanner error:",d);let f=document.getElementById("scan-result");if(f){f.style.display="block";let v="Camera access denied or not available. Please verify keys manually.";"NotAllowedError"===d.name?v="Camera access denied. Please allow camera permissions and try again.":"NotFoundError"===d.name?v="No camera found on this device. Please verify keys manually.":"NotReadableError"===d.name&&(v="Camera is already in use by another application."),f.innerHTML=`
                                            <div class="verification-info warning">
                                            <i class="fas fa-exclamation-triangle"></i>
                                            <p>${v}</p>
                                            </div>
                                            `}}},loadJsQR:async()=>new Promise((e,i)=>{let a=document.createElement("script");a.src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js",a.onload=e,a.onerror=i,document.head.appendChild(a)}),async handleQRScanResult(e,i,a){this.stopQRScanner();try{let t=JSON.parse(e);if("e2ee-key"!==t.type||!t.username||!t.fingerprint||!t.publicKey)throw Error("Invalid QR code format");let s=document.getElementById("scan-result");if(i&&t.username!==i){s&&(s.style.display="block",s.innerHTML=`
                                                <div class="verification-info warning">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                <p><strong>Warning:</strong> This QR code is for "${this.escapeHtml(t.username)}", but you expected "${this.escapeHtml(i)}".</p>
                                                </div>
                                                `);return}if(a&&t.fingerprint!==a){s&&(s.style.display="block",s.innerHTML=`
                                                    <div class="verification-info warning">
                                                    <i class="fas fa-times-circle"></i>
                                                    <p><strong>Verification Failed:</strong> Fingerprint mismatch! This could indicate a security issue.</p>
                                                    </div>
                                                    `),window.UIManager&&window.UIManager.showNotification("⚠️ Fingerprint mismatch detected!","error");return}window.E2EE&&await window.E2EE.importPublicKey(t.username,t.publicKey)&&await window.E2EE.verifyPeerFingerprint(t.username,t.fingerprint)&&(s&&(s.style.display="block",s.innerHTML=`
                                                    <div class="verification-info success">
                                                    <i class="fas fa-check-circle"></i>
                                                    <p><strong>Success!</strong> ${this.escapeHtml(t.username)}'s key verified automatically via QR code.</p>
                                                    </div>
                                                    `),window.UIManager&&window.UIManager.showNotification(`✓ ${t.username}'s key verified via QR scan`,"success"),setTimeout(()=>{this.closeVerificationModal()},2e3))}catch(n){console.error("QR scan handling error:",n);let r=document.getElementById("scan-result");r&&(r.style.display="block",r.innerHTML=`
                                                        <div class="verification-info warning">
                                                        <i class="fas fa-exclamation-triangle"></i>
                                                        <p>Invalid QR code. Please try again or verify manually.</p>
                                                        </div>
                                                        `)}},stopQRScanner(){this.qrScannerTimeout&&(clearTimeout(this.qrScannerTimeout),this.qrScannerTimeout=null),this.qrScannerStream&&(this.qrScannerStream.getTracks().forEach(e=>e.stop()),this.qrScannerStream=null)},async rotateKeys(){confirm("Rotate encryption keys? This will re-encrypt all stored messages.")&&(this.closeVerificationModal(),window.UIManager&&window.UIManager.showNotification("Rotating keys...","info"),window.E2EE)&&await window.E2EE.rotateKeysWithMessages()&&window.UIManager&&window.UIManager.showNotification("✓ Keys rotated successfully","success")},async exportBackup(){let e=prompt("Enter a strong password to encrypt your backup:");if(e){if(e.length<8){alert("Password must be at least 8 characters");return}if(window.UIManager&&window.UIManager.showNotification("Creating encrypted backup...","info"),window.E2EE){let i=await window.E2EE.exportMessagesBackup(e);if(i){let a=new Blob([JSON.stringify(i,null,2)],{type:"application/json"}),t=URL.createObjectURL(a),s=document.createElement("a");s.href=t,s.download=`e2ee-backup-${Date.now()}.json`,s.click(),URL.revokeObjectURL(t),window.UIManager&&window.UIManager.showNotification("✓ Backup downloaded successfully","success")}}}},showDebugInfo(){if(!window.E2EE)return;let e=window.E2EE.getDebugInfo();alert(`E2EE Debug Information:

                                                            Has KeyPair: ${e.hasKeyPair}
                                                            Key Age: ${e.keyAge?Math.floor(e.keyAge/864e5)+" days":"N/A"}
                                                            Keys Expired: ${e.keysExpired}
                                                            Needs Rotation: ${e.needsRotation}
                                                            Peer Count: ${e.peerCount}
                                                            Verified Peers: ${e.verifiedPeerCount}
                                                            Failed Decryptions: ${e.failedDecryptions}
                                                            Session Keys: ${e.sessionKeys}
                                                            Rotation Scheduler: ${e.rotationSchedulerActive?"Active":"Inactive"}
                                                            Secure Storage: ${e.secureStorage}`)},copyFingerprint(e){navigator.clipboard.writeText(e).then(()=>{window.UIManager&&window.UIManager.showNotification("\uD83D\uDCCB Fingerprint copied","info")}).catch(e=>{console.error("Failed to copy:",e)})},closeVerificationModal(){this.stopQRScanner();let e=document.getElementById("key-verification-modal");e&&e.remove()},showDecryptionError(e,i){let a=document.querySelector(`[data-message-id="${e}"]`);if(!a)return;let t=document.createElement("div");t.className="decryption-error-badge",t.innerHTML=`
                                                            <i class="fas fa-exclamation-triangle"></i>
                                                            <span>Decryption failed</span>
                                                            <button class="retry-btn" onclick="KeyVerificationUI.retryDecryption('${e}')">
                                                            <i class="fas fa-redo"></i> Retry
                                                            </button>
                                                            `;let s=a.querySelector(".message-content");if(s){let n=s.querySelector(".decryption-error-badge");n&&n.remove(),s.appendChild(t)}},async retryDecryption(e){window.App&&window.App.retryMessageDecryption&&await window.App.retryMessageDecryption(e)},addVerificationButton(){let e=document.querySelector(".chat-header .header-content");if(!e||document.getElementById("verify-keys-btn"))return;let i=document.createElement("button");i.id="verify-keys-btn",i.className="icon-button",i.setAttribute("aria-label","View encryption status"),i.innerHTML='<i class="fas fa-shield-alt"></i>',i.onclick=()=>{window.StateManager&&window.StateManager.roomUsers&&this.showUserList(window.StateManager.roomUsers,window.StateManager.currentUser)};let a=document.getElementById("download-history-button");a?a.parentNode.insertBefore(i,a):e.appendChild(i)},escapeHtml(e){let i=document.createElement("div");return i.textContent=e,i.innerHTML},init(){"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>{setTimeout(()=>this.addVerificationButton(),1e3)}):setTimeout(()=>this.addVerificationButton(),1e3),window.E2EE&&window.E2EE.loadVerifiedPeers()}};"undefined"!=typeof window&&(window.KeyVerificationUI=KeyVerificationUI,KeyVerificationUI.init()),"undefined"!=typeof module&&(module.exports=KeyVerificationUI);
