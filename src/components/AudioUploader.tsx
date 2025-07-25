import { useState, useRef } from 'react'
import { Upload, Music, FileAudio, X } from 'lucide-react'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { AudioFile } from '../App'

interface AudioUploaderProps {
  onAudioUpload: (audio: AudioFile) => void
}

export function AudioUploader({ onAudioUpload }: AudioUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<AudioFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processAudioFile = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    try {
      // Create audio element to get duration
      const audio = new Audio()
      const url = URL.createObjectURL(file)
      audio.src = url

      await new Promise((resolve, reject) => {
        audio.onloadedmetadata = () => {
          const audioFile: AudioFile = {
            file,
            url,
            duration: audio.duration,
            name: file.name
          }
          
          setUploadProgress(100)
          setTimeout(() => {
            setIsUploading(false)
            setUploadedFile(audioFile)
            onAudioUpload(audioFile)
            resolve(audioFile)
          }, 500)
        }
        audio.onerror = reject
      })
    } catch (error) {
      console.error('Error processing audio file:', error)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const removeFile = () => {
    if (uploadedFile) {
      URL.revokeObjectURL(uploadedFile.url)
      setUploadedFile(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const audioFile = files.find(file => file.type.startsWith('audio/'))
    
    if (audioFile) {
      processAudioFile(audioFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processAudioFile(file)
    }
  }

  if (uploadedFile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
              <FileAudio className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">{uploadedFile.name}</h4>
              <p className="text-sm text-green-700">
                Duration: {Math.floor(uploadedFile.duration / 60)}:{(uploadedFile.duration % 60).toFixed(0).padStart(2, '0')} • 
                Size: {(uploadedFile.file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={removeFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <audio controls className="w-full">
          <source src={uploadedFile.url} type={uploadedFile.file.type} />
          Your browser does not support the audio element.
        </audio>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Upload Your Audio File</h2>
        <p className="text-muted-foreground">
          Drag and drop your audio file or click to browse. Supports MP3, WAV, M4A, and more.
        </p>
      </div>

      {isUploading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Processing audio file...</p>
            </div>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Drop your audio file here</h3>
              <p className="text-muted-foreground mb-4">
                or click to browse from your computer
              </p>
            </div>

            <Button onClick={() => fileInputRef.current?.click()}>
              <Music className="w-4 h-4 mr-2" />
              Choose Audio File
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="p-3 bg-muted/50 rounded-lg">
          <FileAudio className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">MP3</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <FileAudio className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">WAV</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <FileAudio className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">M4A</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg">
          <FileAudio className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">FLAC</p>
        </div>
      </div>
    </div>
  )
}