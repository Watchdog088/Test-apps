# ✅ PHASE 6: REAL-TIME MESSAGING — COMPLETE
## LynkApp — Live Firestore Direct Messaging with onSnapshot

**Date Completed:** March 24, 2026  
**Status:** 7/7 tasks complete ✅  
**Progress:** Phase 6 = 100% Complete!

---

## 🎉 WHAT WE BUILT

LynkApp now has **REAL-TIME DIRECT MESSAGING** — two users can send and receive messages that appear instantly without refreshing. Messages, conversations, and unread counts are all powered by Firestore's `onSnapshot` live listeners.

### ✅ All 7 Tasks Completed:

**✅ Task 6.1 — Get or Create Conversation**
- `getOrCreateConversation(otherUserId)` finds an existing DM or creates a new one
- Conversation ID is deterministic: `[uid1, uid2].sort().join('_')` — always the same for the same two users
- Stores both participants' names and avatars at creation time
- Initializes `unreadCounts: { uid1: 0, uid2: 0 }`

**✅ Task 6.2 — Send a Message**
- `sendMessage(conversationId, text)` saves message to `conversations/{id}/messages`
- Simultaneously updates the conversation's `lastMessage` + `lastMessageAt`
- Increments the OTHER user's `unreadCount` by 1
- Emits `message:sent` browser event

**✅ Task 6.3 — Real-time Message Listener**
- `listenToMessages(conversationId, callback)` uses `onSnapshot` — new messages appear INSTANTLY
- Returns an `unsubscribe` function — call it when the user navigates away
- Handles listener cleanup automatically; calling `listenToMessages` on the same conversation cancels the old listener first
- Messages are sorted oldest → newest, filtered to `isDeleted: false`

**✅ Task 6.4 — List Conversations (real-time)**
- `listenToConversations(callback)` subscribes to the user's conversation list
- Updates in real-time when a new message is received (lastMessage + unreadCount change)
- One-time version also available: `getConversations()`
- Sorted by `lastMessageAt` descending (newest chat on top)

**✅ Task 6.5 — Mark as Read**
- `markConversationAsRead(conversationId)` resets `unreadCounts.{myUserId}` to 0
- Also marks all received messages' `status` → `"read"`
- Call this when the user opens a conversation

**✅ Task 6.6 — Delete a Message (soft delete)**
- `deleteMessage(conversationId, messageId)` sets `isDeleted: true`
- The text is replaced with `"This message was deleted"` (like WhatsApp/iMessage)
- Only the sender can delete their own messages
- Emits `message:deleted` event

**✅ Task 6.7 — Unread Count (nav badge, real-time)**
- `listenToUnreadCount(callback)` subscribes to total unread across ALL conversations
- Use this to update the badge on the Messages icon in the nav bar
- One-time version also available: `getTotalUnreadCount()`

---

## 📁 NEW FILE CREATED

**`ConnectHub-Frontend/src/services/messaging-service.js`** ✅ (NEW FILE)

This is a brand new service — there was no real messaging service before, just UI mock-ups.

---

## 🔧 HOW TO USE IN YOUR UI

### Step 1: Open a conversation (from a friend's profile → "Message" button):
```javascript
const result = await window.messagingService.getOrCreateConversation("USER_B_ID");
if (result.success) {
    openChatWindow(result.conversationId);
}
```

### Step 2: Subscribe to live messages when chat window opens:
```javascript
let unsubMessages;

function openChatWindow(conversationId) {
    // Mark as read when opened
    messagingService.markConversationAsRead(conversationId);
    
    // Subscribe to live messages
    unsubMessages = messagingService.listenToMessages(conversationId, (messages) => {
        renderMessages(messages);  // Called immediately + on every new message
    });
}

// When user closes the chat window:
function closeChatWindow() {
    if (unsubMessages) unsubMessages();
}
```

### Step 3: Send a message (send button):
```javascript
const textInput = document.querySelector('#message-input');
const result = await window.messagingService.sendMessage(conversationId, textInput.value);
if (result.success) {
    textInput.value = '';  // Clear input
    // The onSnapshot listener will automatically add the new message to the UI
}
```

### Step 4: Show the conversations list (Messages page):
```javascript
const unsubConvos = messagingService.listenToConversations((conversations) => {
    conversations.forEach(convo => {
        console.log(convo.otherUser.name);
        console.log(convo.lastMessage?.text || 'No messages yet');
        console.log(convo.unreadCount, 'unread');
    });
});
```

### Step 5: Nav badge (unread count):
```javascript
// In your app initialization:
messagingService.listenToUnreadCount((count) => {
    const badge = document.querySelector('.messages-nav-badge');
    if (badge) {
        badge.textContent = count > 0 ? count : '';
        badge.style.display = count > 0 ? 'block' : 'none';
    }
});
```

### Delete a message (long-press → Delete):
```javascript
const result = await messagingService.deleteMessage(conversationId, messageId);
if (result.success) {
    // The onSnapshot listener will auto-update the UI with "This message was deleted"
}
```

---

## 🧪 HOW TO TEST PHASE 6

