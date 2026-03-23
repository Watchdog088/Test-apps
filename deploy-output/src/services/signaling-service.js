/**
 * Signaling Service for WebRTC
 * Handles signaling for peer-to-peer connections using Firebase Realtime Database
 */

class SignalingService {
    constructor(firebaseService, userId) {
        this.firebase = firebaseService;
        this.userId = userId;
        this.listeners = new Map();
        this.pendingIceCandidates = new Map();
    }

    /**
     * Initialize signaling for a room/stream
     */
    async initializeRoom(roomId, isHost = false) {
        try {
            const roomRef = this.firebase.database.ref(`rooms/${roomId}`);
            
            if (isHost) {
                // Create room as host
                await roomRef.set({
                    hostId: this.userId,
                    createdAt: Date.now(),
                    status: 'active'
                });
            }

            // Listen for signaling messages
            this.listenForSignals(roomId);

            return { success: true, roomId };
        } catch (error) {
            console.error('Error initializing room:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for signaling messages
     */
    listenForSignals(roomId) {
        // Listen for offers
        const offersRef = this.firebase.database.ref(`rooms/${roomId}/offers/${this.userId}`);
        offersRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            if (data && this.onOffer) {
                this.onOffer(data.from, data.offer);
                snapshot.ref.remove(); // Clean up after processing
            }
        });

        // Listen for answers
        const answersRef = this.firebase.database.ref(`rooms/${roomId}/answers/${this.userId}`);
        answersRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            if (data && this.onAnswer) {
                this.onAnswer(data.from, data.answer);
                snapshot.ref.remove(); // Clean up after processing
            }
        });

