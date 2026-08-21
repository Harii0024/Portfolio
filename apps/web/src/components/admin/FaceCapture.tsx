"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

type Props = {
  mode: "login" | "enroll";
  onDescriptor: (descriptor: number[]) => Promise<void>;
};

export function FaceCapture({ mode, onDescriptor }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading face models…");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function setup() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setReady(true);
        setStatus("Position your face in the frame");
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Camera / model load failed. Allow webcam access.",
        );
      }
    }

    void setup();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = useCallback(async () => {
    if (!videoRef.current || busy) return;
    setBusy(true);
    setError("");
    setStatus("Detecting face…");
    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setError("No face detected. Move closer and try again.");
        setStatus("Position your face in the frame");
        return;
      }

      const descriptor = Array.from(detection.descriptor);
      setStatus(mode === "enroll" ? "Enrolling…" : "Matching…");
      await onDescriptor(descriptor);
      setStatus(mode === "enroll" ? "Enrolled" : "Matched");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Face capture failed");
      setStatus("Try again");
    } finally {
      setBusy(false);
    }
  }, [busy, mode, onDescriptor]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black">
        <video
          ref={videoRef}
          muted
          playsInline
          className="aspect-video w-full -scale-x-100 object-cover"
        />
      </div>
      <p className="text-xs text-zinc-400">{status}</p>
      {error ? (
        <p className="rounded-md bg-red-950/60 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="button"
        disabled={!ready || busy}
        onClick={() => void capture()}
        className="w-full rounded-md bg-teal-400 px-4 py-2 font-medium text-zinc-950 disabled:opacity-60"
      >
        {busy
          ? "Working…"
          : mode === "enroll"
            ? "Capture & enroll face"
            : "Scan face to sign in"}
      </button>
    </div>
  );
}
