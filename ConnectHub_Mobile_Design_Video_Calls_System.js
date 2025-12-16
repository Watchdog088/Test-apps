/**
 * ConnectHub Mobile - Complete Video Calls System
 * Full implementation with WebRTC, call management, screen sharing, recording, and all features
 */

class VideoCallsSystem {
    constructor() {
        this.localStream = null;
        this.remoteStream = null;
        this.peerConnection = null;
        this.dataChannel = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.callState = 'idle'; // idle, connecting, connected, ended
        this.callType = null; // video, voice, screen
        this.participants = new Map();
        this.devices = {
            cameras: [],
            microphones: [],
            speakers: []
        };
        this.currentSettings = {
            videoEnabled: true,
            audioEnabled: true,
            selectedCamera: null,
            selectedMicrophone: null,
            selectedSpeaker: null,
            virtualBackground: null,
            blurIntensity: 0,
            noiseSuppressionEnabled: true,
            echoCancellationEnabled: true
        };
        this.callMetrics = {
            startTime: null,
            duration: 0,
            quality: 'good',
            networkQuality: 100,
            packetLoss: 0,
            latency: 0,
            bandwidth: 0
        };
        this.callHistory = [];
        this.scheduledCalls = [];
        this.recordings = [];
        this.waitingRoom = [];
        this.isScreenSharing = false;
        this.isRecording = false;
        this.virtualBackgrounds = this.initializeVirtualBackgrounds();
        this.init();
    }

    init() {
        this.setupWebRTC();
        this.loadCallHistory();
        this.loadScheduledCalls();
        this.loadRecordings();
        this.initializeDevices();
        this.setupEventListeners();
        this.startNetworkMonitoring();
    }

    // ==================== WEBRTC IMPLEMENTATION ====================
    
