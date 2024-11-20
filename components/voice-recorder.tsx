import * as React from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import styles from "../styles/VoiceRecorder.module.css";

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder()

  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const audio = document.createElement('audio');
    audio.src = url;
    audio.controls = true;
    document.body.appendChild(audio);
  };

  return (
    <div className={styles.container}>
      <AudioRecorder
        onRecordingComplete={addAudioElement}
        audioTrackConstraints={{
          noiseSuppression: true,
          echoCancellation: true,
        }}
        onNotAllowedOrFound={(err) => console.table(err)}
        downloadOnSavePress={true}
        downloadFileExtension="webm"
        mediaRecorderOptions={{
          audioBitsPerSecond: 128000,
        }}
        showVisualizer={true}
        recorderControls={recorderControls}
      />
      {recorderControls.isRecording && !recorderControls.isPaused && <p>Recording in progress..</p>}
      {recorderControls.isPaused && <p>Recording is paused</p>}
    </div>
  );
}
