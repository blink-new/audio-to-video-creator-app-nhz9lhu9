import { useState } from 'react'
import { AudioFile, TimelineItem, VideoStyle } from '../App'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Play, Pause, RotateCcw, Maximize } from 'lucide-react'

interface VideoPreviewProps {
  audioFile: AudioFile | null
  timelineItems: TimelineItem[]
  selectedStyle: VideoStyle | null
}

export function VideoPreview({ audioFile, timelineItems, selectedStyle }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  if (!audioFile || !selectedStyle) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Preview Available</h3>
        <p className="text-muted-foreground">
          Upload an audio file and select a style to see the preview
        </p>
      </div>
    )
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetPreview = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Video Preview</h2>
          <p className="text-muted-foreground">
            Preview your generated video with {selectedStyle.name} style
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={resetPreview}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline">
            <Maximize className="w-4 h-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Video Preview Area */}
      <Card className="p-0 overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800">
          {/* Mock Video Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {timelineItems.length > 0 ? (
              <div className="relative w-full h-full">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                
                {/* Current Visual Asset */}
                {timelineItems[0] && (
                  <img
                    src={timelineItems[0].asset.thumbnail}
                    alt="Current visual"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                )}
                
                {/* Overlay Effects based on style */}
                {selectedStyle.type === 'music' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                )}
                
                {selectedStyle.type === 'presentation' && (
                  <div className="absolute bottom-8 left-8 right-8 bg-black/70 text-white p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">Sample Slide Title</h3>
                    <p className="text-sm opacity-90">This is how your presentation content will appear</p>
                  </div>
                )}
                
                {/* Audio Visualization */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-1 h-8">
                    {Array.from({ length: 50 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-white/60 rounded-full flex-1"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animation: isPlaying ? `pulse ${Math.random() * 2 + 1}s infinite` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/70">
                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Add Visual Elements</h3>
                <p className="text-sm">Add images, videos, or clipart to see the preview</p>
              </div>
            )}
          </div>

          {/* Play/Pause Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
            <Button
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(currentTime / (audioFile?.duration || 1)) * 100}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Preview Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Style</h4>
          <div className="flex items-center space-x-2">
            <div className="text-primary">{selectedStyle.icon}</div>
            <span className="text-sm">{selectedStyle.name}</span>
          </div>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Duration</h4>
          <p className="text-sm text-muted-foreground">
            {Math.floor(audioFile.duration / 60)}:{(audioFile.duration % 60).toFixed(0).padStart(2, '0')}
          </p>
        </Card>
        
        <Card className="p-4">
          <h4 className="font-semibold mb-2">Visual Elements</h4>
          <p className="text-sm text-muted-foreground">
            {timelineItems.length} item{timelineItems.length !== 1 ? 's' : ''}
          </p>
        </Card>
      </div>

      {/* Timeline Items Preview */}
      {timelineItems.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">Timeline Preview</h4>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {timelineItems.map((item, index) => (
              <div
                key={item.id}
                className="flex-shrink-0 w-20 h-20 relative rounded-lg overflow-hidden border-2 border-muted"
              >
                <img
                  src={item.asset.thumbnail}
                  alt={item.asset.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}