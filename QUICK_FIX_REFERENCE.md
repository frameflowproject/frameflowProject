# Quick Fix Reference Card

## What Was Fixed

### 🎤 Voice Calls

- Audio element now properly configured
- Volume set to maximum
- Explicit unmute
- Autoplay retry mechanism

### 📹 Video Calls

- Video element correctly muted (audio from audio element)
- Track handling order fixed (media → tracks → offer)
- Remote track processing simplified
- Comprehensive logging added

### 🎬 Co-Watch Voice

- Added missing audio element
- Implemented audio playback
- Same autoplay retry as calls

## Key Changes

```javascript
// Audio Element (for sound)
<audio ref={remoteAudioRef} muted={false} volume={1.0} />

// Video Element (for video only)
<video ref={remoteVideoRef} muted={true} />
```

## Testing (2 devices needed)

### Voice Call

1. Messages → Click 📞 → Accept → Talk

### Video Call

1. Messages → Click 🎥 → Accept → See & Talk

### Co-Watch

1. Videos → Watch Together → Join → Talk

## Debug Overlay (Top-Left)

```
✅ Good Video Call:
Media Ready
Ice: connected
Status: A:1 V:1
Audio Live
Video Live

✅ Good Voice Call:
Media Ready
Ice: connected
Status: A:1 V:0
Audio Live
```

## Common Issues

| Issue         | Fix                      |
| ------------- | ------------------------ |
| No sound      | Click screen             |
| No video      | Check camera permission  |
| Echo          | Shouldn't happen (fixed) |
| Won't connect | Check network/firewall   |

## Console Logs to Look For

```
✅ Got local media: { audio: 1, video: 1 }
✅ ICE Connection established
📹 Received audio track
📹 Received video track
✅ Remote audio playing successfully
✅ Remote video playing successfully
```

## Files Changed

- `src/components/Messages.jsx` - Call modal fixes
- `src/components/VideoFeed.jsx` - Co-watch audio added

## Full Guides

- `VIDEO_CALL_FIX_GUIDE.md` - Detailed video call testing
- `VOICE_CALL_FIX_GUIDE.md` - Detailed voice call testing
- `COMPLETE_CALL_FIX_SUMMARY.md` - Complete overview

---

**Everything should work now!** 🚀
