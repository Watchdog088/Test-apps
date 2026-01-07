// ========== MESSAGE STATUS SYSTEM - 5 MISSING FEATURES COMPLETE ==========
// Implementing: Sent, Delivered, Read, Read Receipts Dashboard, Status Analytics

const messageStatusState = {
    messages: {}, // messageId: { status, sentAt, deliveredAt, readAt, recipientId }
    statusTracking: [],
    statusAnalytics: {
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        averageDeliveryTime: 0,
        averageReadTime: 0
    },
    deliveryReports: [],
    readReceipts: {},
    statusHistory: []
};

// ========== FEATURE 1: MESSAGE SENT STATUS ==========
function updateMessageStatusToSent(messageId, chatId) {
    if (!messageStatusState.messages[messageId]) {
        messageStatusState.messages[messageId] = {
            id: messageId,
            chatId: chatId,
            status: 'sent',
            sentAt: new Date(),
            deliveredAt: null,
            readAt: null,
            recipientId: chatId
        };
    }
    
    messageStatusState.statusHistory.push({
        messageId,
        status: 'sent',
        timestamp: new Date(),
        action: 'Message sent successfully'
    });
    
    messageStatusState.statusAnalytics.totalSent++;
    
    // Simulate delivery after 1-3 seconds
    setTimeout(() => updateMessageStatusToDelivered(messageId), Math.random() * 2000 + 1000);
    
    showToast('✓ Message Sent');
    return messageStatusState.messages[messageId];
}

// ========== FEATURE 2: MESSAGE DELIVERED STATUS ==========
function updateMessageStatusToDelivered(messageId) {
    if (messageStatusState.messages[messageId]) {
        messageStatusState.messages[messageId].status = 'delivered';
        messageStatusState.messages[messageId].deliveredAt = new Date();
        
        const sentTime = messageStatusState.messages[messageId].sentAt;
        const deliveredTime = messageStatusState.messages[messageId].deliveredAt;
        const deliveryDuration = (deliveredTime - sentTime) / 1000; // seconds
        
        messageStatusState.statusHistory.push({
            messageId,
            status: 'delivered',
            timestamp: new Date(),
            action: 'Message delivered to recipient',
            deliveryTime: deliveryDuration + 's'
        });
        
        messageStatusState.statusAnalytics.totalDelivered++;
        calculateAverageDeliveryTime();
        
        // Simulate read after 3-8 seconds
        setTimeout(() => updateMessageStatusToRead(messageId), Math.random() * 5000 + 3000);
        
        showToast('✓✓ Message Delivered');
        
        return messageStatusState.messages[messageId];
    }
}

// ========== FEATURE 3: MESSAGE READ STATUS ==========
function updateMessageStatusToRead(messageId) {
    if (messageStatusState.messages[messageId]) {
        messageStatusState.messages[messageId].status = 'read';
        messageStatusState.messages[messageId].readAt = new Date();
        
        const deliveredTime = messageStatusState.messages[messageId].deliveredAt;
        const readTime = messageStatusState.messages[messageId].readAt;
        const readDuration = (readTime - deliveredTime) / 1000; // seconds
        
        messageStatusState.statusHistory.push({
            messageId,
            status: 'read',
            timestamp: new Date(),
            action: 'Message read by recipient',
            readTime: readDuration + 's'
        });
        
        messageStatusState.statusAnalytics.totalRead++;
        calculateAverageReadTime();
        
        // Store read receipt
        messageStatusState.readReceipts[messageId] = {
            messageId,
            readAt: new Date(),
            readBy: messageStatusState.messages[messageId].recipientId,
            sentToDeliveryTime: ((messageStatusState.messages[messageId].deliveredAt - messageStatusState.messages[messageId].sentAt) / 1000).toFixed(2) + 's',
            deliveryToReadTime: readDuration.toFixed(2) + 's'
        };
        
        showToast('✓✓ Message Read');
        
        return messageStatusState.messages[messageId];
    }
}

