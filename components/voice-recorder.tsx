"use client"

import React, { useEffect, useState } from 'react'
import { useAudioRecorder } from 'react-audio-voice-recorder'
import { useRouter } from 'next/router'
import { Play, SkipForward, CircleStop, Download, Combine } from 'lucide-react'
import styles from "../styles/VoiceRecorder.module.css"

interface Recording {
  id: string
  blob: Blob
  url: string
}

export default function VoiceRecorder() {
  const recorderControls = useAudioRecorder()
  const router = useRouter()
  const [recordings, setRecordings] = useState<Recording[]>([])

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
    if (recordings.length === 0) return

    const audioElements = await Promise.all(
      recordings.map(async (recording) => {
        const audioBuffer = await recording.blob.arrayBuffer()
        const audioContext = new AudioContext()
        return audioContext.decodeAudioData(audioBuffer)
      })
    )

    const totalLength = audioElements.reduce((acc, curr) => acc + curr.duration, 0)

    const audioContext = new AudioContext()
    const mergedBuffer = audioContext.createBuffer(
      1,
      audioContext.sampleRate * totalLength,
      audioContext.sampleRate
    )

    let offset = 0
    audioElements.forEach((audioBuffer) => {
      mergedBuffer.copyToChannel(audioBuffer.getChannelData(0), 0, offset)
      offset += audioBuffer.length
    })

    const mergedAudio = new AudioContext()
    const source = mergedAudio.createBufferSource()
    source.buffer = mergedBuffer
    const destination = mergedAudio.createMediaStreamDestination()
    source.connect(destination)
    source.start(0)

    const mediaRecorder = new MediaRecorder(destination.stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'merged-recordings.webm'
      a.click()
    }

    mediaRecorder.start()
    source.onended = () => mediaRecorder.stop()
  }

  const handleSkip = () => {
    router.push('/next-page')
  }

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
              className={styles.mergeButton}
            >
              <Combine className={styles.icon} />
              Merge All Recordings
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
