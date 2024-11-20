"use client"

import React, { useRef, useState, useEffect } from "react"
import styles from "./voice-recorder.module.css"

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      setIsSupported(false)
      setError("Your browser doesn't support audio recording.")
    }
  }, [])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioURL(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Unable to access the microphone. Please ensure you've granted the necessary permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
    }
  }

  const downloadRecording = () => {
    if (audioURL) {
      const a = document.createElement("a")
      a.href = audioURL
      a.download = "recording.webm"
      a.click()
    }
  }

  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL)
    }
    setAudioURL(null)
    setIsRecording(false)
    setError(null)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
  }

  if (!isSupported) {
    return <div className={styles.voiceRecorder}>
      <h2>Voice Recorder</h2>
      <p className={styles.error}>{error}</p>
    </div>
  }

  return (
    <div className={styles.voiceRecorder}>
      <h2>Voice Recorder</h2>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.controls}>
        {!isRecording && !audioURL && (
          <button onClick={startRecording} className={styles.recordBtn}>
            Start Recording
          </button>
        )}
        {isRecording && (
          <button onClick={stopRecording} className={styles.stopBtn}>
            Stop Recording
          </button>
        )}
        {audioURL && (
          <>
            <button onClick={downloadRecording} className={styles.downloadBtn}>
              Download
            </button>
            <button onClick={resetRecording} className={styles.resetBtn}>
              Reset
            </button>
          </>
        )}
      </div>
      {audioURL && (
        <audio controls className={styles.audioPlayer}>
          <source src={audioURL} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  )
}
