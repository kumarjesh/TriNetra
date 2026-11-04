# TriNetra (त्रिनेत्र) — Spatial AI Navigation Assistant 👁️⚡

> **An accessibility-first Spatial AI assistant turning smartphones into an intelligent, hands-free "third eye" for blind and visually impaired pedestrians.**

TriNetra extends the spatial awareness of pedestrians beyond the 1–2 meter tactile reach of a physical white cane to 5+ meters ahead. It achieves this using real-time on-device edge computer vision, IoU object tracking, directional 3D binaural audio radar, multi-pattern haptics, and hands-free Google Assistant voice activation.

---

## 🌟 Core Features & Architecture

```
[ Camera Stream ]
       │
       ▼
[ Letterbox 640×640 ] ────────► [ Pre-processing & Normalization ]
                                              │
                                              ▼
                        ┌───────────────────────────────────────────┐
                        │ Primary Engine: YOLOv10-Nano (ONNX Web)   │
                        │ (Fallback Engine: MobileNet COCO-SSD)     │
                        └───────────────────────────────────────────┘
                                              │
                                              ▼
                                   [ Raw Bounding Boxes ]
                                              │
                                              ▼
                                 [ IoU Tracking & Smoothing ]
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
          [ Spatial 3D Audio Radar ]                    [ Spoken Hazard Alerts ]
      (Stereo Panning + Pitch Scaling)              (Priority Web Speech API Queue)
```

- **🧠 Dual-Engine Edge AI Vision:**
  - **Primary:** State-of-the-art **YOLOv10-Nano (`yolov10n.onnx`)** executed on-device via **ONNX Runtime Web** (`onnxruntime-web`) with WebGL/WASM acceleration. Features end-to-end NMS-free architecture for sub-50ms latency.
  - **Fallback:** Automatic graceful fallback to **COCO-SSD** (`lite_mobilenet_v2` via TensorFlow.js) if hardware lacks WebGL/WASM support.
  - **Zero Server Latency & 100% Privacy:** Video frames are processed entirely on-device; no camera images or telemetry leave the smartphone.
- **🔗 Frame-to-Frame IoU Tracking & Smoothing:**
  - Intersection-over-Union (IoU) object persistence across frames.
  - Exponential Moving Average (EMA) spatial coordinate smoothing ($\alpha = 0.4$) to eliminate bounding box jitter.
  - Directional zone categorization (`LEFT`, `CENTER`, `RIGHT`) with 3-frame hysteresis.
  - Real-time looming detection ($\Delta\text{area} / \Delta t > 15\%/\text{sec}$) that flags rapid approaching collisions.
- **🎵 Binaural Spatial 3D Audio Radar:**
  - Synthesized via the **Web Audio API** with stereo panning nodes (Left `-0.8`, Center `0.0`, Right `+0.8`).
  - Dynamic frequency pitch scaling (440 Hz low tone at 5m $\rightarrow$ 880 Hz high-urgency tone at 1m) mapping obstacle distance directly to acoustic pitch.
- **🔊 Prioritized Spoken Alerts:**
  - Natural speech announcements (`"Stop. Car very close ahead."`, `"Person approaching on left."`) managed by a priority speech dispatcher with interrupt capabilities.
- **🎙️ Google Assistant Hands-Free Voice Launch:**
  - Packaged as an Android **Trusted Web Activity (TWA)** registering `com.trinetra.app` in Android's `PackageManager`.
  - Blind users can launch the app without touching the screen by saying:
    > *"Hey Google, open TriNetra"*
- **📳 Multi-Pattern Directional Haptics:**
  - Distinct vibration rhythms for Center (triple pulse), Left (long-short), Right (short-long), and Critical Looming Hazards (continuous rapid vibration).
- **👆 Blind-First Gesture Interface:**
  - The entire screen is an interactive touch surface designed for zero visual targeting:
    - **Single Tap:** Toggle scanning state (`ACTIVE` $\leftrightarrow$ `PAUSED`)
    - **Double Tap:** Re-announce latest hazard
    - **Swipe Up:** Toggle camera flashlight
    - **Swipe Down:** Read device diagnostics (battery, FPS, current mode)
    - **Long Press (1.5s):** Cycle audio modes (`FULL`, `VOICE_ONLY`, `SONAR_ONLY`, `EMERGENCY_ONLY`)
    - **Two-Finger Double Tap:** Comprehensive diagnostic readout
    - **Two-Finger Long Press:** Open accessible settings panel
    - **Three-Finger Tap:** Emergency pause
- **🛡️ Full-Screen Standalone TWA Experience:**
  - Uses Google **Digital Asset Links** (`.well-known/assetlinks.json`) verified against the app's SHA-256 signing certificate to completely eliminate browser URL address bars.
- **📶 Complete Offline Operation:**
  - Service Worker precaches application bundles, WASM runtimes, and local ONNX model weights (`35MB+` model cache) for full functionality without an active internet connection.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS v4 (WCAG AAA High-Contrast OLED Theme) |
