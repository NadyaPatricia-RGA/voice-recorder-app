import React, { useRef } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { useRouter } from 'next/router';
import { Play, SkipForward, CircleStop } from 'lucide-react';
import styles from "../styles/VoiceRecorder.module.css";

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder();
  const router = useRouter();
  const audioRecorderRef = useRef<any>(null);

  const addAudioElement = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recording.mp3';
    a.click();
  };

  const handleSkip = () => {
    router.push('/next-page'); // Replace with your actual route
  };

  const handleStartRecording = () => {
    recorderControls.startRecording();
    if (audioRecorderRef.current) {
      audioRecorderRef.current.startRecording();
    }
  };

  const handleStopRecording = () => {
    recorderControls.stopRecording();
    if (audioRecorderRef.current) {
      audioRecorderRef.current.stopRecording();
    }
  };

  return (
    <div className={styles.container}>
      <AudioRecorder
        ref={audioRecorderRef}
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
              onClick={handleStartRecording}
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
            onClick={handleStopRecording}
            className="p-4 bg-gray-200 rounded-full"
            aria-label="Stop Recording"
          >
            <CircleStop className="w-6 h-6" />
          </button>
        )}
      </div>
      {recorderControls.isRecording && <p>Recording in progress..</p>}
    </div>
  );
}