        // Listen for ICE candidates
        const candidatesRef = this.firebase.database.ref(`rooms/${roomId}/candidates/${this.userId}`);
        candidatesRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            if (data && this.onIceCandidate) {
                this.onIceCandidate(data.from, data.candidate);
                snapshot.ref.remove(); // Clean up after processing
            }
        });

        // Store references for cleanup
        this.listeners.set(roomId, {
            offersRef,
            answersRef,
            candidatesRef
        });
    }

    /**
     * Send offer to peer
     */
    async sendOffer(roomId, targetUserId, offer) {
        try {
            const offerRef = this.firebase.database.ref(`rooms/${roomId}/offers/${targetUserId}`);
            await offerRef.push({
                from: this.userId,
                offer: offer,
                timestamp: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending offer:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send answer to peer
     */
    async sendAnswer(roomId, targetUserId, answer) {
        try {
            const answerRef = this.firebase.database.ref(`rooms/${roomId}/answers/${targetUserId}`);
            await answerRef.push({
                from: this.userId,
                answer: answer,
                timestamp: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending answer:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send ICE candidate to peer
     */
    async sendIceCandidate(roomId, targetUserId, candidate) {
        try {
            const candidateRef = this.firebase.database.ref(`rooms/${roomId}/candidates/${targetUserId}`);
            await candidateRef.push({
                from: this.userId,
                candidate: candidate,
                timestamp: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending ICE candidate:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Join a broadcast as viewer
     */
    async joinBroadcast(streamId) {
        try {
            const viewerRef = this.firebase.database.ref(`streams/${streamId}/viewers/${this.userId}`);
            await viewerRef.set({
                joinedAt: Date.now(),
                status: 'connected'
            });

            // Request stream from host
            const requestRef = this.firebase.database.ref(`streams/${streamId}/viewerRequests/${this.userId}`);
            await requestRef.set({
                requestedAt: Date.now()
            });

            return { success: true };
        } catch (error) {
            console.error('Error joining broadcast:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Leave broadcast
     */
    async leaveBroadcast(streamId) {
        try {
            const viewerRef = this.firebase.database.ref(`streams/${streamId}/viewers/${this.userId}`);
            await viewerRef.remove();
            return { success: true };
        } catch (error) {
            console.error('Error leaving broadcast:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Start broadcasting
     */
    async startBroadcast(streamId, streamInfo) {
        try {
            const streamRef = this.firebase.database.ref(`streams/${streamId}`);
            await streamRef.set({
                hostId: this.userId,
                title: streamInfo.title,
                description: streamInfo.description,
                category: streamInfo.category,
                startedAt: Date.now(),
                status: 'live',
                viewerCount: 0
            });

            // Listen for viewer requests
            this.listenForViewerRequests(streamId);

            return { success: true };
        } catch (error) {
            console.error('Error starting broadcast:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for viewer requests (for broadcaster)
     */
    listenForViewerRequests(streamId) {
        const requestsRef = this.firebase.database.ref(`streams/${streamId}/viewerRequests`);
        requestsRef.on('child_added', (snapshot) => {
            const viewerId = snapshot.key;
            if (this.onViewerRequest) {
                this.onViewerRequest(viewerId);
            }
            snapshot.ref.remove(); // Clean up after processing
        });

        // Store reference for cleanup
        if (!this.listeners.has(streamId)) {
            this.listeners.set(streamId, {});
        }
        this.listeners.get(streamId).requestsRef = requestsRef;
    }

    /**
     * End broadcast
     */
    async endBroadcast(streamId) {
        try {
            const streamRef = this.firebase.database.ref(`streams/${streamId}`);
            await streamRef.update({
                status: 'ended',
                endedAt: Date.now()
            });

            // Clean up after a delay
            setTimeout(async () => {
                await streamRef.remove();
            }, 60000); // Keep for 1 minute for final stats

            return { success: true };
        } catch (error) {
            console.error('Error ending broadcast:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update viewer count
     */
    async updateViewerCount(streamId, count) {
        try {
            const streamRef = this.firebase.database.ref(`streams/${streamId}`);
            await streamRef.update({
                viewerCount: count,
                lastUpdate: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error updating viewer count:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Initiate video call
     */
    async initiateCall(callId, targetUserId, callType = 'video') {
        try {
            const callRef = this.firebase.database.ref(`calls/${callId}`);
            await callRef.set({
                callerId: this.userId,
                calleeId: targetUserId,
                callType: callType,
                status: 'ringing',
                createdAt: Date.now()
            });

            // Listen for call response
            this.listenForCallResponse(callId);

            return { success: true, callId };
        } catch (error) {
            console.error('Error initiating call:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for call response
     */
    listenForCallResponse(callId) {
        const callRef = this.firebase.database.ref(`calls/${callId}/status`);
        callRef.on('value', (snapshot) => {
            const status = snapshot.val();
            if (this.onCallStatusChange) {
                this.onCallStatusChange(callId, status);
            }
        });

        if (!this.listeners.has(callId)) {
            this.listeners.set(callId, {});
        }
        this.listeners.get(callId).callRef = callRef;
    }

    /**
     * Answer call
     */
    async answerCall(callId, accept = true) {
        try {
            const callRef = this.firebase.database.ref(`calls/${callId}`);
            await callRef.update({
                status: accept ? 'active' : 'rejected',
                answeredAt: Date.now()
            });

            if (accept) {
                // Initialize signaling for call
                await this.initializeRoom(callId, false);
            }

            return { success: true };
        } catch (error) {
            console.error('Error answering call:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * End call
     */
    async endCall(callId) {
        try {
            const callRef = this.firebase.database.ref(`calls/${callId}`);
            await callRef.update({
                status: 'ended',
                endedAt: Date.now()
            });

            // Clean up
            this.cleanup(callId);

            // Remove call data after delay
            setTimeout(async () => {
                await callRef.remove();
            }, 30000);

            return { success: true };
        } catch (error) {
            console.error('Error ending call:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send chat message in stream
     */
    async sendStreamMessage(streamId, message) {
        try {
            const messagesRef = this.firebase.database.ref(`streams/${streamId}/messages`);
            await messagesRef.push({
                userId: this.userId,
                message: message,
                timestamp: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending stream message:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for stream messages
     */
    listenForStreamMessages(streamId) {
        const messagesRef = this.firebase.database.ref(`streams/${streamId}/messages`);
        messagesRef.on('child_added', (snapshot) => {
            const message = snapshot.val();
            if (this.onStreamMessage) {
                this.onStreamMessage(message);
            }
        });

        if (!this.listeners.has(streamId)) {
            this.listeners.set(streamId, {});
        }
        this.listeners.get(streamId).messagesRef = messagesRef;
    }

    /**
     * Send reaction in stream
     */
    async sendStreamReaction(streamId, emoji) {
        try {
            const reactionsRef = this.firebase.database.ref(`streams/${streamId}/reactions`);
            await reactionsRef.push({
                userId: this.userId,
                emoji: emoji,
                timestamp: Date.now()
            });
            return { success: true };
        } catch (error) {
            console.error('Error sending stream reaction:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Listen for stream reactions
     */
    listenForStreamReactions(streamId) {
        const reactionsRef = this.firebase.database.ref(`streams/${streamId}/reactions`);
        reactionsRef.on('child_added', (snapshot) => {
            const reaction = snapshot.val();
            if (this.onStreamReaction) {
                this.onStreamReaction(reaction);
            }
            // Auto cleanup old reactions
            setTimeout(() => {
                snapshot.ref.remove();
            }, 5000);
        });

        if (!this.listeners.has(streamId)) {
            this.listeners.set(streamId, {});
        }
        this.listeners.get(streamId).reactionsRef = reactionsRef;
    }

    /**
     * Get active streams
     */
    async getActiveStreams() {
        try {
            const streamsRef = this.firebase.database.ref('streams');
            const snapshot = await streamsRef.orderByChild('status').equalTo('live').once('value');
            const streams = [];
            
            snapshot.forEach((childSnapshot) => {
                streams.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });

            return { success: true, streams };
        } catch (error) {
            console.error('Error getting active streams:', error);
            return { success: false, error: error.message, streams: [] };
        }
    }

    /**
     * Cleanup listeners
     */
    cleanup(roomId = null) {
        if (roomId) {
            const refs = this.listeners.get(roomId);
            if (refs) {
                Object.values(refs).forEach(ref => {
                    if (ref && ref.off) {
                        ref.off();
                    }
                });
                this.listeners.delete(roomId);
            }
        } else {
            // Cleanup all listeners
            this.listeners.forEach((refs, roomId) => {
                Object.values(refs).forEach(ref => {
                    if (ref && ref.off) {
                        ref.off();
                    }
                });
            });
            this.listeners.clear();
        }
    }

    /**
     * Check connection status
     */
    async checkConnectionStatus() {
        try {
            const connectedRef = this.firebase.database.ref('.info/connected');
            return new Promise((resolve) => {
                connectedRef.once('value', (snapshot) => {
                    resolve(snapshot.val() === true);
                });
            });
        } catch (error) {
            console.error('Error checking connection status:', error);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SignalingService;
}