| **Edge Vision Inference** | ONNX Runtime Web (`onnxruntime-web`), TensorFlow.js (`@tensorflow/tfjs`) |
| **Neural Network Models** | YOLOv10-Nano (`yolov10n.onnx`), MobileNetV2 COCO-SSD |
| **Audio & Acoustics** | Web Audio API (OscillatorNode, StereoPannerNode, GainNode), Web Speech API |
| **Device APIs** | MediaDevices API (`getUserMedia`), Vibration API, Screen Wake Lock API |
| **Packaging & Mobile** | Android Trusted Web Activity (TWA), Bubblewrap CLI (`@bubblewrap/cli`), Gradle 8.11 |
| **Runtime & SDK** | Node.js 18+, Java 17 LTS (Adoptium / Microsoft OpenJDK), Android SDK API 36 |

---

## 📁 Project Structure

```text
7th Sense/
├── android-twa/                  # Android Trusted Web Activity (TWA) project
│   ├── app/                      # Native Android wrapper module
│   ├── android.keystore          # Production signing keystore
│   ├── twa-manifest.json         # TWA configuration & SHA-256 certificate metadata
│   ├── app-release-signed.apk    # Compiled release APK
│   └── app-release-bundle.aab    # Compiled release Google Play Bundle
├── public/
│   ├── .well-known/
│   │   └── assetlinks.json       # Digital Asset Links verification
│   ├── models/
│   │   └── yolov10n.onnx         # YOLOv10-Nano neural network weights (8.95 MB)
│   ├── ort-wasm/                 # Local ONNX Runtime WebAssembly execution engine
│   ├── logo.png                  # TriNetra eye logo
│   └── manifest.webmanifest      # Progressive Web App manifest
├── src/
│   ├── components/               # React UI & HUD components
│   │   ├── CameraFeed.tsx        # Camera viewport & debug overlay
│   │   ├── GestureOverlay.tsx    # Blind-first touch gesture surface
│   │   ├── SettingsPanel.tsx     # Accessible audio, sensitivity & mode settings
│   │   └── StatusAnnouncement.tsx# Spoken & visual HUD readouts
│   ├── engines/                  # Core processing engines
│   │   ├── YoloV10Engine.ts      # YOLOv10n ONNX tensor executor & letterboxing
│   │   ├── VisionPipeline.ts     # Primary/fallback pipeline coordinator
│   │   ├── TrackingManager.ts    # IoU tracking, EMA smoothing & looming calculator
│   │   ├── AlertManager.ts       # Threat classification & priority dispatcher
│   │   ├── SonarEngine.ts        # 3D spatial audio radar synthesis
│   │   ├── SpeechEngine.ts       # Web Speech API speech synthesizer
│   │   └── PerformanceMonitor.ts # Adaptive quality throttling & FPS optimizer
│   └── hooks/                    # Reusable React hooks (useCamera, useGestures)
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **Java**: JDK 17 (Required for Android TWA builds)
- **Modern Browser**: Chrome / Chromium / Edge / Safari (with WebGL and Camera support)

### Installation

```bash
# Clone the repository
git clone https://github.com/kumarjesh/7th_Sense.git
cd 7th_Sense

# Install web dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Production Web Build

```bash
npm run build
npm run preview
```

---

## 📱 Building the Android APK (TWA)

To compile the native Android application package:

```bash
cd android-twa
bubblewrap build
```

- When prompted for the signing key password, enter your keystore password (e.g. `trinetra123`).
- Outputs:
  - **Signed APK:** `android-twa/app-release-signed.apk`
  - **App Bundle:** `android-twa/app-release-bundle.aab`

Install directly onto an Android device using `adb`:
```bash
adb install -r android-twa/app-release-signed.apk
```

---

## ☁️ Deployment

1. Deploy the web application to [Vercel](https://vercel.com) (or any static HTTPS host).
2. Ensure `public/.well-known/assetlinks.json` matches your keystore SHA-256 fingerprint:
   ```json
   [
     {
       "relation": ["delegate_permission/common.handle_all_urls"],
       "target": {
         "namespace": "android_app",
         "package_name": "com.trinetra.app",
         "sha256_cert_fingerprints": [
           "7C:90:9A:60:4B:AE:5E:6F:D6:87:27:D5:CF:73:5C:31:71:B5:94:DE:F0:84:53:EE:31:D1:3E:3A:B2:0D:D1:E9"
         ]
       }
     }
   ]
   ```
3. Test Digital Asset Links verification at:
   `https://digitalassetlinks.googleapis.com/v1/statements:check?source.web.site=https://YOUR_DOMAIN&relation=delegate_permission/common.handle_all_urls&target.android_app.package_name=com.trinetra.app&target.android_app.certificate.sha256_fingerprint=7C:90:...`

---

## ⚖️ Safety Disclaimer

*TriNetra is an assistive orientation aid and **does not replace** a white cane, guide dog, or mobility training. It cannot detect drop-offs, descending stairs, potholes, transparent glass, or fast cross-traffic. Users must always prioritize their physical white cane as their primary mobility aid.*
