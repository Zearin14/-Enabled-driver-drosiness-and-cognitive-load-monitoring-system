import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';

export interface HeadPose {
  pitch: number; // Down (-), Up (+)
  yaw: number;   // Left (-), Right (+)
  roll: number;  // Tilt left (-), Tilt right (+)
}

export interface TelemetryPoint {
  timestamp: number;
  timeLabel: string;
  drowsinessScore: number;
  cognitiveLoad: number;
  ear: number;
  perclos: number;
  roadFocus: number;
}

export type VisionStatus =
  | 'loading_model'
  | 'requesting_camera'
  | 'permission_denied'
  | 'ready'
  | 'error';

// Euclidean distance between two 2D/3D landmarks
function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Left and right eye landmark indices in MediaPipe 468/478 mesh
const LEFT_EYE_INDICES = {
  corner1: 33,
  corner2: 133,
  top1: 160,
  bottom1: 144,
  top2: 158,
  bottom2: 153,
  all: [33, 160, 158, 133, 153, 144],
};

const RIGHT_EYE_INDICES = {
  corner1: 362,
  corner2: 263,
  top1: 385,
  bottom1: 380,
  top2: 387,
  bottom2: 373,
  all: [362, 385, 387, 263, 373, 380],
};

// Mouth landmarks
const MOUTH_INDICES = {
  top: 13,
  bottom: 14,
  left: 78,
  right: 308,
};

// Face oval indices for drawing outline
const FACE_OVAL_INDICES = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
  397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
  172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10
];

