import { useState } from 'react'
import { AudioUploader } from './components/AudioUploader'
import { VideoStyleSelector } from './components/VideoStyleSelector'
import { VisualContentLibrary } from './components/VisualContentLibrary'
import { TimelineEditor } from './components/TimelineEditor'
import { VideoPreview } from './components/VideoPreview'
import { ExportControls } from './components/ExportControls'
import { Header } from './components/Header'
import { Card } from './components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Music, Presentation, Images } from 'lucide-react'

export interface AudioFile {
  file: File
  url: string
  duration: number
  name: string
}

export interface VideoStyle {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  type: 'music' | 'presentation' | 'slideshow'
}

export interface VisualAsset {
  id: string
  type: 'image' | 'video' | 'clipart'
  url: string
  thumbnail: string
  name: string
  duration?: number
}

export interface TimelineItem {
  id: string
  asset: VisualAsset
  startTime: number
  duration: number
  position: number
}

const videoStyles: VideoStyle[] = [
  {
    id: 'music-video',
    name: 'Music Video',
    description: 'Dynamic visuals synced to beat and rhythm',
    icon: <Music className="w-6 h-6" />,
    type: 'music'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    description: 'PowerPoint-style slides with text and images',
    icon: <Presentation className="w-6 h-6" />,
    type: 'presentation'
  },
  {
    id: 'slideshow',
    name: 'Slideshow',
    description: 'Smooth transitions between images and clips',
    icon: <Images className="w-6 h-6" />,
    type: 'slideshow'
  }
]

function App() {
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle | null>(null)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState<'upload' | 'style' | 'customize' | 'preview'>('upload')

  const handleAudioUpload = (audio: AudioFile) => {
    setAudioFile(audio)
    setCurrentStep('style')
  }

  const handleStyleSelect = (style: VideoStyle) => {
    setSelectedStyle(style)
    setCurrentStep('customize')
  }

  const handleGenerateVideo = async () => {
    setIsGenerating(true)
    // Simulate video generation
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsGenerating(false)
    setCurrentStep('preview')
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Audio-to-Video Creator
          </h1>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            Transform your audio files into engaging videos with AI-powered visual content generation
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={currentStep} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upload" disabled={false}>Upload</TabsTrigger>
                <TabsTrigger value="style" disabled={!audioFile}>Style</TabsTrigger>
                <TabsTrigger value="customize" disabled={!selectedStyle}>Customize</TabsTrigger>
                <TabsTrigger value="preview" disabled={timelineItems.length === 0}>Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <Card className="p-6">
                  <AudioUploader onAudioUpload={handleAudioUpload} />
                </Card>
              </TabsContent>

              <TabsContent value="style" className="mt-6">
                <Card className="p-6">
                  <VideoStyleSelector 
                    styles={videoStyles}
                    selectedStyle={selectedStyle}
                    onStyleSelect={handleStyleSelect}
                  />
                </Card>
              </TabsContent>

              <TabsContent value="customize" className="mt-6">
                <div className="space-y-6">
                  <Card className="p-6">
                    <VisualContentLibrary 
                      onAssetSelect={(asset) => {
                        const newItem: TimelineItem = {
                          id: Date.now().toString(),
                          asset,
                          startTime: 0,
                          duration: asset.duration || 3,
                          position: timelineItems.length
                        }
                        setTimelineItems([...timelineItems, newItem])
                      }}
                    />
                  </Card>
                  
                  {audioFile && (
                    <Card className="p-6">
                      <TimelineEditor 
                        audioFile={audioFile}
                        timelineItems={timelineItems}
                        onTimelineUpdate={setTimelineItems}
                        onGenerateVideo={handleGenerateVideo}
                        isGenerating={isGenerating}
                      />
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="mt-6">
                <div className="space-y-6">
                  <Card className="p-6">
                    <VideoPreview 
                      audioFile={audioFile}
                      timelineItems={timelineItems}
                      selectedStyle={selectedStyle}
                    />
                  </Card>
                  
                  <Card className="p-6">
                    <ExportControls 
                      onExport={(format, quality) => {
                        console.log('Exporting video:', format, quality)
                      }}
                    />
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Info & Progress */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Project Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Audio File</span>
                  <span className={`text-sm ${audioFile ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {audioFile ? '✓ Uploaded' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Video Style</span>
                  <span className={`text-sm ${selectedStyle ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {selectedStyle ? '✓ Selected' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visual Assets</span>
                  <span className={`text-sm ${timelineItems.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {timelineItems.length > 0 ? `✓ ${timelineItems.length} added` : 'Pending'}
                  </span>
                </div>
              </div>
            </Card>

            {audioFile && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Audio Info</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">File Name</span>
                    <span className="text-sm font-medium">{audioFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">
                      {Math.floor(audioFile.duration / 60)}:{(audioFile.duration % 60).toFixed(0).padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Size</span>
                    <span className="text-sm font-medium">
                      {(audioFile.file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {selectedStyle && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Selected Style</h3>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-primary">{selectedStyle.icon}</div>
                  <div>
                    <h4 className="font-medium">{selectedStyle.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedStyle.description}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App