import React, { useEffect } from 'react';
import { useAudioRecorder } from 'react-audio-voice-recorder';
import { useRouter } from 'next/router';
import { Play, SkipForward, CircleStop } from 'lucide-react';
import styles from "../styles/VoiceRecorder.module.css";

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder();
  const router = useRouter();
  const recordingBlob = recorderControls.recordingBlob;

  useEffect(() => {
    if (!recordingBlob) {
      return
    } else {
      // addAudioElement(recordingBlob);
      alert('Recording has been saved');
    }
  }, [recordingBlob])

  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.webm';
    a.click();
  };

  const handleSkip = () => {
    router.push('/next-page'); // Replace with your actual route
  };

  return (
    <div className={styles.container}>
      {!recorderControls.isRecording ? (
        <>
          <div
            onClick={recorderControls.startRecording}
            className={styles.button}
            aria-label="Start Recording"
          >
            <Play />
          </div>
          <div
            onClick={handleSkip}
            className={styles.button}
            aria-label="Skip Recording"
          >
            <SkipForward />
          </div>
        </>
      ) : (
        <div
          onClick={() => {
            recorderControls.stopRecording();
          }}
          className={styles.button}
          aria-label="Stop Recording"
        >
          <CircleStop />
        </div>
      )}
      {recorderControls.isRecording && !recorderControls.isPaused && <p>Recording in progress..</p>}
      {recorderControls.isPaused && <p>Recording is paused</p>}
    </div>
  );
}
