# Camera Flip & Video Display Fix Guide

## Problems Fixed

### Issue 1: Both Users See Their Own Video

- ❌ Remote video wasn't showing (opacity was 0)
- ❌ Both users saw their own camera instead of the other person
- ✅ Fixed: Remote video now shows correctly when `remoteVideoAvailable` is true

### Issue 2: No Camera Flip Button

- ❌ Couldn't switch between front and back camera
- ✅ Added flip camera button with icon
- ✅ Dynamically switches between 'user' (front) and 'environment' (back)

### Issue 3: Mirror Effect on Back Camera

- ❌ Back camera was mirrored (looked wrong)
- ✅ Only front camera is mirrored now
- ✅ Back camera shows normal view

### Issue 4: Small Preview Shows Black

- This happens when:
  - Camera permissions not granted
  - Video track is disabled
  - Local stream not attached properly
- ✅ Fixed with better stream management

## Changes Made

### 1. Added Facing Mode State

```javascript
const [facingMode, setFacingMode] = useState("user"); // 'user' = front, 'environment' = back
```

### 2. Updated getUserMedia to Use Facing Mode

```javascript
video: callType === "video"
  ? {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: facingMode, // Dynamic facing mode
    }
  : false;
```

### 3. Added Camera Flip Function

```javascript
const flipCamera = async () => {
  // Stop current video track
  const videoTrack = localStream.getVideoTracks()[0];
  if (videoTrack) videoTrack.stop();

  // Toggle facing mode
  const newFacingMode = facingMode === "user" ? "environment" : "user";
  setFacingMode(newFacingMode);

  // Get new video stream
  const newStream = await getUserMedia({
    video: { facingMode: newFacingMode },
  });

  // Replace track in peer connection
  const sender = peerRef.current
    .getSenders()
    .find((s) => s.track?.kind === "video");
  await sender.replaceTrack(newVideoTrack);

  // Update local stream and preview
  setLocalStream(updatedStream);
};
```

### 4. Added Flip Camera Button

```javascript
<button onClick={flipCamera}>
  <span className="material-symbols-outlined">flip_camera_android</span>
</button>
```

### 5. Fixed Mirror Effect

```javascript
<video
  style={{
    transform: facingMode === "user" ? "scaleX(-1)" : "none",
  }}
/>
```

- Front camera: Mirrored (natural for selfies)
- Back camera: Normal (not mirrored)

### 6. Added Camera Indicator

Shows "Front" or "Back" on the local video preview

## How Video Display Works

### Remote Video (Full Screen)

- Shows the OTHER person's video
- Controlled by `remoteVideoAvailable` state
- Opacity: 1 when connected and video available, 0 otherwise
- Located at: Full screen background (zIndex: 0)

### Local Video (Small Preview)

- Shows YOUR own camera
- Located at: Bottom-right corner
- Size: 120x160px
- Mirrored only for front camera
- Shows camera indicator (Front/Back)

## Testing Instructions

### Test 1: Basic Video Call

1. Start video call between two devices
2. **Device A should see:**
   - Full screen: Device B's video
   - Small preview (bottom-right): Device A's own video (mirrored)
3. **Device B should see:**
   - Full screen: Device A's video
   - Small preview (bottom-right): Device B's own video (mirrored)

### Test 2: Camera Flip

1. During video call, click the flip camera button (🔄)
2. Camera should switch from front to back
3. Small preview should show:
   - "Back" indicator
   - Normal view (not mirrored)
4. Other person should see your back camera view
5. Click again to switch back to front camera

### Test 3: Video Toggle

1. Click video button to turn off camera
2. Small preview should dim (opacity: 0.3)
3. Other person should see black screen
4. Click again to turn camera back on

## Troubleshooting

### Problem: Both Users See Their Own Video

**Check:**

1. Open browser console
2. Look for: `📹 Received video track`
3. Look for: `✅ Remote video playing successfully`

**If missing:**

- Remote video track not being received
- Check ICE connection state
- Verify offer/answer includes video

**If present but not showing:**

- Check `remoteVideoAvailable` state (should be true)
- Check remote video opacity (should be 1)
- Verify `remoteVideoRef.current.srcObject` is set

**Console Debug:**

