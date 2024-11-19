"use client"

import React, { useRef, useState } from "react"
import styles from "./voice-recorder.module.css"

export default function Component() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
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
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }
    mediaRecorderRef.current = null
    chunksRef.current = []
  }

  return (
    <div className={styles.voiceRecorder}>
      {!isRecording && !audioURL && (
        <h2>Press the button below to record</h2>
      )}
      {isRecording && (
        <h2>Recording in progress..</h2>
      )}
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
