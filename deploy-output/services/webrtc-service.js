/**
 * WebRTC Service for ConnectHub
 * Handles real-time communication for live streaming and video calls
 */

class WebRTCService {
    constructor() {
        this.peerConnections = new Map();
        this.localStream = null;
        this.screenStream = null;
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' }
            ]
        };
        this.isStreaming = false;
        this.streamType = null; // 'broadcast' or 'call'
        this.mediaConstraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        };
    }

    /**
     * Initialize local media stream for broadcasting
     */
    async initializeBroadcastStream(constraints = this.mediaConstraints) {
        try {
            if (this.localStream) {
                this.stopLocalStream();
            }

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.streamType = 'broadcast';
            this.isStreaming = true;

            console.log('Broadcast stream initialized', this.localStream);
            return {
                success: true,
                stream: this.localStream,
                videoTrack: this.localStream.getVideoTracks()[0],
                audioTrack: this.localStream.getAudioTracks()[0]
            };
        } catch (error) {
            console.error('Error initializing broadcast stream:', error);
            return {
                success: false,
                error: this.getMediaErrorMessage(error)
            };
        }
    }

    /**
     * Initialize local media stream for video calls
     */
    async initializeCallStream(constraints = this.mediaConstraints) {
        try {
            if (this.localStream) {
                this.stopLocalStream();
            }

            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.streamType = 'call';
            this.isStreaming = true;

            console.log('Call stream initialized', this.localStream);
            return {
                success: true,
                stream: this.localStream
            };
        } catch (error) {
            console.error('Error initializing call stream:', error);
            return {
                success: false,
                error: this.getMediaErrorMessage(error)
            };
        }
    }

    /**
     * Start screen sharing
     */
    async startScreenShare() {
        try {
            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: false
            });

            // Handle screen share stop event
            this.screenStream.getVideoTracks()[0].onended = () => {
                this.stopScreenShare();
            };

            console.log('Screen share started', this.screenStream);
            return {
                success: true,
                stream: this.screenStream
            };
        } catch (error) {
            console.error('Error starting screen share:', error);
            return {
                success: false,
                error: 'Screen sharing denied or not supported'
            };
        }
    }

    /**
     * Stop screen sharing
     */
    stopScreenShare() {
        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
            this.screenStream = null;
            console.log('Screen share stopped');
        }
    }

    /**
     * Toggle camera on/off
     */
    toggleCamera(enabled) {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = enabled;
                return true;
            }
        }
        return false;
    }

    /**
     * Toggle microphone on/off
     */
    toggleMicrophone(enabled) {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = enabled;
                return true;
            }
        }
        return false;
    }

    /**
     * Switch camera (front/back on mobile)
     */
    async switchCamera() {
        try {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const currentFacingMode = videoTrack.getSettings().facingMode;
            const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

            const newConstraints = {
                ...this.mediaConstraints,
                video: {
                    ...this.mediaConstraints.video,
                    facingMode: newFacingMode
                }
            };

            const newStream = await navigator.mediaDevices.getUserMedia(newConstraints);
            const newVideoTrack = newStream.getVideoTracks()[0];

            // Replace track in all peer connections
            this.peerConnections.forEach(pc => {
                const sender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            });

            // Stop old track and update local stream
            videoTrack.stop();
            this.localStream.removeTrack(videoTrack);
            this.localStream.addTrack(newVideoTrack);

            return { success: true };
        } catch (error) {
            console.error('Error switching camera:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create peer connection for broadcasting to viewer
     */
    async createBroadcastConnection(viewerId, signaling) {
        try {
            const peerConnection = new RTCPeerConnection(this.configuration);
            this.peerConnections.set(viewerId, peerConnection);

            // Add local stream tracks to peer connection
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, this.localStream);
                });
            }

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    signaling.sendIceCandidate(viewerId, event.candidate);
                }
            };

            // Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                console.log(`Connection state with ${viewerId}:`, peerConnection.connectionState);
                if (peerConnection.connectionState === 'failed' || 
                    peerConnection.connectionState === 'disconnected') {
                    this.removePeerConnection(viewerId);
                }
            };

            // Create and send offer
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            signaling.sendOffer(viewerId, offer);

            return { success: true, peerConnection };
        } catch (error) {
            console.error('Error creating broadcast connection:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create peer connection for video call
     */
    async createCallConnection(userId, isInitiator, signaling) {
        try {
            const peerConnection = new RTCPeerConnection(this.configuration);
            this.peerConnections.set(userId, peerConnection);

            // Add local stream tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    peerConnection.addTrack(track, this.localStream);
                });
            }

            // Handle ICE candidates
            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    signaling.sendIceCandidate(userId, event.candidate);
                }
            };

            // Handle remote stream
            peerConnection.ontrack = (event) => {
                console.log('Received remote track:', event.track.kind);
                // Emit event for UI to handle remote stream
                this.onRemoteStream?.(userId, event.streams[0]);
            };

            // Handle connection state changes
            peerConnection.onconnectionstatechange = () => {
                console.log(`Call connection state with ${userId}:`, peerConnection.connectionState);
                this.onConnectionStateChange?.(userId, peerConnection.connectionState);
            };

            // If initiator, create and send offer
            if (isInitiator) {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                signaling.sendOffer(userId, offer);
            }

            return { success: true, peerConnection };
        } catch (error) {
            console.error('Error creating call connection:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle received offer
     */
    async handleOffer(userId, offer, signaling) {
        try {
            let peerConnection = this.peerConnections.get(userId);
            
            if (!peerConnection) {
                // Create new peer connection if doesn't exist
                const result = await this.createCallConnection(userId, false, signaling);
                if (!result.success) {
                    throw new Error(result.error);
                }
                peerConnection = result.peerConnection;
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
            
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            signaling.sendAnswer(userId, answer);

            return { success: true };
        } catch (error) {
            console.error('Error handling offer:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle received answer
     */
    async handleAnswer(userId, answer) {
        try {
            const peerConnection = this.peerConnections.get(userId);
            if (!peerConnection) {
                throw new Error('Peer connection not found');
            }

            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
            return { success: true };
        } catch (error) {
            console.error('Error handling answer:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Handle received ICE candidate
     */
    async handleIceCandidate(userId, candidate) {
        try {
            const peerConnection = this.peerConnections.get(userId);
            if (!peerConnection) {
                throw new Error('Peer connection not found');
            }

            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            return { success: true };
        } catch (error) {
            console.error('Error handling ICE candidate:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get stream statistics
     */
    async getStreamStats(userId) {
        try {
            const peerConnection = this.peerConnections.get(userId);
            if (!peerConnection) {
                return null;
            }

            const stats = await peerConnection.getStats();
            const statsReport = {
                video: {},
                audio: {},
                connection: {}
            };

            stats.forEach(report => {
                if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
                    statsReport.video = {
                        bytesReceived: report.bytesReceived,
                        packetsReceived: report.packetsReceived,
                        packetsLost: report.packetsLost,
                        framesDecoded: report.framesDecoded,
                        frameRate: report.framesPerSecond
                    };
                } else if (report.type === 'outbound-rtp' && report.mediaType === 'video') {
                    statsReport.video = {
                        bytesSent: report.bytesSent,
                        packetsSent: report.packetsSent,
                        framesEncoded: report.framesEncoded,
                        frameRate: report.framesPerSecond
                    };
                } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                    statsReport.connection = {
                        currentRoundTripTime: report.currentRoundTripTime,
                        availableOutgoingBitrate: report.availableOutgoingBitrate
                    };
                }
            });

            return statsReport;
        } catch (error) {
            console.error('Error getting stream stats:', error);
            return null;
        }
    }

    /**
     * Remove peer connection
     */
    removePeerConnection(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(userId);
            console.log(`Removed peer connection for ${userId}`);
        }
    }

    /**
     * Stop local stream
     */
    stopLocalStream() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        this.isStreaming = false;
    }

    /**
     * Clean up all connections
     */
    cleanup() {
        this.peerConnections.forEach((pc, userId) => {
            this.removePeerConnection(userId);
        });
        this.stopLocalStream();
        this.stopScreenShare();
        console.log('WebRTC cleanup completed');
    }

    /**
     * Get user-friendly error message
     */
    getMediaErrorMessage(error) {
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
            return 'No camera or microphone found';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            return 'Camera or microphone is already in use';
        } else if (error.name === 'OverconstrainedError') {
            return 'Camera or microphone does not meet requirements';
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
            return 'Camera and microphone access denied. Please grant permissions.';
        } else if (error.name === 'TypeError') {
            return 'No media devices available';
        }
        return 'Error accessing camera/microphone: ' + error.message;
    }

    /**
     * Check WebRTC support
     */
    static isSupported() {
        return !!(navigator.mediaDevices && 
                  navigator.mediaDevices.getUserMedia && 
                  window.RTCPeerConnection);
    }

    /**
     * Get available media devices
     */
    static async getAvailableDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                videoInputs: devices.filter(d => d.kind === 'videoinput'),
                audioInputs: devices.filter(d => d.kind === 'audioinput'),
                audioOutputs: devices.filter(d => d.kind === 'audiooutput')
            };
        } catch (error) {
            console.error('Error enumerating devices:', error);
            return {
                videoInputs: [],
                audioInputs: [],
                audioOutputs: []
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebRTCService;
}
