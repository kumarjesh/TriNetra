// ============================================================
// TriNetra — Vision Pipeline (YOLOv10n + COCO-SSD Fallback)
// ============================================================
// Primary edge detector: YOLOv10-Nano (NMS-free, ONNX Runtime Web).
// Fallback edge detector: COCO-SSD (TensorFlow.js WebGL).
// Manages model lifecycle, frame capture, and detection loop with
// adaptive throttling controlled by the PerformanceMonitor.

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { YoloV10Engine } from './YoloV10Engine';
import { PerformanceMonitor } from './PerformanceMonitor';
import { TrackingManager } from './TrackingManager';
import { SettingsStore } from './SettingsStore';
import type { RawDetection, TrackedObject } from '../types';

class VisionPipelineImpl {
  private fallbackModel: cocoSsd.ObjectDetection | null = null;
  private activeModelName: 'YOLOv10n' | 'COCO-SSD' | 'NONE' = 'NONE';
  private isRunning = false;
  private animFrameId: number | null = null;
  private lastInferenceTime = 0;
  private videoElement: HTMLVideoElement | null = null;
  private onDetection: ((objects: TrackedObject[]) => void) | null = null;
  private onRawDetection:
    | ((detections: RawDetection[]) => void)
    | null = null;
  private modelLoading = false;

  /** Load the primary YOLOv10n model, with COCO-SSD fallback */
  async loadModel(
    onProgress?: (msg: string) => void
  ): Promise<boolean> {
    if (this.isModelLoaded()) return true;
    if (this.modelLoading) return false;

    this.modelLoading = true;
    try {
      // 1. Attempt loading state-of-the-art YOLOv10n (ONNX Runtime Web)
      onProgress?.('Loading YOLOv10n neural network...');
      const yoloReady = await YoloV10Engine.loadModel(onProgress);

      if (yoloReady) {
        this.activeModelName = 'YOLOv10n';
        onProgress?.('YOLOv10n active (high-accuracy NMS-free).');
        this.modelLoading = false;
        return true;
      }

      // 2. Fallback to COCO-SSD if ONNX runtime fails on older device
      console.warn('[VisionPipeline] YOLOv10n failed, falling back to COCO-SSD');
      onProgress?.('Falling back to MobileNet vision engine...');
      await tf.setBackend('webgl');
      await tf.ready();
      this.fallbackModel = await cocoSsd.load({ base: 'lite_mobilenet_v2' });

      this.activeModelName = 'COCO-SSD';
      onProgress?.('COCO-SSD fallback ready.');
      this.modelLoading = false;
      return true;
    } catch (err) {
      console.error('[VisionPipeline] Both vision models failed to load:', err);
      onProgress?.('Model failed to load.');
      this.modelLoading = false;
      return false;
    }
  }

  /** Check if any vision model is loaded */
  isModelLoaded(): boolean {
    return YoloV10Engine.isModelLoaded() || this.fallbackModel !== null;
  }

  /** Get name of currently executing vision engine */
  getActiveEngineName(): string {
    return this.activeModelName;
  }

  /** Set the video element to capture frames from */
  setVideoSource(video: HTMLVideoElement): void {
    this.videoElement = video;
    if (video.videoWidth && video.videoHeight) {
      TrackingManager.setFrameDimensions(video.videoWidth, video.videoHeight);
    }
  }

  /** Register callback for tracked object updates */
  onTrackedObjects(cb: (objects: TrackedObject[]) => void): void {
    this.onDetection = cb;
  }

  /** Register callback for raw detection data (for debug canvas) */
  onRawDetections(cb: (detections: RawDetection[]) => void): void {
    this.onRawDetection = cb;
  }

  /** Start the detection loop */
  start(): void {
    if (this.isRunning || !this.isModelLoaded() || !this.videoElement) return;
    this.isRunning = true;
    this.loop();
  }

  /** Stop the detection loop */
  stop(): void {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    TrackingManager.reset();
  }

  /** Check if pipeline is currently running */
  isActive(): boolean {
    return this.isRunning;
  }

  /** Main detection loop using requestAnimationFrame with timestamp gating */
  private loop = (): void => {
    if (!this.isRunning) return;

    this.animFrameId = requestAnimationFrame(async () => {
      const now = performance.now();
      const interval = PerformanceMonitor.getTargetInterval();

      if (now - this.lastInferenceTime >= interval) {
        await this.runInference(now);
        this.lastInferenceTime = performance.now();
      }

      this.loop();
    });
  };

  /** Run a single inference frame */
  private async runInference(startTime: number): Promise<void> {
    if (!this.isModelLoaded() || !this.videoElement) return;
    if (
      this.videoElement.readyState < 2 ||
      this.videoElement.videoWidth === 0
    ) {
      return; // Video not ready
    }

    // Update frame dimensions (may change if video resizes)
    TrackingManager.setFrameDimensions(
      this.videoElement.videoWidth,
      this.videoElement.videoHeight
    );

    try {
      const confidenceThreshold = SettingsStore.get('confidenceThreshold');
      let rawDetections: RawDetection[] = [];

      // 1. Primary Inference: YOLOv10n
      if (YoloV10Engine.isModelLoaded()) {
        rawDetections = await YoloV10Engine.detect(
          this.videoElement,
          confidenceThreshold
        );
      } else if (this.fallbackModel) {
        // 2. Fallback Inference: COCO-SSD
        const predictions = await this.fallbackModel.detect(
          this.videoElement,
          20,
          confidenceThreshold
        );
        rawDetections = predictions.map((p) => ({
          class: p.class,
          score: p.score,
          bbox: p.bbox as [number, number, number, number],
          timestamp: Date.now(),
        }));
      }

      // Abort immediately if paused or stopped while detection was in flight
      if (!this.isRunning) return;

      const inferenceEnd = performance.now();
      PerformanceMonitor.recordInference(inferenceEnd - startTime);

      // Send raw detections for debug canvas
      this.onRawDetection?.(rawDetections);

      // Process through tracking manager
      const trackedObjects = TrackingManager.update(rawDetections);

      // Notify listeners
      this.onDetection?.(trackedObjects);
    } catch (err) {
      console.error('[VisionPipeline] Inference error:', err);
    }
  }

  /** Cleanup */
  destroy(): void {
    this.stop();
    this.fallbackModel = null;
    this.videoElement = null;
    this.activeModelName = 'NONE';
  }
}

/** Singleton vision pipeline */
export const VisionPipeline = new VisionPipelineImpl();