```javascript
// Check remote video element
console.log("Remote video:", {
  srcObject: remoteVideoRef.current?.srcObject,
  tracks: remoteVideoRef.current?.srcObject?.getTracks(),
  opacity: window.getComputedStyle(remoteVideoRef.current).opacity,
});

// Check state
console.log("remoteVideoAvailable:", remoteVideoAvailable);
console.log("callStatus:", callStatus);
```

### Problem: Small Preview Shows Black

**Possible Causes:**

1. Camera permissions not granted
2. Local stream not attached
3. Video track disabled

**Check:**

```javascript
console.log("Local stream:", {
  stream: localStream,
  tracks: localStream?.getTracks(),
  videoTrack: localStream?.getVideoTracks()[0],
  enabled: localStream?.getVideoTracks()[0]?.enabled,
});
```

**Fix:**

- Grant camera permissions
- Check if `isVideoOn` is true
- Verify `localVideoRef.current.srcObject` is set

### Problem: Camera Flip Not Working

**Symptoms:**

- Button clicks but camera doesn't change
- Error in console

**Check Console for:**

```
Camera flip error: [error message]
```

**Common Issues:**

1. **Device doesn't have back camera** (laptops)
   - Back camera request will fail
   - Falls back to front camera

2. **Permissions issue**
   - Need to grant camera permission again
   - Some browsers require permission per camera

3. **Track replacement failed**
   - Peer connection might be closed
   - Check connection state

**Debug:**

```javascript
// Check available cameras
navigator.mediaDevices.enumerateDevices().then((devices) => {
  const cameras = devices.filter((d) => d.kind === "videoinput");
  console.log("Available cameras:", cameras);
});
```

### Problem: Mirror Effect Wrong

**Expected Behavior:**

- Front camera: Mirrored (like looking in mirror)
- Back camera: Normal (not mirrored)

**If wrong:**

- Check `facingMode` state
- Verify transform style: `scaleX(-1)` for front, `none` for back

### Problem: Other Person Sees Mirrored Video

**This is CORRECT!**

- Your front camera is mirrored for YOU (in preview)
- But other person sees normal view (not mirrored)
- Only the local preview is mirrored
- Remote video is never mirrored

## Button Layout

```
[Mute] [End Call] [Video] [Flip Camera]
  🎤      ☎️        📹        🔄
```

- Mute: Toggle microphone
- End Call: Hang up (red button, larger)
- Video: Toggle camera on/off
- Flip Camera: Switch front/back (only shows in video calls)

## Mobile vs Desktop

### Mobile (Recommended)

- Has both front and back cameras
- Camera flip works perfectly
- Touch-friendly button size

### Desktop/Laptop

- Usually only has front camera
- Flip button may not work (no back camera)
- Button still shows but will fail gracefully

## Camera Indicator

Small badge on local preview shows:

- 👤 Front - Front-facing camera
- 📷 Back - Back-facing camera

## Expected Console Logs

### Successful Camera Flip:

```
Camera flip error: [if any]
✅ Camera flipped to: environment
```

### Video Call with Remote Video:

```
📹 Received video track
Video track ready
✅ Remote video playing successfully
Status: A:1 V:1
Video Live
```

## Key Points

1. **Remote Video = Other Person**
   - Full screen background
   - Shows what they see

2. **Local Preview = Your Camera**
   - Small box bottom-right
   - Shows what you look like
   - Mirrored for front camera only

3. **Camera Flip**
   - Switches between front/back
   - Updates facing mode
   - Replaces video track in peer connection
   - Other person sees the change immediately

4. **Mirror Logic**
   - Front camera: Mirrored (natural for selfies)
   - Back camera: Not mirrored (natural for photos)
   - Only affects YOUR preview
   - Other person always sees normal view

## Files Modified

- `src/components/Messages.jsx`
  - Added `facingMode` state
  - Added `flipCamera` function
  - Updated `getUserMedia` to use facing mode
  - Added flip camera button
  - Fixed mirror effect logic
  - Added camera indicator

## Summary

✅ Remote video shows other person (full screen)
✅ Local preview shows your camera (small box)
✅ Camera flip button switches front/back
✅ Front camera is mirrored, back camera is not
✅ Camera indicator shows which camera is active
✅ Works on mobile devices with multiple cameras
✅ Gracefully handles devices with only one camera

---

**Video calls should now display correctly with camera flip functionality!** 📹
