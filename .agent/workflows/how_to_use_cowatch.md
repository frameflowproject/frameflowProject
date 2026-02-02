---
description: Guide on how to use and integrate the Co-Watch Reels feature
---

# Co-Watch Reels Feature Guide

## 1. Where is it located?
The core UI is located in:
- **`src/components/VideoFeed.jsx`**: This is the main Reels/Video feed. It now contains the logic to render the `CoWatchOverlay`.
- **`src/components/CoWatchOverlay.jsx`**: This is the new glassmorphic UI component that sits on top of the video.

## 2. How to use it (User Flow)
Currently, we have implemented the **UI and State logic**. To make it fully functional with a friend, the following flow is designed:

1.  **Start from Chat**:
    - Users go to a private conversation in `Messages.jsx`.
    - They click a "Watch Together" button (needs to be added to the chat menu).

2.  **Redirect**:
    - Both users are redirected to the `/videos` page.
    - The URL will look like: `http://localhost:5173/videos?cowatch=true&friendId=123`.

3.  **The Experience**:
    - The `VideoFeed` component detects `cowatch=true` in the URL.
    - It activates `isCoWatching = true`.
    - The `CoWatchOverlay` appears on top of the video.
    - Users see each other's avatars.
    - When User A scrolls, User B's screen automatically scrolls (via Socket.io).
    - Audio from the video is lowered (ducking) when friends talk.

## 3. How to Test the UI *Now*
You can see the perfect UI we just built by adding `?cowatch=true` to your URL.

1.  Open your browser to: `http://localhost:5173/videos?cowatch=true`
2.  You will see:
    - The new "Co-Watch" glass panel.
    - Floating avatars (yours and a simulated friend).
    - A volume slider for "Voice vs Video" balance.
    - A green ring animation when the friend "talks".

## 4. Next Implementation Steps (Backend)
To make it "only with friends" and fully real-time:
1.  **Socket Event**: In `chatNamespace`, listen for `join_cowatch_room`.
2.  **Sync Event**: When User A scrolls, emit `sync_video_index` to User B.
3.  **Voice**: Reuse the existing `peerConnection` from `ChatContext` to carry audio while on the `/videos` page.