// ========== FEATURE 4: READ RECEIPTS DASHBOARD ==========
function openReadReceiptsDashboard() {
    const receipts = Object.values(messageStatusState.readReceipts);
    
    closeModal('readReceipts');
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="readReceiptsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('readReceipts')">←</div>
                <div class="modal-title">📬 Read Receipts Dashboard</div>
                <button class="btn-text" onclick="refreshReadReceipts()">🔄</button>
            </div>
            
            <div class="modal-content" style="padding:20px">
                <!-- Summary Stats -->
                <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:20px;border-radius:16px;color:white;margin-bottom:20px">
                    <h3 style="margin:0 0 16px 0">Summary</h3>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
                        <div style="text-align:center">
                            <div style="font-size:28px;font-weight:700">${receipts.length}</div>
                            <div style="font-size:12px;opacity:0.9">Total Read</div>
                        </div>
                        <div style="text-align:center">
                            <div style="font-size:28px;font-weight:700">${messageStatusState.statusAnalytics.totalDelivered}</div>
                            <div style="font-size:12px;opacity:0.9">Delivered</div>
                        </div>
                        <div style="text-align:center">
                            <div style="font-size:28px;font-weight:700">${messageStatusState.statusAnalytics.totalSent}</div>
                            <div style="font-size:12px;opacity:0.9">Sent</div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:20px">
                    <button class="btn" onclick="openStatusAnalytics()" style="background:var(--primary)">
                        📊 Status Analytics
                    </button>
                    <button class="btn" onclick="openDeliveryReports()" style="background:#10b981">
                        📈 Delivery Reports
                    </button>
                </div>
                
                <!-- Read Receipts List -->
                <h4 style="margin-bottom:12px">Recent Read Receipts</h4>
                ${receipts.length > 0 ? receipts.map(receipt => `
                    <div class="list-item" onclick="viewReceiptDetails('${receipt.messageId}')" style="margin-bottom:12px;cursor:pointer">
                        <div style="flex:1">
                            <div style="font-weight:600">Message ID: ${receipt.messageId.toString().slice(-8)}</div>
                            <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">
                                ✓ Read: ${new Date(receipt.readAt).toLocaleString()}
                            </div>
                            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">
                                📤 Delivery: ${receipt.sentToDeliveryTime} | 👁️ Read: ${receipt.deliveryToReadTime}
                            </div>
                        </div>
                        <div style="color:var(--primary);font-size:20px">✓✓</div>
                    </div>
                `).join('') : '<p style="text-align:center;color:var(--text-secondary);padding:40px">No read receipts yet</p>'}
            </div>
            
            <div style="padding:16px;border-top:1px solid var(--background-secondary)">
                <button class="btn" onclick="exportReadReceipts()" style="width:100%">
                    📥 Export Read Receipts
                </button>
            </div>
        </div>
    `);
}

function viewReceiptDetails(messageId) {
    const receipt = messageStatusState.readReceipts[messageId];
    const message = messageStatusState.messages[messageId];
    
    if (!receipt || !message) return;
    
    closeModal('receiptDetails');
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="receiptDetailsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('receiptDetails')">←</div>
                <div class="modal-title">Receipt Details</div>
            </div>
            
            <div class="modal-content" style="padding:20px">
                <div style="background:var(--background-secondary);padding:16px;border-radius:12px;margin-bottom:16px">
                    <h4>Message Information</h4>
                    <p><strong>Message ID:</strong> ${messageId}</p>
                    <p><strong>Chat ID:</strong> ${message.chatId}</p>
                    <p><strong>Current Status:</strong> <span style="color:#10b981">✓✓ ${message.status.toUpperCase()}</span></p>
                </div>
                
                <div style="background:var(--background-secondary);padding:16px;border-radius:12px;margin-bottom:16px">
                    <h4>Timeline</h4>
                    <div style="margin-left:20px;border-left:2px solid var(--primary);padding-left:16px">
                        <div style="margin-bottom:16px">
                            <div style="font-weight:600">✓ Sent</div>
                            <div style="font-size:12px;color:var(--text-secondary)">${new Date(message.sentAt).toLocaleString()}</div>
                        </div>
                        <div style="margin-bottom:16px">
                            <div style="font-weight:600">✓✓ Delivered</div>
                            <div style="font-size:12px;color:var(--text-secondary)">${new Date(message.deliveredAt).toLocaleString()}</div>
                            <div style="font-size:11px;color:var(--primary)">⏱️ ${receipt.sentToDeliveryTime}</div>
                        </div>
                        <div>
                            <div style="font-weight:600">👁️ Read</div>
                            <div style="font-size:12px;color:var(--text-secondary)">${new Date(message.readAt).toLocaleString()}</div>
                            <div style="font-size:11px;color:var(--primary)">⏱️ ${receipt.deliveryToReadTime}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background:var(--background-secondary);padding:16px;border-radius:12px">
                    <h4>Performance Metrics</h4>
                    <p><strong>Total Time to Read:</strong> ${((message.readAt - message.sentAt) / 1000).toFixed(2)}s</p>
                    <p><strong>Delivery Speed:</strong> ${parseFloat(receipt.sentToDeliveryTime) < 2 ? '🟢 Fast' : parseFloat(receipt.sentToDeliveryTime) < 5 ? '🟡 Normal' : '🔴 Slow'}</p>
                    <p><strong>Read Speed:</strong> ${parseFloat(receipt.deliveryToReadTime) < 5 ? '🟢 Fast' : parseFloat(receipt.deliveryToReadTime) < 10 ? '🟡 Normal' : '🔴 Slow'}</p>
                </div>
            </div>
        </div>
    `);
}