### Test 1: Create a Conversation
1. Log in as User A
2. Call: `await messagingService.getOrCreateConversation("USER_B_ID")`
3. ✅ Returns `{ success: true, conversationId: "...", isNew: true }`
4. ✅ Firebase Console → `conversations` collection → new document

### Test 2: Send a Message
1. Call: `await messagingService.sendMessage(conversationId, "Hello from User A! 👋")`
2. ✅ Returns `{ success: true, messageId: "..." }`
3. ✅ Firebase Console → `conversations/{id}/messages` → your message
4. ✅ Firebase Console → conversation doc → `lastMessage.text` = your message
5. ✅ Firebase Console → `unreadCounts.USER_B_ID` = 1

### Test 3: Real-time — Open Two Browser Tabs
1. Open Tab 1 as User A
2. Open Tab 2 as User B
3. In Tab 2 run: `messagingService.listenToMessages(convoId, msgs => console.log('NEW MSGS:', msgs))`
4. In Tab 1 send: `messagingService.sendMessage(convoId, "This appears instantly!")`
5. ✅ Tab 2's console should log the new message **without any refresh**
6. ✅ Message appears within ~1 second

### Test 4: Mark as Read
1. Log in as User B (who has unread = 1)
2. Call: `await messagingService.markConversationAsRead(conversationId)`
3. ✅ Firebase Console → `unreadCounts.USER_B_ID` = 0
4. ✅ Message's `status` = `"read"`

### Test 5: Unread Count Badge
1. Have User A send 3 messages without User B opening the chat
2. User B calls: `const { totalUnread } = await messagingService.getTotalUnreadCount()`
3. ✅ `totalUnread` = 3

### Test 6: Delete a Message
1. As User A, call: `await messagingService.deleteMessage(conversationId, messageId)`
2. ✅ Firebase Console → message doc `isDeleted` = true, `text` = "This message was deleted"
3. ✅ The live listener automatically updates the chat UI
4. Try deleting User B's message as User A
5. ✅ Should return: `{ success: false, error: "You can only delete your own messages" }`

---

## 🔗 FIRESTORE STRUCTURE (Reference)

```
conversations/{uid1_uid2}            ← sorted deterministic ID
├── participants: ["uid1", "uid2"]   ← for array-contains queries
├── participantInfo:
│   ├── uid1: { name, avatar, username }
│   └── uid2: { name, avatar, username }
├── lastMessage: { text, senderId, createdAt }
├── lastMessageAt: timestamp
├── unreadCounts: { uid1: 0, uid2: 3 }
└── createdAt: timestamp

conversations/{uid1_uid2}/messages/{autoId}
├── senderId: "uid1"
├── senderName: "John Doe"
├── senderAvatar: "https://..."
├── text: "Hello!"
├── type: "text"
├── status: "sent" | "delivered" | "read"
├── isDeleted: false
└── createdAt: timestamp
```

---

## 📊 PHASE 6 PROGRESS

```
Task 6.1: Get or create conversation       [✅] Complete
Task 6.2: Send a message                   [✅] Complete
Task 6.3: Real-time listener (onSnapshot)  [✅] Complete
Task 6.4: List conversations (live)        [✅] Complete
Task 6.5: Mark as read                     [✅] Complete
Task 6.6: Delete message (soft-delete)     [✅] Complete
Task 6.7: Unread count (nav badge, live)   [✅] Complete

Progress: 7/7 tasks (100%)
```

---

## ⚠️ NOTES

### Firestore Indexes Needed
These composite indexes must be created in Firestore Console (click the error link when first running):

- `conversations`: `participants (array) ASC + lastMessageAt DESC`
- `conversations/{id}/messages`: `isDeleted ASC + createdAt ASC`
- `conversations/{id}/messages`: `status ASC + senderId ASC` (for markAsRead)

### Listener Cleanup — Important!
Always call the `unsubscribe` function when a user leaves a screen. Example:
```javascript
// When navigating away from Messages screen:
messagingService.stopAllListeners();

// Or stop just one conversation:
messagingService.stopListeningToMessages(conversationId);
```

The `beforeunload` event handler in the service handles page refreshes/closes automatically.

---

## ⏭️ NEXT: PHASE 7 — FILE UPLOADS

Now that messaging works in real-time, we can add **Phase 7: File Uploads**

Phase 7 will add:
- Upload profile photos to Firebase Storage
- Upload post images
- Compress images before upload (save bandwidth)
- Show upload progress bar
- Send image messages in DMs

**Estimated Time:** 2-3 days

---

## 🎯 YOUR ACTION ITEMS

1. ✅ **Create a conversation** between two test accounts
2. ✅ **Send messages back and forth** — verify they appear in real-time
3. ✅ **Check the nav badge** — unread count should update automatically
4. ✅ **Mark as read** — badge should clear when conversation is opened
5. ✅ **Delete a message** — verify "This message was deleted" appears
6. **Reply:** "Phase 6 complete, start Phase 7!" 🚀

---

*Phase 6 Implementation — Real-time Messaging Complete*  
*LynkApp Development System*
