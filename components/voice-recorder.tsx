import React from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { useRouter } from 'next/router';
import { Play, SkipForward, CircleStop } from 'lucide-react';
import styles from "../styles/VoiceRecorder.module.css";

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder();
  const router = useRouter();

  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  const handleSkip = () => {
    router.push('/next-page'); // Replace with your actual route
  };

  return (
    <div className={styles.container}>
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        downloadOnSavePress={true}
        downloadFileExtension="mp3"
        mediaRecorderOptions={{
          audioBitsPerSecond: 128000,
        }}
        showVisualizer={true}
      />
      <div className="flex gap-4 mt-4">
        {!recorderControls.isRecording ? (
          <>
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
          </>
        ) : (
          <button
            onClick={recorderControls.stopRecording}
            className="p-4 bg-gray-200 rounded-full"
            aria-label="Stop Recording"
          >
            <CircleStop className="w-6 h-6" />
          </button>
        )}
      </div>
      {recorderControls.isRecording && !recorderControls.isPaused && <p>Recording in progress..</p>}
      {recorderControls.isPaused && <p>Recording is paused</p>}
    </div>
  );
}