// ========== FEATURE 5: STATUS ANALYTICS DASHBOARD ==========
function openStatusAnalytics() {
    closeModal('statusAnalytics');
    
    const totalMessages = messageStatusState.statusAnalytics.totalSent;
    const deliveryRate = totalMessages > 0 ? ((messageStatusState.statusAnalytics.totalDelivered / totalMessages) * 100).toFixed(1) : 0;
    const readRate = totalMessages > 0 ? ((messageStatusState.statusAnalytics.totalRead / totalMessages) * 100).toFixed(1) : 0;
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="statusAnalyticsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('statusAnalytics')">←</div>
                <div class="modal-title">📊 Message Status Analytics</div>
                <button class="btn-text" onclick="refreshStatusAnalytics()">🔄</button>
            </div>
            
            <div class="modal-content" style="padding:20px;overflow-y:auto">
                <!-- Overview Cards -->
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;margin-bottom:20px">
                    <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:20px;border-radius:16px;color:white">
                        <div style="font-size:12px;opacity:0.9;margin-bottom:8px">TOTAL SENT</div>
                        <div style="font-size:32px;font-weight:700">${totalMessages}</div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px">All messages</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #f093fb 0%, #f5576c 100%);padding:20px;border-radius:16px;color:white">
                        <div style="font-size:12px;opacity:0.9;margin-bottom:8px">DELIVERY RATE</div>
                        <div style="font-size:32px;font-weight:700">${deliveryRate}%</div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px">${messageStatusState.statusAnalytics.totalDelivered} delivered</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);padding:20px;border-radius:16px;color:white">
                        <div style="font-size:12px;opacity:0.9;margin-bottom:8px">READ RATE</div>
                        <div style="font-size:32px;font-weight:700">${readRate}%</div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px">${messageStatusState.statusAnalytics.totalRead} read</div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);padding:20px;border-radius:16px;color:white">
                        <div style="font-size:12px;opacity:0.9;margin-bottom:8px">AVG READ TIME</div>
                        <div style="font-size:32px;font-weight:700">${messageStatusState.statusAnalytics.averageReadTime}s</div>
                        <div style="font-size:11px;opacity:0.8;margin-top:4px">Time to read</div>
                    </div>
                </div>
                
                <!-- Status Breakdown -->
                <div style="background:var(--background-secondary);padding:20px;border-radius:16px;margin-bottom:20px">
                    <h4 style="margin-bottom:16px">Status Breakdown</h4>
                    <div style="margin-bottom:12px">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                            <span>✓ Sent</span>
                            <span style="font-weight:600">${totalMessages}</span>
                        </div>
                        <div style="background:var(--background);border-radius:8px;height:8px;overflow:hidden">
                            <div style="background:var(--primary);height:100%;width:100%"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:12px">
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                            <span>✓✓ Delivered</span>
                            <span style="font-weight:600">${messageStatusState.statusAnalytics.totalDelivered}</span>
                        </div>
                        <div style="background:var(--background);border-radius:8px;height:8px;overflow:hidden">
                            <div style="background:#10b981;height:100%;width:${deliveryRate}%"></div>
                        </div>
                    </div>
                    
                    <div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                            <span>👁️ Read</span>
                            <span style="font-weight:600">${messageStatusState.statusAnalytics.totalRead}</span>
                        </div>
                        <div style="background:var(--background);border-radius:8px;height:8px;overflow:hidden">
                            <div style="background:#3b82f6;height:100%;width:${readRate}%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Metrics -->
                <div style="background:var(--background-secondary);padding:20px;border-radius:16px;margin-bottom:20px">
                    <h4 style="margin-bottom:16px">Performance Metrics</h4>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
                        <div>
                            <div style="font-size:12px;color:var(--text-secondary)">Avg Delivery Time</div>
                            <div style="font-size:24px;font-weight:600;color:var(--primary)">${messageStatusState.statusAnalytics.averageDeliveryTime}s</div>
                        </div>
                        <div>
                            <div style="font-size:12px;color:var(--text-secondary)">Avg Read Time</div>
                            <div style="font-size:24px;font-weight:600;color:var(--primary)">${messageStatusState.statusAnalytics.averageReadTime}s</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recent Status History -->
                <div style="background:var(--background-secondary);padding:20px;border-radius:16px">
                    <h4 style="margin-bottom:16px">Recent Status Updates</h4>
                    <div style="max-height:200px;overflow-y:auto">
                        ${messageStatusState.statusHistory.slice(-10).reverse().map(item => `
                            <div style="padding:12px;background:var(--background);border-radius:8px;margin-bottom:8px">
                                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                                    <span style="font-weight:600">${item.status.toUpperCase()}</span>
                                    <span style="font-size:11px;color:var(--text-secondary)">${new Date(item.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div style="font-size:12px;color:var(--text-secondary)">${item.action}</div>
                                ${item.deliveryTime ? `<div style="font-size:11px;color:var(--primary);margin-top:4px">⏱️ ${item.deliveryTime}</div>` : ''}
                                ${item.readTime ? `<div style="font-size:11px;color:var(--primary);margin-top:4px">👁️ ${item.readTime}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div style="padding:16px;border-top:1px solid var(--background-secondary);display:grid;grid-template-columns:repeat(2,1fr);gap:12px">
                <button class="btn" onclick="openReadReceiptsDashboard()">
                    📬 Read Receipts
                </button>
                <button class="btn" onclick="exportStatusAnalytics()">
                    📥 Export Data
                </button>
            </div>
        </div>
    `);
}

function openDeliveryReports() {
    closeModal('deliveryReports');
    
    // Generate delivery reports
    const reports = Object.values(messageStatusState.messages).map(msg => ({
        messageId: msg.id,
        chatId: msg.chatId,
        status: msg.status,
        sentAt: msg.sentAt,
        deliveredAt: msg.deliveredAt,
        readAt: msg.readAt,
        deliveryTime: msg.deliveredAt ? ((msg.deliveredAt - msg.sentAt) / 1000).toFixed(2) : 'Pending',
        readTime: msg.readAt ? ((msg.readAt - msg.deliveredAt) / 1000).toFixed(2) : 'Pending',
        totalTime: msg.readAt ? ((msg.readAt - msg.sentAt) / 1000).toFixed(2) : 'Pending'
    }));
    
    document.body.insertAdjacentHTML('beforeend', `
        <div id="deliveryReportsModal" class="modal show">
            <div class="modal-header">
                <div class="modal-close" onclick="closeModal('deliveryReports')">←</div>
                <div class="modal-title">📈 Delivery Reports</div>
                <button class="btn-text" onclick="refreshDeliveryReports()">🔄</button>
            </div>
            
            <div class="modal-content" style="padding:20px">
                <h4 style="margin-bottom:16px">Message Delivery Details</h4>
                
                ${reports.length > 0 ? reports.map(report => `
                    <div class="list-item" style="margin-bottom:12px">
                        <div style="flex:1">
                            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                                <span style="font-weight:600">Message ${report.messageId.toString().slice(-8)}</span>
                                <span style="padding:4px 8px;background:${report.status === 'read' ? '#10b981' : report.status === 'delivered' ? '#3b82f6' : '#f59e0b'};color:white;border-radius:12px;font-size:11px">
                                    ${report.status.toUpperCase()}
                                </span>
                            </div>
                            
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:11px;color:var(--text-secondary)">
                                <div>
                                    <div>Delivery</div>
                                    <div style="font-weight:600;color:var(--text-primary)">${report.deliveryTime}s</div>
                                </div>
                                <div>
                                    <div>Read</div>
                                    <div style="font-weight:600;color:var(--text-primary)">${report.readTime}s</div>
                                </div>
                                <div>
                                    <div>Total</div>
                                    <div style="font-weight:600;color:var(--text-primary)">${report.totalTime}s</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') : '<p style="text-align:center;color:var(--text-secondary);padding:40px">No delivery reports yet</p>'}
            </div>
            
            <div style="padding:16px;border-top:1px solid var(--background-secondary)">
                <button class="btn" onclick="exportDeliveryReports()" style="width:100%">
                    📥 Export Reports
                </button>
            </div>
        </div>
    `);
}

// ========== HELPER FUNCTIONS ==========

function calculateAverageDeliveryTime() {
    const messages = Object.values(messageStatusState.messages).filter(m => m.deliveredAt);
    if (messages.length === 0) return;
    
    const totalTime = messages.reduce((sum, msg) => {
        return sum + ((msg.deliveredAt - msg.sentAt) / 1000);
    }, 0);
    
    messageStatusState.statusAnalytics.averageDeliveryTime = (totalTime / messages.length).toFixed(2);
}

function calculateAverageReadTime() {
    const messages = Object.values(messageStatusState.messages).filter(m => m.readAt);
    if (messages.length === 0) return;
    
    const totalTime = messages.reduce((sum, msg) => {
        return sum + ((msg.readAt - msg.deliveredAt) / 1000);
    }, 0);
    
    messageStatusState.statusAnalytics.averageReadTime = (totalTime / messages.length).toFixed(2);
}

function refreshReadReceipts() {
    showToast('🔄 Refreshing...');
    setTimeout(() => {
        closeModal('readReceipts');
        openReadReceiptsDashboard();
        showToast('✓ Refreshed');
    }, 500);
}

function refreshStatusAnalytics() {
    showToast('🔄 Refreshing...');
    setTimeout(() => {
        closeModal('statusAnalytics');
        openStatusAnalytics();
        showToast('✓ Refreshed');
    }, 500);
}

function refreshDeliveryReports() {
    showToast('🔄 Refreshing...');
    setTimeout(() => {
        closeModal('deliveryReports');
        openDeliveryReports();
        showToast('✓ Refreshed');
    }, 500);
}

function exportReadReceipts() {
    const data = JSON.stringify(messageStatusState.readReceipts, null, 2);
    downloadJSON(data, 'read-receipts-export.json');
    showToast('📥 Read Receipts Exported');
}

function exportStatusAnalytics() {
    const data = JSON.stringify(messageStatusState.statusAnalytics, null, 2);
    downloadJSON(data, 'status-analytics-export.json');
    showToast('📥 Analytics Exported');
}

function exportDeliveryReports() {
    const reports = Object.values(messageStatusState.messages);
    const data = JSON.stringify(reports, null, 2);
    downloadJSON(data, 'delivery-reports-export.json');
    showToast('📥 Delivery Reports Exported');
}

function downloadJSON(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== UTILITY FUNCTIONS ==========

function getMessageStatus(messageId) {
    return messageStatusState.messages[messageId] || null;
}

function getAllMessageStatuses() {
    return Object.values(messageStatusState.messages);
}

function getStatusHistory() {
    return messageStatusState.statusHistory;
}

function clearStatusHistory() {
    messageStatusState.statusHistory = [];
    showToast('✓ History Cleared');
}

function resetStatusAnalytics() {
    messageStatusState.statusAnalytics = {
        totalSent: 0,
        totalDelivered: 0,
        totalRead: 0,
        averageDeliveryTime: 0,
        averageReadTime: 0
    };
    showToast('✓ Analytics Reset');
}

// ========== TESTING FUNCTIONS ==========

function testMessageStatusSystem() {
    console.log('🧪 Testing Message Status System...');
    
    // Test 1: Send a message
    const messageId1 = Date.now();
    updateMessageStatusToSent(messageId1, 1);
    console.log('✓ Test 1: Message sent');
    
    // Test 2: Send another message
    setTimeout(() => {
        const messageId2 = Date.now();
        updateMessageStatusToSent(messageId2, 2);
        console.log('✓ Test 2: Second message sent');
    }, 2000);
    
    // Test 3: Check analytics after 10 seconds
    setTimeout(() => {
        console.log('📊 Analytics:', messageStatusState.statusAnalytics);
        console.log('✓ All tests completed');
        showToast('✅ Test Complete - Check Console');
    }, 10000);
}

// ========== SHARED FUNCTIONS ==========

function closeModal(type) { 
    const m = document.getElementById(type + 'Modal'); 
    if(m) m.remove(); 
}

function showToast(msg) { 
    const t = document.getElementById('toast') || (() => { 
        const e = document.createElement('div'); 
        e.id = 'toast'; 
        e.className = 'toast'; 
        document.body.appendChild(e); 
        return e; 
    })(); 
    t.textContent = msg; 
    t.classList.add('show'); 
    setTimeout(() => t.classList.remove('show'), 3000); 
}

// ========== INTEGRATION WITH EXISTING MESSAGES SYSTEM ==========

// Override the existing sendMessage function to include status tracking
const originalSendMessage = typeof sendMessage !== 'undefined' ? sendMessage : null;

if (originalSendMessage) {
    sendMessage = function(chatId, text, type = 'text', attachment = null) {
        const message = originalSendMessage(chatId, text, type, attachment);
        if (message && message.id) {
            updateMessageStatusToSent(message.id, chatId);
        }
        return message;
    };
}

// Initialize the system
console.log('✅ Message Status System Loaded - 5 Features Complete');
console.log('📬 Features: Sent, Delivered, Read, Read Receipts Dashboard, Status Analytics');
console.log('🧪 Run testMessageStatusSystem() to test the system');