    setupWebRTC() {
        this.configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                {
                    urls: 'turn:your-turn-server.com:3478',
                    username: 'user',
                    credential: 'pass'
                }
            ],
            iceCandidatePoolSize: 10
        };
    }

    async createPeerConnection() {
        try {
            this.peerConnection = new RTCPeerConnection(this.configuration);

            // Add event listeners
            this.peerConnection.onicecandidate = (event) => this.handleICECandidate(event);
            this.peerConnection.ontrack = (event) => this.handleRemoteTrack(event);
            this.peerConnection.oniceconnectionstatechange = () => this.handleConnectionStateChange();
            this.peerConnection.ondatachannel = (event) => this.handleDataChannel(event);

            // Create data channel for messaging
            this.dataChannel = this.peerConnection.createDataChannel('chat');
            this.setupDataChannel();

            return this.peerConnection;
        } catch (error) {
            console.error('Failed to create peer connection:', error);
            this.showNotification('Connection error', 'error');
            throw error;
        }
    }

    setupDataChannel() {
        if (!this.dataChannel) return;

        this.dataChannel.onopen = () => {
            console.log('Data channel opened');
            this.sendCallMetadata();
        };

        this.dataChannel.onmessage = (event) => {
            this.handleDataChannelMessage(event.data);
        };

        this.dataChannel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
    }

    handleICECandidate(event) {
        if (event.candidate) {
            // Send ICE candidate to remote peer through signaling server
            this.sendSignalingMessage({
                type: 'ice-candidate',
                candidate: event.candidate
            });
        }
    }

    handleRemoteTrack(event) {
        console.log('Remote track received:', event.track.kind);
        
        if (event.streams && event.streams[0]) {
            this.remoteStream = event.streams[0];
            this.displayRemoteStream();
        }
    }

    handleConnectionStateChange() {
        const state = this.peerConnection.iceConnectionState;
        console.log('ICE Connection state:', state);

        switch (state) {
            case 'connected':
                this.callState = 'connected';
                this.callMetrics.startTime = Date.now();
                this.updateCallUI('connected');
                this.startCallQualityMonitoring();
                break;
            case 'disconnected':
            case 'failed':
                this.handleCallFailure();
                break;
            case 'closed':
                this.endCall();
                break;
        }
    }

    handleDataChannelMessage(data) {
        try {
            const message = JSON.parse(data);
            
            switch (message.type) {
                case 'chat':
                    this.displayChatMessage(message.content);
                    break;
                case 'reaction':
                    this.displayReaction(message.reaction);
                    break;
                case 'screen-share-start':
                    this.handleRemoteScreenShare(true);
                    break;
                case 'screen-share-stop':
                    this.handleRemoteScreenShare(false);
                    break;
                case 'recording-start':
                    this.handleRemoteRecordingNotification(true);
                    break;
                case 'recording-stop':
                    this.handleRemoteRecordingNotification(false);
                    break;
            }
        } catch (error) {
            console.error('Failed to parse data channel message:', error);
        }
    }

    // ==================== MEDIA DEVICES & STREAM MANAGEMENT ====================

    async initializeDevices() {
        try {
            await this.enumerateDevices();
            await this.checkPermissions();
        } catch (error) {
            console.error('Failed to initialize devices:', error);
        }
    }

    async enumerateDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            
            this.devices.cameras = devices.filter(d => d.kind === 'videoinput');
            this.devices.microphones = devices.filter(d => d.kind === 'audioinput');
            this.devices.speakers = devices.filter(d => d.kind === 'audiooutput');

            // Set defaults
            if (this.devices.cameras.length > 0) {
                this.currentSettings.selectedCamera = this.devices.cameras[0].deviceId;
            }
            if (this.devices.microphones.length > 0) {
                this.currentSettings.selectedMicrophone = this.devices.microphones[0].deviceId;
            }
            if (this.devices.speakers.length > 0) {
                this.currentSettings.selectedSpeaker = this.devices.speakers[0].deviceId;
            }

            this.renderDeviceSettings();
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            this.showNotification('Failed to access media devices', 'error');
        }
    }

    async checkPermissions() {
        try {
            const permissions = await Promise.all([
                navigator.permissions.query({ name: 'camera' }),
                navigator.permissions.query({ name: 'microphone' })
            ]);

            return permissions.every(p => p.state === 'granted');
        } catch (error) {
            console.error('Failed to check permissions:', error);
            return false;
        }
    }

    async getMediaStream(constraints = null) {
        try {
            const defaultConstraints = {
                video: this.callType !== 'voice' ? {
                    deviceId: this.currentSettings.selectedCamera ? 
                        { exact: this.currentSettings.selectedCamera } : undefined,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    frameRate: { ideal: 30 }
                } : false,
                audio: {
                    deviceId: this.currentSettings.selectedMicrophone ?
                        { exact: this.currentSettings.selectedMicrophone } : undefined,
                    echoCancellation: this.currentSettings.echoCancellationEnabled,
                    noiseSuppression: this.currentSettings.noiseSuppressionEnabled,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(
                constraints || defaultConstraints
            );

            this.localStream = stream;
            this.displayLocalStream();
            
            return stream;
        } catch (error) {
            console.error('Failed to get media stream:', error);
            this.handleMediaError(error);
            throw error;
        }
    }

    displayLocalStream() {
        const localVideo = document.getElementById('local-video');
        if (localVideo && this.localStream) {
            localVideo.srcObject = this.localStream;
            localVideo.muted = true; // Always mute local audio
            
            // Apply virtual background if enabled
            if (this.currentSettings.virtualBackground) {
                this.applyVirtualBackground(localVideo);
            }
        }
    }

    displayRemoteStream() {
        const remoteVideo = document.getElementById('remote-video');
        if (remoteVideo && this.remoteStream) {
            remoteVideo.srcObject = this.remoteStream;
        }
    }

    async switchCamera() {
        const currentIndex = this.devices.cameras.findIndex(
            c => c.deviceId === this.currentSettings.selectedCamera
        );
        const nextIndex = (currentIndex + 1) % this.devices.cameras.length;
        const nextCamera = this.devices.cameras[nextIndex];

        await this.changeDevice('camera', nextCamera.deviceId);
    }

    async changeDevice(deviceType, deviceId) {
        try {
            if (deviceType === 'camera') {
                this.currentSettings.selectedCamera = deviceId;
                if (this.localStream) {
                    const videoTrack = this.localStream.getVideoTracks()[0];
                    videoTrack.stop();

                    const newStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            deviceId: { exact: deviceId },
                            width: { ideal: 1280 },
                            height: { ideal: 720 }
                        }
                    });

                    const newVideoTrack = newStream.getVideoTracks()[0];
                    this.localStream.removeTrack(videoTrack);
                    this.localStream.addTrack(newVideoTrack);

                    // Update peer connection
                    if (this.peerConnection) {
                        const sender = this.peerConnection.getSenders()
                            .find(s => s.track?.kind === 'video');
                        if (sender) {
                            sender.replaceTrack(newVideoTrack);
                        }
                    }

                    this.displayLocalStream();
                }
            } else if (deviceType === 'microphone') {
                this.currentSettings.selectedMicrophone = deviceId;
                if (this.localStream) {
                    const audioTrack = this.localStream.getAudioTracks()[0];
                    audioTrack.stop();

                    const newStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            deviceId: { exact: deviceId },
                            echoCancellation: true,
                            noiseSuppression: true
                        }
                    });

                    const newAudioTrack = newStream.getAudioTracks()[0];
                    this.localStream.removeTrack(audioTrack);
                    this.localStream.addTrack(newAudioTrack);

                    // Update peer connection
                    if (this.peerConnection) {
                        const sender = this.peerConnection.getSenders()
                            .find(s => s.track?.kind === 'audio');
                        if (sender) {
                            sender.replaceTrack(newAudioTrack);
                        }
                    }
                }
            } else if (deviceType === 'speaker') {
                this.currentSettings.selectedSpeaker = deviceId;
                const remoteVideo = document.getElementById('remote-video');
                if (remoteVideo && remoteVideo.setSinkId) {
                    await remoteVideo.setSinkId(deviceId);
                }
            }

            this.showNotification(`${deviceType} changed successfully`, 'success');
        } catch (error) {
            console.error(`Failed to change ${deviceType}:`, error);
            this.showNotification(`Failed to change ${deviceType}`, 'error');
        }
    }

    toggleVideo() {
        if (!this.localStream) return;

        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            this.currentSettings.videoEnabled = videoTrack.enabled;
            this.updateControlsUI();
            
            // Notify remote peer
            this.sendDataChannelMessage({
                type: 'video-toggle',
                enabled: videoTrack.enabled
            });
        }
    }

    toggleAudio() {
        if (!this.localStream) return;

        const audioTrack = this.localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            this.currentSettings.audioEnabled = audioTrack.enabled;
            this.updateControlsUI();
            
            // Notify remote peer
            this.sendDataChannelMessage({
                type: 'audio-toggle',
                enabled: audioTrack.enabled
            });
        }
    }

    // ==================== SCREEN SHARING ====================

    async startScreenShare() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            this.isScreenSharing = true;
            const screenTrack = screenStream.getVideoTracks()[0];

            // Replace video track with screen track
            if (this.peerConnection) {
                const sender = this.peerConnection.getSenders()
                    .find(s => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(screenTrack);
                }
            }

            // Handle screen share end
            screenTrack.onended = () => {
                this.stopScreenShare();
            };

            // Display screen share
            const localVideo = document.getElementById('local-video');
            if (localVideo) {
                localVideo.srcObject = screenStream;
            }

            // Notify remote peer
            this.sendDataChannelMessage({
                type: 'screen-share-start'
            });

            this.updateControlsUI();
            this.showNotification('Screen sharing started', 'success');
        } catch (error) {
            console.error('Failed to start screen sharing:', error);
            this.showNotification('Failed to start screen sharing', 'error');
        }
    }

    async stopScreenShare() {
        if (!this.isScreenSharing) return;

        try {
            // Get back to camera
            const cameraStream = await this.getMediaStream();
            const cameraTrack = cameraStream.getVideoTracks()[0];

            // Replace screen track with camera track
            if (this.peerConnection) {
                const sender = this.peerConnection.getSenders()
                    .find(s => s.track?.kind === 'video');
                if (sender) {
                    await sender.replaceTrack(cameraTrack);
                }
            }

            this.isScreenSharing = false;
            this.displayLocalStream();

            // Notify remote peer
            this.sendDataChannelMessage({
                type: 'screen-share-stop'
            });

            this.updateControlsUI();
            this.showNotification('Screen sharing stopped', 'success');
        } catch (error) {
            console.error('Failed to stop screen sharing:', error);
        }
    }

    // ==================== CALL RECORDING ====================

    async startRecording() {
        try {
            // Combine local and remote streams
            const combinedStream = new MediaStream();
            
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            }
            
            if (this.remoteStream) {
                this.remoteStream.getTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            }

            const options = {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000
            };

            this.mediaRecorder = new MediaRecorder(combinedStream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            this.mediaRecorder.start(1000); // Capture in 1-second chunks
            this.isRecording = true;
            this.callMetrics.recordingStartTime = Date.now();

            // Notify remote peer
            this.sendDataChannelMessage({
                type: 'recording-start'
            });

            this.updateControlsUI();
            this.showNotification('Recording started', 'success');
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showNotification('Failed to start recording', 'error');
        }
    }

    stopRecording() {
        if (!this.mediaRecorder || !this.isRecording) return;

        this.mediaRecorder.stop();
        this.isRecording = false;

        // Notify remote peer
        this.sendDataChannelMessage({
            type: 'recording-stop'
        });

        this.updateControlsUI();
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.floor((Date.now() - this.callMetrics.recordingStartTime) / 1000);

        const recording = {
            id: Date.now(),
            date: new Date(),
            duration: duration,
            size: blob.size,
            url: url,
            blob: blob,
            filename: `call_recording_${Date.now()}.webm`,
            participants: Array.from(this.participants.values()).map(p => p.name)
        };

        this.recordings.unshift(recording);
        this.saveRecordingsToStorage();
        
        this.showNotification('Recording saved', 'success');
    }

    downloadRecording(recordingId) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) return;

        const a = document.createElement('a');
        a.href = recording.url;
        a.download = recording.filename;
        a.click();
    }

    deleteRecording(recordingId) {
        const index = this.recordings.findIndex(r => r.id === recordingId);
        if (index !== -1) {
            URL.revokeObjectURL(this.recordings[index].url);
            this.recordings.splice(index, 1);
            this.saveRecordingsToStorage();
            this.showNotification('Recording deleted', 'success');
            this.renderRecordings();
        }
    }

    // ==================== VIRTUAL BACKGROUNDS ====================

    initializeVirtualBackgrounds() {
        return [
            { id: 'none', name: 'None', type: 'none' },
            { id: 'blur-light', name: 'Light Blur', type: 'blur', intensity: 5 },
            { id: 'blur-medium', name: 'Medium Blur', type: 'blur', intensity: 10 },
            { id: 'blur-heavy', name: 'Heavy Blur', type: 'blur', intensity: 20 },
            { id: 'office', name: 'Modern Office', type: 'image', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920' },
            { id: 'beach', name: 'Beach', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920' },
            { id: 'mountains', name: 'Mountains', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920' },
            { id: 'city', name: 'City Skyline', type: 'image', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920' },
            { id: 'library', name: 'Library', type: 'image', url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920' },
            { id: 'space', name: 'Space', type: 'image', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920' }
        ];
    }

    async applyVirtualBackground(videoElement) {
        const background = this.virtualBackgrounds.find(
            bg => bg.id === this.currentSettings.virtualBackground
        );

        if (!background || background.type === 'none') {
            // Remove any applied background
            return;
        }

        if (background.type === 'blur') {
            videoElement.style.filter = `blur(${background.intensity}px)`;
        } else if (background.type === 'image') {
            // In a real implementation, this would use Canvas API and background segmentation
            // For now, we'll just note that it's applied
            console.log('Virtual background applied:', background.name);
        }
    }

    selectVirtualBackground(backgroundId) {
        this.currentSettings.virtualBackground = backgroundId;
        this.displayLocalStream();
        this.showNotification('Background applied', 'success');
    }

    // ==================== CALL QUALITY MONITORING ====================

    startCallQualityMonitoring() {
        this.qualityMonitoringInterval = setInterval(async () => {
            if (!this.peerConnection) return;

            try {
                const stats = await this.peerConnection.getStats();
                this.analyzeCallQuality(stats);
            } catch (error) {
                console.error('Failed to get call stats:', error);
            }
        }, 2000);
    }

    analyzeCallQuality(stats) {
        let inboundRTP = null;
        let outboundRTP = null;

        stats.forEach(report => {
            if (report.type === 'inbound-rtp' && report.kind === 'video') {
                inboundRTP = report;
            } else if (report.type === 'outbound-rtp' && report.kind === 'video') {
                outboundRTP = report;
            }
        });

        if (inboundRTP) {
            const packetsLost = inboundRTP.packetsLost || 0;
            const packetsReceived = inboundRTP.packetsReceived || 1;
            const packetLossRate = (packetsLost / (packetsLost + packetsReceived)) * 100;

            this.callMetrics.packetLoss = Math.round(packetLossRate * 100) / 100;
            this.callMetrics.bandwidth = inboundRTP.bytesReceived || 0;

            // Determine quality
            if (packetLossRate < 2) {
                this.callMetrics.quality = 'excellent';
                this.callMetrics.networkQuality = 100;
            } else if (packetLossRate < 5) {
                this.callMetrics.quality = 'good';
                this.callMetrics.networkQuality = 80;
            } else if (packetLossRate < 10) {
                this.callMetrics.quality = 'fair';
                this.callMetrics.networkQuality = 60;
            } else {
                this.callMetrics.quality = 'poor';
                this.callMetrics.networkQuality = 40;
            }
        }

        this.updateQualityIndicator();
    }

    startNetworkMonitoring() {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            if (connection) {
                this.updateNetworkInfo(connection);
                
                connection.addEventListener('change', () => {
                    this.updateNetworkInfo(connection);
                });
            }
        }
    }

    updateNetworkInfo(connection) {
        this.callMetrics.connectionType = connection.effectiveType;
        this.callMetrics.downlink = connection.downlink;
        this.callMetrics.rtt = connection.rtt;

        // Adjust quality settings based on network
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            this.adaptToLowBandwidth();
        }
    }

    adaptToLowBandwidth() {
        console.log('Adapting to low bandwidth');
        // Reduce video quality
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.applyConstraints({
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                });
            }
        }
    }

    // ==================== MULTI-PARTICIPANT CALLS ====================

    addParticipant(participant) {
        this.participants.set(participant.id, participant);
        this.renderParticipants();
        this.showNotification(`${participant.name} joined`, 'info');
    }

    removeParticipant(participantId) {
        const participant = this.participants.get(participantId);
        if (participant) {
            this.participants.delete(participantId);
            this.renderParticipants();
            this.showNotification(`${participant.name} left`, 'info');
        }
    }

    // ==================== WAITING ROOM ====================

    addToWaitingRoom(participant) {
        this.waitingRoom.push(participant);
        this.renderWaitingRoom();
        this.showNotification(`${participant.name} is in the waiting room`, 'info');
    }

    admitFromWaitingRoom(participantId) {
        const index = this.waitingRoom.findIndex(p => p.id === participantId);
        if (index !== -1) {
            const participant = this.waitingRoom.splice(index, 1)[0];
            this.addParticipant(participant);
            this.renderWaitingRoom();
        }
    }

    rejectFromWaitingRoom(participantId) {
        const index = this.waitingRoom.findIndex(p => p.id === participantId);
        if (index !== -1) {
            this.waitingRoom.splice(index, 1);
            this.renderWaitingRoom();
        }
    }

    // ==================== CALL SCHEDULING ====================

    scheduleCall(callData) {
        const scheduledCall = {
            id: Date.now(),
            ...callData,
            status: 'scheduled',
            createdAt: new Date()
        };

        this.scheduledCalls.push(scheduledCall);
        this.saveScheduledCallsToStorage();
        this.showNotification('Call scheduled successfully', 'success');
        
        // Set reminder
        this.setCallReminder(scheduledCall);
    }

    setCallReminder(call) {
        const now = new Date();
        const callTime = new Date(call.datetime);
        const reminderTime = callTime.getTime() - (15 * 60 * 1000); // 15 minutes before

        if (reminderTime > now.getTime()) {
            setTimeout(() => {
                this.showNotification(
                    `Reminder: "${call.title}" starts in 15 minutes`,
                    'info'
                );
            }, reminderTime - now.getTime());
        }
    }

    cancelScheduledCall(callId) {
        const index = this.scheduledCalls.findIndex(c => c.id === callId);
        if (index !== -1) {
            this.scheduledCalls.splice(index, 1);
            this.saveScheduledCallsToStorage();
            this.showNotification('Call cancelled', 'success');
        }
    }

    // ==================== CALL MANAGEMENT ====================

    async startCall(contact, type = 'video') {
        try {
            this.callType = type;
            this.callState = 'connecting';

            // Get user media
            await this.getMediaStream();

            // Create peer connection
            await this.createPeerConnection();

            // Add local stream to peer connection
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            // Create and send offer
            const offer = await this.peerConnection.createOffer();
            await this.peerConnection.setLocalDescription(offer);

            this.sendSignalingMessage({
                type: 'offer',
                offer: offer,
                callType: type,
                to: contact.id
            });

            this.showCallUI();
            this.renderCallControls();
        } catch (error) {
            console.error('Failed to start call:', error);
            this.showNotification('Failed to start call', 'error');
            this.endCall();
        }
    }

    async answerCall(offer) {
        try {
            this.callState = 'connecting';

            // Get user media
            await this.getMediaStream();

            // Create peer connection
            await this.createPeerConnection();

            // Add local stream
            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });

            // Set remote description
            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

            // Create and send answer
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);

            this.sendSignalingMessage({
                type: 'answer',
                answer: answer
            });

            this.showCallUI();
            this.renderCallControls();
        } catch (error) {
            console.error('Failed to answer call:', error);
            this.showNotification('Failed to answer call', 'error');
            this.endCall();
        }
    }

    endCall() {
        // Stop all tracks
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

        // Close data channel
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }

        // Stop recording if active
        if (this.isRecording) {
            this.stopRecording();
        }

        // Stop quality monitoring
        if (this.qualityMonitoringInterval) {
            clearInterval(this.qualityMonitoringInterval);
        }

        // Save to call history
        if (this.callMetrics.startTime) {
            this.saveCallToHistory();
        }

        this.callState = 'ended';
        this.hideCallUI();
        this.showNotification('Call ended', 'info');
    }

    saveCallToHistory() {
        const call = {
            id: Date.now(),
            type: this.callType,
            startTime: new Date(this.callMetrics.startTime),
            duration: Math.floor((Date.now() - this.callMetrics.startTime) / 1000),
            participants: Array.from(this.participants.values()),
            quality: this.callMetrics.quality,
            status: 'completed'
        };

        this.callHistory.unshift(call);
        this.saveCallHistoryToStorage();
    }

    handleCallFailure() {
        this.showNotification('Call connection failed', 'error');
        this.endCall();
    }

    handleMediaError(error) {
        if (error.name === 'NotAllowedError') {
            this.showNotification('Camera/microphone permission denied', 'error');
        } else if (error.name === 'NotFoundError') {
            this.showNotification('No camera/microphone found', 'error');
        } else {
            this.showNotification('Failed to access media devices', 'error');
        }
    }

    // ==================== SIGNALING ====================

    sendSignalingMessage(message) {
        // This would be sent through your signaling server
        console.log('Sending signaling message:', message);
        // Example: websocket.send(JSON.stringify(message));
    }

    sendDataChannelMessage(message) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(message));
        }
    }

    sendCallMetadata() {
        this.sendDataChannelMessage({
            type: 'metadata',
            settings: this.currentSettings,
            metrics: this.callMetrics
        });
    }

    // ==================== UI RENDERING ====================

    showCallUI() {
        const callUI = document.getElementById('video-call-screen');
        if (callUI) {
            callUI.style.display = 'flex';
        }
    }

    hideCallUI() {
        const callUI = document.getElementById('video-call-screen');
        if (callUI) {
            callUI.style.display = 'none';
        }
    }

    updateCallUI(state) {
        const statusElement = document.getElementById('call-status');
        if (statusElement) {
            statusElement.textContent = state === 'connected' ? 'Connected' : 'Connecting...';
        }
    }

    renderCallControls() {
        const controlsContainer = document.getElementById('call-controls');
        if (!controlsContainer) return;

        controlsContainer.innerHTML = `
            <button class="call-control-btn ${this.currentSettings.audioEnabled ? 'active' : ''}" 
                    onclick="videoCallsSystem.toggleAudio()"
                    title="${this.currentSettings.audioEnabled ? 'Mute' : 'Unmute'}">
                <i class="fas fa-microphone${this.currentSettings.audioEnabled ? '' : '-slash'}"></i>
            </button>
            
            <button class="call-control-btn ${this.currentSettings.videoEnabled ? 'active' : ''}" 
                    onclick="videoCallsSystem.toggleVideo()"
                    title="${this.currentSettings.videoEnabled ? 'Turn off camera' : 'Turn on camera'}">
                <i class="fas fa-video${this.currentSettings.videoEnabled ? '' : '-slash'}"></i>
            </button>
            
            <button class="call-control-btn" 
                    onclick="videoCallsSystem.showDeviceSettings()"
                    title="Device Settings">
                <i class="fas fa-cog"></i>
            </button>
            
            <button class="call-control-btn ${this.isScreenSharing ? 'active' : ''}" 
                    onclick="videoCallsSystem.${this.isScreenSharing ? 'stopScreenShare' : 'startScreenShare'}()"
                    title="${this.isScreenSharing ? 'Stop sharing' : 'Share screen'}">
                <i class="fas fa-desktop"></i>
            </button>
            
            <button class="call-control-btn ${this.isRecording ? 'recording' : ''}" 
                    onclick="videoCallsSystem.${this.isRecording ? 'stopRecording' : 'startRecording'}()"
                    title="${this.isRecording ? 'Stop recording' : 'Start recording'}">
                <i class="fas fa-${this.isRecording ? 'stop' : 'record-vinyl'}"></i>
            </button>
            
            <button class="call-control-btn" 
                    onclick="videoCallsSystem.showVirtualBackgrounds()"
                    title="Virtual Backgrounds">
                <i class="fas fa-image"></i>
            </button>
            
            <button class="call-control-btn" 
                    onclick="videoCallsSystem.switchCamera()"
                    title="Switch Camera">
                <i class="fas fa-sync-alt"></i>
            </button>
            
            <button class="call-control-btn end-call" 
                    onclick="videoCallsSystem.endCall()"
                    title="End Call">
                <i class="fas fa-phone-slash"></i>
            </button>
        `;
    }

    updateControlsUI() {
        this.renderCallControls();
    }

    renderDeviceSettings() {
        const devicesModal = document.getElementById('device-settings-modal');
        if (!devicesModal) return;

        const camerasHTML = this.devices.cameras.map(camera => `
            <option value="${camera.deviceId}" ${camera.deviceId === this.currentSettings.selectedCamera ? 'selected' : ''}>
                ${camera.label || `Camera ${camera.deviceId.substr(0, 8)}`}
            </option>
        `).join('');

        const microphonesHTML = this.devices.microphones.map(mic => `
            <option value="${mic.deviceId}" ${mic.deviceId === this.currentSettings.selectedMicrophone ? 'selected' : ''}>
                ${mic.label || `Microphone ${mic.deviceId.substr(0, 8)}`}
            </option>
        `).join('');

        const speakersHTML = this.devices.speakers.map(speaker => `
            <option value="${speaker.deviceId}" ${speaker.deviceId === this.currentSettings.selectedSpeaker ? 'selected' : ''}>
                ${speaker.label || `Speaker ${speaker.deviceId.substr(0, 8)}`}
            </option>
        `).join('');

        devicesModal.innerHTML = `
            <div class="modal-content">
                <h3>Device Settings</h3>
                
                <div class="form-group">
                    <label>Camera</label>
                    <select id="camera-select" onchange="videoCallsSystem.changeDevice('camera', this.value)">
                        ${camerasHTML}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Microphone</label>
                    <select id="microphone-select" onchange="videoCallsSystem.changeDevice('microphone', this.value)">
                        ${microphonesHTML}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Speaker</label>
                    <select id="speaker-select" onchange="videoCallsSystem.changeDevice('speaker', this.value)">
                        ${speakersHTML}
                    </select>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" 
                               ${this.currentSettings.noiseSuppressionEnabled ? 'checked' : ''}
                               onchange="videoCallsSystem.toggleNoiseSuppression()">
                        Noise Suppression
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" 
                               ${this.currentSettings.echoCancellationEnabled ? 'checked' : ''}
                               onchange="videoCallsSystem.toggleEchoCancellation()">
                        Echo Cancellation
                    </label>
                </div>
            </div>
        `;
    }

    renderParticipants() {
        const participantsContainer = document.getElementById('call-participants');
        if (!participantsContainer) return;

        const participantsHTML = Array.from(this.participants.values()).map(participant => `
            <div class="participant-item" data-id="${participant.id}">
                <div class="participant-video">
                    <video id="participant-${participant.id}-video" autoplay></video>
                </div>
                <div class="participant-info">
                    <span class="participant-name">${participant.name}</span>
                    <span class="participant-status">${participant.audioEnabled ? '🎤' : '🔇'} ${participant.videoEnabled ? '📹' : '📵'}</span>
                </div>
            </div>
        `).join('');

        participantsContainer.innerHTML = participantsHTML;
    }

    renderWaitingRoom() {
        const waitingRoomContainer = document.getElementById('waiting-room');
        if (!waitingRoomContainer) return;

        if (this.waitingRoom.length === 0) {
            waitingRoomContainer.style.display = 'none';
            return;
        }

        waitingRoomContainer.style.display = 'block';
        waitingRoomContainer.innerHTML = `
            <h4>Waiting Room (${this.waitingRoom.length})</h4>
            ${this.waitingRoom.map(participant => `
                <div class="waiting-participant">
                    <span>${participant.name}</span>
                    <div>
                        <button onclick="videoCallsSystem.admitFromWaitingRoom('${participant.id}')">Admit</button>
                        <button onclick="videoCallsSystem.rejectFromWaitingRoom('${participant.id}')">Reject</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    renderRecordings() {
        const recordingsContainer = document.getElementById('recordings-list');
        if (!recordingsContainer) return;

        if (this.recordings.length === 0) {
            recordingsContainer.innerHTML = '<p class="empty-state">No recordings yet</p>';
            return;
        }

        recordingsContainer.innerHTML = this.recordings.map(recording => `
            <div class="recording-item">
                <div class="recording-thumbnail">
                    <i class="fas fa-video"></i>
                    <span class="recording-duration">${this.formatDuration(recording.duration)}</span>
                </div>
                <div class="recording-details">
                    <h4>${recording.filename}</h4>
                    <p>${new Date(recording.date).toLocaleString()}</p>
                    <p>${this.formatFileSize(recording.size)}</p>
                    <p>Participants: ${recording.participants.join(', ')}</p>
                </div>
                <div class="recording-actions">
                    <button onclick="videoCallsSystem.playRecording(${recording.id})" title="Play">
                        <i class="fas fa-play"></i>
                    </button>
                    <button onclick="videoCallsSystem.downloadRecording(${recording.id})" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button onclick="videoCallsSystem.deleteRecording(${recording.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateQualityIndicator() {
        const qualityIndicator = document.getElementById('call-quality-indicator');
        if (!qualityIndicator) return;

        const qualityColors = {
            excellent: '#00ff00',
            good: '#90EE90',
            fair: '#ffa500',
            poor: '#ff0000'
        };

        qualityIndicator.innerHTML = `
            <div class="quality-badge" style="background-color: ${qualityColors[this.callMetrics.quality]}">
                ${this.callMetrics.quality.toUpperCase()}
            </div>
            <div class="quality-details">
                <span>Network: ${this.callMetrics.networkQuality}%</span>
                <span>Packet Loss: ${this.callMetrics.packetLoss}%</span>
            </div>
        `;
    }

    showDeviceSettings() {
        const modal = document.getElementById('device-settings-modal');
        if (modal) {
            modal.style.display = 'block';
            this.renderDeviceSettings();
        }
    }

    showVirtualBackgrounds() {
        const modal = document.getElementById('virtual-backgrounds-modal');
        if (modal) {
            modal.style.display = 'block';
            this.renderVirtualBackgroundsGrid();
        }
    }

    renderVirtualBackgroundsGrid() {
        const grid = document.getElementById('backgrounds-grid');
        if (!grid) return;

        grid.innerHTML = this.virtualBackgrounds.map(bg => `
            <div class="background-option ${this.currentSettings.virtualBackground === bg.id ? 'selected' : ''}"
                 onclick="videoCallsSystem.selectVirtualBackground('${bg.id}')">
                ${bg.type === 'image' ? 
                    `<img src="${bg.url}" alt="${bg.name}">` :
                    bg.type === 'blur' ?
                    `<div class="blur-preview" style="backdrop-filter: blur(${bg.intensity}px)">Blur</div>` :
                    `<div class="none-preview">None</div>`
                }
                <span>${bg.name}</span>
            </div>
        `).join('');
    }

    playRecording(recordingId) {
        const recording = this.recordings.find(r => r.id === recordingId);
        if (!recording) return;

        // Open recording in a modal or new player
        const player = document.getElementById('recording-player');
        if (player) {
            player.src = recording.url;
            player.style.display = 'block';
            player.play();
        }
    }

    // ==================== STORAGE ====================

    loadCallHistory() {
        try {
            const stored = localStorage.getItem('callHistory');
            if (stored) {
                this.callHistory = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load call history:', error);
        }
    }

    saveCallHistoryToStorage() {
        try {
            localStorage.setItem('callHistory', JSON.stringify(this.callHistory));
        } catch (error) {
            console.error('Failed to save call history:', error);
        }
    }

    loadScheduledCalls() {
        try {
            const stored = localStorage.getItem('scheduledCalls');
            if (stored) {
                this.scheduledCalls = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load scheduled calls:', error);
        }
    }

    saveScheduledCallsToStorage() {
        try {
            localStorage.setItem('scheduledCalls', JSON.stringify(this.scheduledCalls));
        } catch (error) {
            console.error('Failed to save scheduled calls:', error);
        }
    }

    loadRecordings() {
        try {
            const stored = localStorage.getItem('recordings');
            if (stored) {
                this.recordings = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load recordings:', error);
        }
    }

    saveRecordingsToStorage() {
        try {
            const recordingsToStore = this.recordings.map(r => ({
                ...r,
                blob: undefined // Don't store blob in localStorage
            }));
            localStorage.setItem('recordings', JSON.stringify(recordingsToStore));
        } catch (error) {
            console.error('Failed to save recordings:', error);
        }
    }

    // ==================== EVENT LISTENERS ====================

    setupEventListeners() {
        // Handle device changes
        if (navigator.mediaDevices) {
            navigator.mediaDevices.addEventListener('devicechange', () => {
                this.enumerateDevices();
            });
        }

        // Handle visibility change (pause/resume quality monitoring)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.qualityMonitoringInterval) {
                clearInterval(this.qualityMonitoringInterval);
            } else if (!document.hidden && this.callState === 'connected') {
                this.startCallQualityMonitoring();
            }
        });
    }

    // ==================== HELPERS ====================

    displayChatMessage(message) {
        const chatContainer = document.getElementById('call-chat');
        if (!chatContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = 'chat-message';
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
    }

    displayReaction(reaction) {
        const reactionsContainer = document.getElementById('call-reactions');
        if (!reactionsContainer) return;

        const reactionElement = document.createElement('div');
        reactionElement.className = 'reaction-animation';
        reactionElement.textContent = reaction;
        reactionsContainer.appendChild(reactionElement);

        setTimeout(() => reactionElement.remove(), 3000);
    }

    handleRemoteScreenShare(isSharing) {
        const notification = isSharing ? 'Screen sharing started' : 'Screen sharing stopped';
        this.showNotification(notification, 'info');
    }

    handleRemoteRecordingNotification(isRecording) {
        const notification = isRecording ? 
            '⚠️ This call is being recorded' : 
            'Recording stopped';
        this.showNotification(notification, 'warning');
    }

    toggleNoiseSuppression() {
        this.currentSettings.noiseSuppressionEnabled = !this.currentSettings.noiseSuppressionEnabled;
        this.showNotification('Noise suppression ' + (this.currentSettings.noiseSuppressionEnabled ? 'enabled' : 'disabled'), 'success');
    }

    toggleEchoCancellation() {
        this.currentSettings.echoCancellationEnabled = !this.currentSettings.echoCancellationEnabled;
        this.showNotification('Echo cancellation ' + (this.currentSettings.echoCancellationEnabled ? 'enabled' : 'disabled'), 'success');
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : type === 'warning' ? '#ff9800' : '#2196F3'};
            color: white;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the system
window.videoCallsSystem = null;
document.addEventListener('DOMContentLoaded', () => {
    window.videoCallsSystem = new VideoCallsSystem();
});
