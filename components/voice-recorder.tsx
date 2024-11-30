"use client"

import React, { useEffect, useState } from 'react'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { Play, SkipForward, CircleStop, Download, Combine } from 'lucide-react'
import styles from "../styles/VoiceRecorder.module.css"

interface Recording {
  id: string
  blob: Blob
  url: string
}

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder()
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isMerging, setIsMerging] = useState(false)

  useEffect(() => {
    if (!recorderControls.recordingBlob) {
      return
    }

    const url = URL.createObjectURL(recorderControls.recordingBlob)
    const newRecording: Recording = {
      id: Date.now().toString(),
      blob: recorderControls.recordingBlob,
      url: url,
    }

    setRecordings(prev => [...prev, newRecording])
  }, [recorderControls.recordingBlob])

  const handleDownload = (recording: Recording) => {
    const a = document.createElement('a')
    a.href = recording.url
    a.download = `recording-${recording.id}.webm`
    a.click()
  }

  const handleMergeAll = async () => {
    if (recordings.length === 0 || isMerging) return;

    setIsMerging(true);

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffers = await Promise.all(
        recordings.map(async (recording) => {
          const arrayBuffer = await recording.blob.arrayBuffer();
          return await audioContext.decodeAudioData(arrayBuffer);
        })
      );

      const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);
      const mergedBuffer = audioContext.createBuffer(
        1,
        totalLength,
        audioContext.sampleRate
      );

      let offset = 0;
      audioBuffers.forEach((buffer) => {
        mergedBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
        offset += buffer.length;
      });

      const mergedBlob = await new Promise<Blob>((resolve) => {
        const source = audioContext.createBufferSource();
        source.buffer = mergedBuffer;
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);

        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          resolve(blob);
        };

        mediaRecorder.start();
        source.start(0);
        source.onended = () => mediaRecorder.stop();
      });

      const url = URL.createObjectURL(mergedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-recordings.webm';
      a.click();
    } catch (error) {
      console.error('Error merging recordings:', error);
      alert('An error occurred while merging recordings. Please try again.');
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.buttonContainer}>
        {!recorderControls.isRecording ? (
          <>
            <p>Press this button to start recording</p>
            <button
              onClick={recorderControls.startRecording}
              className={styles.button}
              aria-label="Start Recording"
            >
              <Play />
            </button>
          </>
        ) : (
          <button
            onClick={recorderControls.stopRecording}
            className={styles.button}
            aria-label="Stop Recording"
          >
            <CircleStop />
          </button>
        )}
      </div>

      {recorderControls.isRecording && (
        <p className={styles.recordingStatus}>
          {recorderControls.isPaused ? "Recording is paused" : "Recording in progress.."}
        </p>
      )}

      {recordings.length > 0 && (
        <div className={styles.recordingsContainer}>
          <div className={styles.recordingsHeader}>
            <h2>Recordings</h2>
            <button
              onClick={handleMergeAll}
              className={`${styles.mergeButton} ${isMerging ? styles.merging : ''}`}
              disabled={isMerging}
            >
              {isMerging ? (
                <>
                  <div className={styles.spinner}></div>
                  Merging...
                </>
              ) : (
                <>
                  <Combine className={styles.icon} />
                  Merge All Recordings
                </>
              )}
            </button>
          </div>
          <div className={styles.recordingsList}>
            {recordings.map((recording, index) => (
              <div
                key={recording.id}
                className={styles.recordingItem}
              >
                <div className={styles.recordingInfo}>
                  <span>Recording {index + 1}</span>
                  <audio src={recording.url} controls className={styles.audioPlayer} />
                </div>
                <button
                  onClick={() => handleDownload(recording)}
                  className={styles.downloadButton}
                >
                  <Download className={styles.icon} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
