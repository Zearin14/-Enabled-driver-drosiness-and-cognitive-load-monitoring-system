**NeuroDrive** is a real-time driver drowsiness and cognitive load monitoring system that runs entirely in the browser with just a webcam.

### What it does
- Tracks the driver's face live using **MediaPipe Face Landmarker** (468 face points)
- Measures **eye closure (EAR)**, **blink rate**, **yawns**, **PERCLOS** (% of time eyes closed in the last 60s), **head nods** and **looking away**
- Combines them into a **Drowsiness Score (0–100)** and a **Cognitive Load** level
- Fires a **full-screen red alert and loud alarm** if eyes stay closed for 2 seconds or the score passes 70, until the driver clicks "I'm Awake"

### Why it matters
Drowsy drivers often close their eyes for a few seconds without noticing, and most cars have nothing to warn them. NeuroDrive needs no extra hardware and no video leaves the device.

### Tech stack
React · TypeScript · Vite · MediaPipe Tasks Vision · Recharts · Web Audio API

### Try it
Open the app in Chrome, allow camera access, look at the camera and close your eyes for 2 seconds.
