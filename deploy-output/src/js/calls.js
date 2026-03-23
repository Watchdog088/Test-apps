/**
 * ConnectHub WebRTC Calling System
 * Handles voice and video calls using WebRTC technology
 */

class CallManager {
    constructor() {
        this.localVideo = null;
        this.remoteVideo = null;
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.socket = null;
        this.currentCall = null;
        this.isCallActive = false;

        // WebRTC Configuration
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        };

        this.initializeCallInterface();
        this.setupSocketListeners();
    }

    initializeCallInterface() {
        // Create call overlay HTML
        const callOverlay = document.createElement('div');
        callOverlay.id = 'call-overlay';
        callOverlay.className = 'call-overlay hidden';
        callOverlay.innerHTML = `
            <div class="call-container">
                <div class="call-header">
                    <div class="call-user-info">
                        <img src="" alt="" class="call-avatar" id="call-user-avatar">
                        <div class="call-user-details">
                            <h3 id="call-user-name">Loading...</h3>
                            <p id="call-status">Connecting...</p>
                        </div>
                    </div>
                    <div class="call-timer" id="call-timer">00:00</div>
                </div>

                <div class="video-container">
                    <video id="remote-video" autoplay playsinline class="remote-video"></video>
                    <video id="local-video" autoplay playsinline muted class="local-video"></video>
                </div>

                <div class="call-controls">
                    <button id="mute-audio-btn" class="call-btn" title="Mute/Unmute">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button id="toggle-camera-btn" class="call-btn" title="Camera On/Off">
                        <i class="fas fa-video"></i>
                    </button>
                    <button id="switch-camera-btn" class="call-btn" title="Switch Camera" style="display: none;">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button id="end-call-btn" class="call-btn end-call" title="End Call">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                </div>
            </div>

            <!-- Incoming call notification -->
            <div class="incoming-call hidden" id="incoming-call">
                <div class="incoming-call-info">
                    <img src="" alt="" class="incoming-avatar" id="incoming-user-avatar">
                    <div class="incoming-details">
                        <h3 id="incoming-user-name">Incoming Call</h3>
                        <p id="incoming-call-type">Video Call</p>
                    </div>
                </div>
                <div class="incoming-call-actions">
                    <button id="decline-call-btn" class="call-btn decline">
                        <i class="fas fa-phone-slash"></i>
                    </button>
                    <button id="accept-call-btn" class="call-btn accept">
                        <i class="fas fa-phone"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(callOverlay);
        this.bindCallControls();
    }

    bindCallControls() {
        // Call control buttons
        document.getElementById('mute-audio-btn').onclick = () => this.toggleAudio();
        document.getElementById('toggle-camera-btn').onclick = () => this.toggleVideo();
        document.getElementById('switch-camera-btn').onclick = () => this.switchCamera();
        document.getElementById('end-call-btn').onclick = () => this.endCall();

        // Incoming call buttons
        document.getElementById('accept-call-btn').onclick = () => this.acceptCall();
        document.getElementById('decline-call-btn').onclick = () => this.declineCall();
    }

    setupSocketListeners() {
        // WebSocket event listeners for call signaling
        document.addEventListener('socketConnected', (e) => {
            this.socket = e.detail.socket;
            
            this.socket.on('incoming_call', (data) => this.handleIncomingCall(data));
            this.socket.on('call_accepted', (data) => this.handleCallAccepted(data));
            this.socket.on('call_declined', (data) => this.handleCallDeclined(data));
            this.socket.on('call_ended', (data) => this.handleCallEnded(data));
            this.socket.on('webrtc_offer', (data) => this.handleOffer(data));
            this.socket.on('webrtc_answer', (data) => this.handleAnswer(data));
            this.socket.on('webrtc_ice_candidate', (data) => this.handleIceCandidate(data));
        });
    }

    async initiateCall(recipientId, callType = 'video') {
        try {
            const response = await fetch('/api/v1/calls/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ recipientId, callType })
            });

            const result = await response.json();
            if (result.success) {
                this.currentCall = result.data;
                this.showCallInterface();
                this.updateCallStatus('Calling...');
                await this.setupLocalMedia(callType);
                await this.createPeerConnection();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Failed to initiate call:', error);
            this.showNotification('Failed to start call: ' + error.message);
        }
    }

    async handleIncomingCall(data) {
        this.currentCall = data;
        this.showIncomingCall(data);
    }

    async acceptCall() {
        try {
            const response = await fetch('/api/v1/calls/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    callId: this.currentCall.callId,
                    action: 'accept'
                })
            });

            const result = await response.json();
            if (result.success) {
                this.hideIncomingCall();
                this.showCallInterface();
                await this.setupLocalMedia(this.currentCall.callType);
                await this.createPeerConnection();
                this.updateCallStatus('Connected');
                this.startCallTimer();
            }
        } catch (error) {
            console.error('Failed to accept call:', error);
        }
    }

    async declineCall() {
        try {
            await fetch('/api/v1/calls/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    callId: this.currentCall.callId,
                    action: 'decline'
                })
            });

            this.hideIncomingCall();
            this.currentCall = null;
        } catch (error) {
            console.error('Failed to decline call:', error);
        }
    }

    async endCall() {
        try {
            if (this.currentCall) {
                await fetch('/api/v1/calls/action', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        callId: this.currentCall.callId,
                        action: 'end'
                    })
                });
            }

            this.cleanup();
        } catch (error) {
            console.error('Failed to end call:', error);
            this.cleanup(); // Cleanup anyway
        }
    }

    async setupLocalMedia(callType) {
        try {
            const constraints = {
                audio: true,
                video: callType === 'video' ? {
                    width: { min: 320, ideal: 640, max: 1280 },
                    height: { min: 240, ideal: 480, max: 720 },
                    frameRate: { ideal: 30, max: 30 }
                } : false
            };

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.localVideo = document.getElementById('local-video');
            if (this.localVideo) {
                this.localVideo.srcObject = this.localStream;
            }

            // Show/hide video elements based on call type
            if (callType === 'voice') {
                document.querySelector('.video-container').style.display = 'none';
                document.getElementById('toggle-camera-btn').style.display = 'none';
                document.getElementById('switch-camera-btn').style.display = 'none';
            }

        } catch (error) {
            console.error('Failed to get user media:', error);
            this.showNotification('Failed to access camera/microphone');
        }
    }

    async createPeerConnection() {
        this.peerConnection = new RTCPeerConnection(this.configuration);

        // Add local stream tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });
        }

        // Handle remote stream
        this.peerConnection.ontrack = (event) => {
            this.remoteStream = event.streams[0];
            this.remoteVideo = document.getElementById('remote-video');
            if (this.remoteVideo) {
                this.remoteVideo.srcObject = this.remoteStream;
            }
        };

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendIceCandidate(event.candidate);
            }
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection.connectionState;
            console.log('Connection state:', state);
            
            if (state === 'connected') {
                this.updateCallStatus('Connected');
                this.startCallTimer();
            } else if (state === 'disconnected' || state === 'failed') {
                this.updateCallStatus('Connection lost');
                this.endCall();
            }
        };
    }

    async handleOffer(data) {
        await this.createPeerConnection();
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
        
        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        
        this.sendAnswer(answer, data.senderId);
    }

    async handleAnswer(data) {
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        this.updateCallStatus('Connected');
        this.startCallTimer();
    }

    async handleIceCandidate(data) {
        if (this.peerConnection) {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    }

    async sendOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
        
        await fetch('/api/v1/calls/signal/offer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                callId: this.currentCall.callId,
                offer: offer,
                recipientId: this.currentCall.recipient.id
            })
        });
    }

    async sendAnswer(answer, callerId) {
        await fetch('/api/v1/calls/signal/answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                callId: this.currentCall.callId,
                answer: answer,
                callerId: callerId
            })
        });
    }

    async sendIceCandidate(candidate) {
        const recipientId = this.currentCall.caller ? 
            this.currentCall.caller.id : this.currentCall.recipient.id;
            
        await fetch('/api/v1/calls/signal/ice-candidate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                callId: this.currentCall.callId,
                candidate: candidate,
                recipientId: recipientId
            })
        });
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTracks = this.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            
            const btn = document.getElementById('mute-audio-btn');
            const icon = btn.querySelector('i');
            icon.className = audioTracks[0]?.enabled ? 'fas fa-microphone' : 'fas fa-microphone-slash';
            btn.classList.toggle('muted', !audioTracks[0]?.enabled);
        }
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTracks = this.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !track.enabled;
            });
            
            const btn = document.getElementById('toggle-camera-btn');
            const icon = btn.querySelector('i');
            icon.className = videoTracks[0]?.enabled ? 'fas fa-video' : 'fas fa-video-slash';
            btn.classList.toggle('video-off', !videoTracks[0]?.enabled);
        }
    }

    async switchCamera() {
        // Implementation for switching between front and back camera on mobile
        try {
            const videoTracks = this.localStream.getVideoTracks();
            if (videoTracks.length > 0) {
                videoTracks[0].stop();
                
                const currentFacingMode = videoTracks[0].getSettings().facingMode;
                const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
                
                const constraints = {
                    audio: true,
                    video: { facingMode: newFacingMode }
                };
                
                this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
                this.localVideo.srcObject = this.localStream;
                
                // Replace track in peer connection
                const sender = this.peerConnection.getSenders().find(
                    s => s.track && s.track.kind === 'video'
                );
                if (sender) {
                    await sender.replaceTrack(this.localStream.getVideoTracks()[0]);
                }
            }
        } catch (error) {
            console.error('Failed to switch camera:', error);
        }
    }

    showCallInterface() {
        document.getElementById('call-overlay').classList.remove('hidden');
        this.isCallActive = true;
    }

    hideCallInterface() {
        document.getElementById('call-overlay').classList.add('hidden');
        this.isCallActive = false;
    }

    showIncomingCall(callData) {
        const incomingCall = document.getElementById('incoming-call');
        document.getElementById('incoming-user-name').textContent = callData.caller.username;
        document.getElementById('incoming-user-avatar').src = callData.caller.avatar || '/src/assets/default-avatar.png';
        document.getElementById('incoming-call-type').textContent = 
            callData.callType === 'video' ? 'Video Call' : 'Voice Call';
        
        incomingCall.classList.remove('hidden');
        document.getElementById('call-overlay').classList.remove('hidden');
    }

    hideIncomingCall() {
        document.getElementById('incoming-call').classList.add('hidden');
    }

    updateCallStatus(status) {
        document.getElementById('call-status').textContent = status;
    }

    startCallTimer() {
        let seconds = 0;
        this.callTimer = setInterval(() => {
            seconds++;
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            document.getElementById('call-timer').textContent = timeString;
        }, 1000);
    }

    stopCallTimer() {
        if (this.callTimer) {
            clearInterval(this.callTimer);
            this.callTimer = null;
        }
    }

    handleCallEnded(data) {
        this.showNotification(`Call ended by ${data.endedBy.username}`);
        this.cleanup();
    }

    handleCallDeclined(data) {
        this.showNotification('Call declined');
        this.cleanup();
    }

    handleCallAccepted(data) {
        this.updateCallStatus('Accepted');
        this.sendOffer(); // Caller sends offer when call is accepted
    }

    cleanup() {
        // Stop all streams
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }

        // Close peer connection
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        // Clean up UI
        this.hideCallInterface();
        this.stopCallTimer();
        
        // Reset state
        this.currentCall = null;
        this.isCallActive = false;
    }

    showNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.className = 'call-notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize the call manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.callManager = new CallManager();
});

// Export for use in other modules
export { CallManager };
