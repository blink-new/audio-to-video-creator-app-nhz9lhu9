import { useState, useRef, useEffect, useCallback } from 'react'
import { AudioFile, TimelineItem } from '../App'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Slider } from './ui/slider'
import { Play, Pause, SkipBack, SkipForward, Volume2, Wand2 } from 'lucide-react'

interface TimelineEditorProps {
  audioFile: AudioFile
  timelineItems: TimelineItem[]
  onTimelineUpdate: (items: TimelineItem[]) => void
  onGenerateVideo: () => void
  isGenerating: boolean
}

export function TimelineEditor({ 
  audioFile, 
  timelineItems, 
  onTimelineUpdate, 
  onGenerateVideo,
  isGenerating 
}: TimelineEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState([75])
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100
    }
  }, [volume])

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw waveform background
    ctx.fillStyle = '#e5e7eb'
    ctx.fillRect(0, height / 2 - 20, width, 40)

    // Draw mock waveform
    ctx.fillStyle = '#6366f1'
    const barWidth = 2
    const barSpacing = 1
    const numBars = Math.floor(width / (barWidth + barSpacing))

    for (let i = 0; i < numBars; i++) {
      const x = i * (barWidth + barSpacing)
      const barHeight = Math.random() * 40 + 5
      const y = height / 2 - barHeight / 2
      
      ctx.fillRect(x, y, barWidth, barHeight)
    }

    // Draw playhead
    const playheadX = (currentTime / audioFile.duration) * width
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(playheadX, 0)
    ctx.lineTo(playheadX, height)
    ctx.stroke()
  }, [audioFile, currentTime])

  useEffect(() => {
    drawWaveform()
  }, [audioFile, currentTime, drawWaveform])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const seekTo = (time: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = time
    setCurrentTime(time)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const clickTime = (x / canvas.width) * audioFile.duration
    seekTo(clickTime)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Timeline Editor</h2>
          <p className="text-muted-foreground">
            Arrange your visual elements and sync them with your audio
          </p>
        </div>
        
        <Button 
          onClick={onGenerateVideo}
          disabled={isGenerating || timelineItems.length === 0}
          size="lg"
          className="px-6"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {/* Audio Controls */}
      <Card className="p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => seekTo(Math.max(0, currentTime - 10))}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button onClick={togglePlayPause}>
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => seekTo(Math.min(audioFile.duration, currentTime + 10))}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2 ml-auto">
            <Volume2 className="w-4 h-4" />
            <div className="w-24">
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(audioFile.duration)}</span>
        </div>
      </Card>

      {/* Waveform */}
      <Card className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={100}
          className="w-full h-24 cursor-pointer border rounded"
          onClick={handleCanvasClick}
        />
      </Card>

      {/* Timeline Items */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Visual Timeline</h3>
        
        {timelineItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No visual elements added yet.</p>
            <p className="text-sm">Add images, videos, or clipart from the library above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timelineItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg"
              >
                <img
                  src={item.asset.thumbnail}
                  alt={item.asset.name}
                  className="w-12 h-12 object-cover rounded"
                />
                
                <div className="flex-1">
                  <h4 className="font-medium">{item.asset.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(item.startTime)} - {formatTime(item.startTime + item.duration)}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItems = timelineItems.filter(t => t.id !== item.id)
                      onTimelineUpdate(newItems)
                    }}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <audio ref={audioRef} src={audioFile.url} preload="metadata" />
    </div>
  )
}