export function useDriverVision(onEmergencyAlarm?: () => void) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Status and errors
  const [status, setStatus] = useState<VisionStatus>('loading_model');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState<boolean>(false);

  // Live metrics (updated per frame / throttled to React state)
  const [ear, setEar] = useState<number>(0.32);
  const [earThreshold, setEarThreshold] = useState<number>(0.21);
  const [isEyesClosed, setIsEyesClosed] = useState<boolean>(false);
  const [eyeClosedDurationSec, setEyeClosedDurationSec] = useState<number>(0);
  const [blinkCount, setBlinkCount] = useState<number>(0);
  const [blinksPerMinute, setBlinksPerMinute] = useState<number>(16);

  const [mar, setMar] = useState<number>(0.15);
  const [isYawning, setIsYawning] = useState<boolean>(false);
  const [yawnCount, setYawnCount] = useState<number>(0);

  const [perclos, setPerclos] = useState<number>(4.0); // %
  const [headPose, setHeadPose] = useState<HeadPose>({ pitch: 0, yaw: 0, roll: 0 });
  const [isNodding, setIsNodding] = useState<boolean>(false);
  const [roadFocusPercent, setRoadFocusPercent] = useState<number>(98);

  const [drowsinessScore, setDrowsinessScore] = useState<number>(12);
  const [cognitiveLoad, setCognitiveLoad] = useState<number>(34);

  // Rolling 60s history array (sampled every 1 second)
  const [history60s, setHistory60s] = useState<TelemetryPoint[]>([]);

  // Internal state tracking refs
  const eyeClosedStartRef = useRef<number | null>(null);
  const currentClosedDurationRef = useRef<number>(0);
  const isEyeClosedRef = useRef<boolean>(false);
  const blinkTimestampsRef = useRef<number[]>([]);

  const yawnStartRef = useRef<number | null>(null);
  const isYawningRef = useRef<boolean>(false);
  const yawnCountRef = useRef<number>(0);

  // Rolling 60s window samples for PERCLOS and Gaze
  const eyeSamplesRef = useRef<{ time: number; isClosed: boolean }[]>([]);
  const gazeSamplesRef = useRef<{ time: number; isAway: boolean }[]>([]);

  // Head pose and pitch tracking for nod detection
  const recentPitchSamplesRef = useRef<{ time: number; pitch: number }[]>([]);
  const isNoddingRef = useRef<boolean>(false);

  // Emergency alarm trigger throttle
  const alarmTriggeredRef = useRef<boolean>(false);
  const lastAlarmTimeRef = useRef<number>(0);

  // Last video timestamp for detectForVideo
  const lastVideoTimestampRef = useRef<number>(-1);

  // History sample timer ref
  const lastHistorySampleTimeRef = useRef<number>(0);

  // Calibrate current open eye EAR
  const calibrate = useCallback(() => {
    if (ear > 0.15) {
      const newThreshold = Math.max(0.16, Math.min(0.28, Number((ear * 0.70).toFixed(2))));
      setEarThreshold(newThreshold);
      return newThreshold;
    }
    return earThreshold;
  }, [ear, earThreshold]);

  // Reset alarm flag
  const resetAlarmState = useCallback(() => {
    alarmTriggeredRef.current = false;
  }, []);

  // 1. Initialize FaceLandmarker
  useEffect(() => {
    let isCancelled = false;

    async function initModel() {
      try {
        setStatus('loading_model');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
        );

        if (isCancelled) return;

        let landmarker: FaceLandmarker;
        try {
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
            outputFaceBlendshapes: true,
          });
        } catch {
          // GPU fallback to CPU if GPU delegate initialization fails
          landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
            outputFaceBlendshapes: true,
          });
        }

        if (isCancelled) return;

        landmarkerRef.current = landmarker;
        setStatus('requesting_camera');
      } catch (err: unknown) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setErrorMessage(`Failed to load MediaPipe FaceLandmarker model: ${message}`);
          setStatus('error');
        }
      }
    }

    initModel();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Robust media stream acquisition with step-by-step fallbacks
  const acquireMediaStream = useCallback(async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error(
        'navigator.mediaDevices.getUserMedia is not available. Please verify you are using HTTPS or a secure context.'
      );
    }

    // Attempt 1: 720p front-facing camera
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });
    } catch {
      // Fallback
    }

    // Attempt 2: Flexible front-facing
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
    } catch {
      // Fallback
    }

    // Attempt 3: Any available video stream
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }, []);

  // Callable function to request or retry camera permissions (e.g. on direct user click)
  const requestCameraPermission = useCallback(async () => {
    setStatus('requesting_camera');
    setErrorMessage(null);

    try {
      const stream = await acquireMediaStream();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(() => {});
            setStatus('ready');
          }
        };
      }
    } catch (err: unknown) {
      setStatus('permission_denied');
      const errName = err instanceof Error ? err.name : '';
      const message = err instanceof Error ? err.message : String(err);

      if (errName === 'NotAllowedError' || message.includes('Permission')) {
        setErrorMessage(
          'Camera permission was blocked. Please click "Grant / Request Permission" below or check the camera settings in your browser.'
        );
      } else if (errName === 'NotFoundError' || message.includes('DevicesNotFoundError')) {
        setErrorMessage(
          'No camera device was detected on your computer. Please check that a webcam is plugged in and enabled.'
        );
      } else if (errName === 'NotReadableError') {
        setErrorMessage(
          'The webcam is currently in use by another application. Please close other camera apps and retry.'
        );
      } else {
        setErrorMessage(`Camera error: ${message}`);
      }
    }
  }, [acquireMediaStream]);

  // Request camera automatically when model finishes loading
  useEffect(() => {
    if (status === 'requesting_camera' && !streamRef.current) {
      requestCameraPermission();
    }
  }, [status, requestCameraPermission]);

  // 3. Main detectForVideo requestAnimationFrame loop
  useEffect(() => {
    if (status !== 'ready') return;

    let isRunning = true;
    let lastUiUpdate = 0;

    const processFrame = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker && video.readyState >= 2) {
        const now = performance.now();

        // Canvas overlay sizing match
        if (canvas) {
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
          }
        }

        // Only detect if video timestamp is newer
        if (video.currentTime !== lastVideoTimestampRef.current) {
          lastVideoTimestampRef.current = video.currentTime;

          try {
            const results: FaceLandmarkerResult = landmarker.detectForVideo(video, now);

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              const landmarks = results.faceLandmarks[0];
              setFaceDetected(true);

              // -------------------------------------------------------------
              // 1. Compute Eye Aspect Ratio (EAR) for both eyes
              // -------------------------------------------------------------
              const leftCornerDist = dist(
                landmarks[LEFT_EYE_INDICES.corner1],
                landmarks[LEFT_EYE_INDICES.corner2]
              );
              const leftVertical1 = dist(
                landmarks[LEFT_EYE_INDICES.top1],
                landmarks[LEFT_EYE_INDICES.bottom1]
              );
              const leftVertical2 = dist(
                landmarks[LEFT_EYE_INDICES.top2],
                landmarks[LEFT_EYE_INDICES.bottom2]
              );
              const leftEarVal = (leftVertical1 + leftVertical2) / (2.0 * (leftCornerDist || 0.001));

              const rightCornerDist = dist(
                landmarks[RIGHT_EYE_INDICES.corner1],
                landmarks[RIGHT_EYE_INDICES.corner2]
              );
              const rightVertical1 = dist(
                landmarks[RIGHT_EYE_INDICES.top1],
                landmarks[RIGHT_EYE_INDICES.bottom1]
              );
              const rightVertical2 = dist(
                landmarks[RIGHT_EYE_INDICES.top2],
                landmarks[RIGHT_EYE_INDICES.bottom2]
              );
              const rightEarVal = (rightVertical1 + rightVertical2) / (2.0 * (rightCornerDist || 0.001));

              const currentEar = Number(((leftEarVal + rightEarVal) / 2.0).toFixed(3));
              const closed = currentEar < earThreshold;

              // Eye closure state machine & duration
              if (closed) {
                if (!isEyeClosedRef.current) {
                  // Transition from open to closed
                  eyeClosedStartRef.current = now;
                  isEyeClosedRef.current = true;
                }
                const duration = (now - (eyeClosedStartRef.current || now)) / 1000;
                currentClosedDurationRef.current = duration;
              } else {
                if (isEyeClosedRef.current) {
                  // Transition from closed to open: compute blink
                  const duration = (now - (eyeClosedStartRef.current || now)) / 1000;
                  // Genuine blink is between 0.06s and 1.2s
                  if (duration >= 0.06 && duration <= 1.2) {
                    blinkTimestampsRef.current.push(now);
                    setBlinkCount((prev) => prev + 1);
                  }
                  isEyeClosedRef.current = false;
                  eyeClosedStartRef.current = null;
                  currentClosedDurationRef.current = 0;
                }
              }

              // Prune blinks older than 60s
              blinkTimestampsRef.current = blinkTimestampsRef.current.filter((t) => now - t < 60000);
              const currentBpm = blinkTimestampsRef.current.length;

              // -------------------------------------------------------------
              // 2. Compute Mouth Aspect Ratio (MAR) for Yawn Detection
              // -------------------------------------------------------------
              const mouthVertical = dist(landmarks[MOUTH_INDICES.top], landmarks[MOUTH_INDICES.bottom]);
              const mouthHorizontal = dist(landmarks[MOUTH_INDICES.left], landmarks[MOUTH_INDICES.right]);
              const currentMar = Number((mouthVertical / (mouthHorizontal || 0.001)).toFixed(3));

              if (currentMar > 0.60) {
                if (!yawnStartRef.current) {
                  yawnStartRef.current = now;
                } else if (now - yawnStartRef.current > 1000) {
                  // Sustained for over 1 second!
                  if (!isYawningRef.current) {
                    isYawningRef.current = true;
                    yawnCountRef.current += 1;
                    setYawnCount(yawnCountRef.current);
                  }
                }
              } else if (currentMar < 0.45) {
                yawnStartRef.current = null;
                isYawningRef.current = false;
              }

              // -------------------------------------------------------------
              // 3. Compute PERCLOS over rolling 60 seconds
              // -------------------------------------------------------------
              eyeSamplesRef.current.push({ time: now, isClosed: closed });
              eyeSamplesRef.current = eyeSamplesRef.current.filter((s) => now - s.time <= 60000);
              const closedCount = eyeSamplesRef.current.filter((s) => s.isClosed).length;
              const currentPerclos = Number(
                ((closedCount / (eyeSamplesRef.current.length || 1)) * 100).toFixed(1)
              );

              // -------------------------------------------------------------
              // 4. Compute Head Pose (Pitch, Yaw, Roll) & Nod Detection
              // -------------------------------------------------------------
              let pitch = 0;
              let yaw = 0;
              let roll = 0;

              if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
                const mat = results.facialTransformationMatrixes[0].data;
                // Standard column-major 4x4 matrix decomposition
                pitch = Math.atan2(-mat[9], mat[10]) * (180 / Math.PI);
                yaw = Math.atan2(mat[8], Math.sqrt(mat[9] * mat[9] + mat[10] * mat[10])) * (180 / Math.PI);
                roll = Math.atan2(-mat[4], mat[0]) * (180 / Math.PI);
              } else {
                // Landmark fallback estimation
                const nose = landmarks[1];
                const chin = landmarks[152];
                const forehead = landmarks[10];
                const leftCheek = landmarks[234];
                const rightCheek = landmarks[454];

                pitch = (nose.y - (forehead.y + chin.y) / 2) * 120;
                yaw = (nose.x - (leftCheek.x + rightCheek.x) / 2) * 140;
                roll = Math.atan2(rightCheek.y - leftCheek.y, rightCheek.x - leftCheek.x) * (180 / Math.PI);
              }

              pitch = Number(pitch.toFixed(1));
              yaw = Number(yaw.toFixed(1));
              roll = Number(roll.toFixed(1));

              // Nod detection: rapid downward pitch drop
              recentPitchSamplesRef.current.push({ time: now, pitch });
              recentPitchSamplesRef.current = recentPitchSamplesRef.current.filter(
                (p) => now - p.time <= 2000
              );
              if (recentPitchSamplesRef.current.length > 10) {
                const oldestPitch = recentPitchSamplesRef.current[0].pitch;
                const pitchDelta = pitch - oldestPitch;
                // If pitch dropped sharply (> 12 degrees down) or pitch is deeply drooped
                if (pitchDelta < -12 || (pitch < -16 && closed)) {
                  isNoddingRef.current = true;
                } else if (pitch > -6) {
                  isNoddingRef.current = false;
                }
              }

              // -------------------------------------------------------------
              // 5. Gaze / Face Away Percentage
              // -------------------------------------------------------------
              const isLookingAway = Math.abs(yaw) > 18 || Math.abs(pitch) > 18;
              gazeSamplesRef.current.push({ time: now, isAway: isLookingAway });
              gazeSamplesRef.current = gazeSamplesRef.current.filter((g) => now - g.time <= 60000);
              const awayCount = gazeSamplesRef.current.filter((g) => g.isAway).length;
              const currentRoadFocus = Number(
                (100 - (awayCount / (gazeSamplesRef.current.length || 1)) * 100).toFixed(1)
              );

              // -------------------------------------------------------------
              // 6. Drowsiness Score (0 - 100) - Calculated STRICTLY from real values
              // -------------------------------------------------------------
              let dScore = 0;

              // Eyes closed weight: rapidly escalates with continuous closure duration
              if (closed) {
                const duration = currentClosedDurationRef.current;
                if (duration >= 2.0) {
                  dScore += 100; // Sustained micro-sleep!
                } else if (duration >= 1.5) {
                  dScore += 75;
                } else if (duration >= 1.0) {
                  dScore += 50;
                } else if (duration >= 0.5) {
                  dScore += 25;
                } else {
                  dScore += 12;
                }
              }

              // PERCLOS contribution (normal is < 8%, danger > 15%)
              dScore += Math.min(45, currentPerclos * 2.5);

              // Yawn contribution
              dScore += Math.min(25, yawnCountRef.current * 10);

              // Head nod anomaly
              if (isNoddingRef.current) {
                dScore += 25;
              }

              // Abnormal blink frequency
              if (currentBpm < 8 || currentBpm > 28) {
                dScore += 10;
              }

              const finalDrowsinessScore = Math.min(100, Math.max(0, Math.round(dScore)));

              // -------------------------------------------------------------
              // 7. Cognitive Load % (0 - 100) - Calculated STRICTLY from real values
              // -------------------------------------------------------------
              let cLoad = 28; // Alert baseline
              // Head rotation variance / scanning mirrors
              cLoad += Math.min(22, (Math.abs(yaw) + Math.abs(pitch)) * 0.6);
              // Blink rate engagement
              cLoad += Math.min(18, currentBpm * 0.8);
              // Mouth / facial tension
              cLoad += Math.min(12, Math.abs(currentMar - 0.2) * 25);
              // If fatigued, driver is straining to focus
              if (finalDrowsinessScore > 40) {
                cLoad += Math.min(20, (finalDrowsinessScore - 40) * 0.4);
              }
              const finalCognitiveLoad = Math.min(95, Math.max(15, Math.round(cLoad)));

              // -------------------------------------------------------------
              // 8. Emergency Red Alert Trigger
              // "If eyes are closed for 2 seconds or drowsiness score > 70"
              // -------------------------------------------------------------
              if (
                (currentClosedDurationRef.current >= 2.0 || finalDrowsinessScore > 70) &&
                !alarmTriggeredRef.current
              ) {
                alarmTriggeredRef.current = true;
                lastAlarmTimeRef.current = now;
                if (onEmergencyAlarm) {
                  onEmergencyAlarm();
                }
              }

              // -------------------------------------------------------------
              // 9. Throttle React State Updates (~20Hz for smooth UI)
              // -------------------------------------------------------------
              if (now - lastUiUpdate > 50) {
                lastUiUpdate = now;
                setEar(currentEar);
                setIsEyesClosed(closed);
                setEyeClosedDurationSec(Number(currentClosedDurationRef.current.toFixed(1)));
                setBlinksPerMinute(currentBpm);
                setMar(currentMar);
                setIsYawning(isYawningRef.current);
                setPerclos(currentPerclos);
                setHeadPose({ pitch, yaw, roll });
                setIsNodding(isNoddingRef.current);
                setRoadFocusPercent(currentRoadFocus);
                setDrowsinessScore(finalDrowsinessScore);
                setCognitiveLoad(finalCognitiveLoad);
              }

              // -------------------------------------------------------------
              // 10. Record 1-second sample into rolling 60s history array
              // -------------------------------------------------------------
              if (now - lastHistorySampleTimeRef.current >= 1000) {
                lastHistorySampleTimeRef.current = now;
                const sampleSecondsAgo = Math.min(
                  60,
                  Math.round((now - (lastHistorySampleTimeRef.current || now)) / 1000)
                );
                const timeLabel = `T-${60 - (history60s.length % 60)}s`;

                setHistory60s((prev) => {
                  const newPoint: TelemetryPoint = {
                    timestamp: now,
                    timeLabel: `-${60 - Math.min(59, prev.length)}s`,
                    drowsinessScore: finalDrowsinessScore,
                    cognitiveLoad: finalCognitiveLoad,
                    ear: currentEar,
                    perclos: currentPerclos,
                    roadFocus: currentRoadFocus,
                  };
                  const updated = [...prev, newPoint];
                  return updated.length > 60 ? updated.slice(updated.length - 60) : updated;
                });
              }

              // -------------------------------------------------------------
              // 11. Draw Real Face Landmarks on Canvas Overlay
              // -------------------------------------------------------------
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  const w = canvas.width;
                  const h = canvas.height;
                  ctx.clearRect(0, 0, w, h);

                  // A. Draw Face Oval Contour
                  ctx.beginPath();
                  ctx.strokeStyle = closed ? 'rgba(255, 23, 68, 0.45)' : 'rgba(0, 229, 255, 0.35)';
                  ctx.lineWidth = 1.5;
                  for (let i = 0; i < FACE_OVAL_INDICES.length; i++) {
                    const pt = landmarks[FACE_OVAL_INDICES[i]];
                    const x = pt.x * w;
                    const y = pt.y * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.stroke();

                  // B. Draw Left Eye Contour (highlighted)
                  ctx.beginPath();
                  ctx.strokeStyle = closed ? '#ff1744' : '#05e777';
                  ctx.lineWidth = closed ? 3.0 : 2.0;
                  const leftIndices = [33, 160, 158, 133, 153, 144, 33];
                  for (let i = 0; i < leftIndices.length; i++) {
                    const pt = landmarks[leftIndices[i]];
                    const x = pt.x * w;
                    const y = pt.y * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.stroke();

                  // C. Draw Right Eye Contour (highlighted)
                  ctx.beginPath();
                  ctx.strokeStyle = closed ? '#ff1744' : '#05e777';
                  ctx.lineWidth = closed ? 3.0 : 2.0;
                  const rightIndices = [362, 385, 387, 263, 373, 380, 362];
                  for (let i = 0; i < rightIndices.length; i++) {
                    const pt = landmarks[rightIndices[i]];
                    const x = pt.x * w;
                    const y = pt.y * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.stroke();

                  // D. Draw Irises if open
                  if (!closed) {
                    // Left iris center ~468, right iris center ~473
                    if (landmarks[468]) {
                      const lx = landmarks[468].x * w;
                      const ly = landmarks[468].y * h;
                      ctx.fillStyle = '#00e5ff';
                      ctx.beginPath();
                      ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
                      ctx.fill();
                    }
                    if (landmarks[473]) {
                      const rx = landmarks[473].x * w;
                      const ry = landmarks[473].y * h;
                      ctx.fillStyle = '#00e5ff';
                      ctx.beginPath();
                      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
                      ctx.fill();
                    }
                  }

                  // E. Draw Mouth Contour
                  ctx.beginPath();
                  ctx.strokeStyle = isYawningRef.current ? '#ffc769' : 'rgba(0, 229, 255, 0.5)';
                  ctx.lineWidth = isYawningRef.current ? 2.5 : 1.5;
                  const mouthPts = [78, 13, 308, 14, 78];
                  for (let i = 0; i < mouthPts.length; i++) {
                    const pt = landmarks[mouthPts[i]];
                    const x = pt.x * w;
                    const y = pt.y * h;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                  }
                  ctx.stroke();

                  // F. Draw 3D Nose Attitude Vector
                  const nosePt = landmarks[1];
                  const nx = nosePt.x * w;
                  const ny = nosePt.y * h;
                  const rayLength = 40;
                  const rayEndX = nx + (yaw / 30) * rayLength;
                  const rayEndY = ny + (pitch / 30) * rayLength;

                  ctx.beginPath();
                  ctx.strokeStyle = '#00e5ff';
                  ctx.lineWidth = 2.0;
                  ctx.moveTo(nx, ny);
                  ctx.lineTo(rayEndX, rayEndY);
                  ctx.stroke();

                  ctx.beginPath();
                  ctx.fillStyle = '#00e5ff';
                  ctx.arc(rayEndX, rayEndY, 3, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            } else {
              // No face detected in frame
              setFaceDetected(false);
              // Clear canvas overlay
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }
          } catch {
            // Frame processing error
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [status, earThreshold, onEmergencyAlarm, history60s.length]);

  return {
    videoRef,
    canvasRef,
    status,
    errorMessage,
    faceDetected,
    ear,
    earThreshold,
    isEyesClosed,
    eyeClosedDurationSec,
    blinkCount,
    blinksPerMinute,
    mar,
    isYawning,
    yawnCount,
    perclos,
    headPose,
    isNodding,
    roadFocusPercent,
    drowsinessScore,
    cognitiveLoad,
    history60s,
    calibrate,
    resetAlarmState,
    requestCameraPermission,
  };
}
