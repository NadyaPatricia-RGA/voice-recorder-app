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
      console.log(recordingBlob);
      addAudioElement(recordingBlob);
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
        <div className="flex gap-4">
          <button
            onClick={recorderControls.startRecording}
            className="p-4 bg-gray-200 rounded-full"
            aria-label="Start Recording"
          >
            <Play className="w-6 h-6" />
          </button>
          <button
            onClick={handleSkip}
            className="p-4 bg-gray-200 rounded-full"
            aria-label="Skip Recording"
          >
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            recorderControls.stopRecording();
          }}
          className="p-4 bg-gray-200 rounded-full"
          aria-label="Stop Recording"
        >
          <CircleStop className="w-6 h-6" />
        </button>
      )}
      {recorderControls.isRecording && !recorderControls.isPaused && <p>Recording in progress..</p>}
      {recorderControls.isPaused && <p>Recording is paused</p>}
    </div>
  );
}
