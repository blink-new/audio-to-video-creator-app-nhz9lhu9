import { useState } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Progress } from './ui/progress'
import { Download, Settings, Video, FileVideo } from 'lucide-react'

interface ExportControlsProps {
  onExport: (format: string, quality: string) => void
}

export function ExportControls({ onExport }: ExportControlsProps) {
  const [selectedFormat, setSelectedFormat] = useState('mp4')
  const [selectedQuality, setSelectedQuality] = useState('1080p')
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)

  const formats = [
    { value: 'mp4', label: 'MP4 (Recommended)', description: 'Best compatibility' },
    { value: 'mov', label: 'MOV', description: 'High quality' },
    { value: 'avi', label: 'AVI', description: 'Universal format' },
    { value: 'webm', label: 'WebM', description: 'Web optimized' }
  ]

  const qualities = [
    { value: '4k', label: '4K (3840x2160)', description: 'Ultra HD', size: '~500MB' },
    { value: '1080p', label: '1080p (1920x1080)', description: 'Full HD', size: '~200MB' },
    { value: '720p', label: '720p (1280x720)', description: 'HD', size: '~100MB' },
    { value: '480p', label: '480p (854x480)', description: 'Standard', size: '~50MB' }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const progressInterval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setIsExporting(false)
          onExport(selectedFormat, selectedQuality)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const getEstimatedSize = () => {
    const quality = qualities.find(q => q.value === selectedQuality)
    return quality?.size || '~100MB'
  }

  const getEstimatedTime = () => {
    const timeMap: Record<string, string> = {
      '4k': '5-10 minutes',
      '1080p': '2-5 minutes',
      '720p': '1-3 minutes',
      '480p': '30s-1 minute'
    }
    return timeMap[selectedQuality] || '2-5 minutes'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Export Video</h2>
          <p className="text-muted-foreground">
            Choose your export settings and download your video
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Export Settings</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Format Selection */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileVideo className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Video Format</h3>
          </div>
          
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format.value} value={format.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{format.label}</span>
                    <span className="text-xs text-muted-foreground">{format.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {formats.find(f => f.value === selectedFormat)?.description}
            </p>
          </div>
        </Card>

        {/* Quality Selection */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Video className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Video Quality</h3>
          </div>
          
          <Select value={selectedQuality} onValueChange={setSelectedQuality}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select quality" />
            </SelectTrigger>
            <SelectContent>
              {qualities.map((quality) => (
                <SelectItem key={quality.value} value={quality.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{quality.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {quality.description} • {quality.size}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {qualities.find(q => q.value === selectedQuality)?.description}
            </p>
          </div>
        </Card>
      </div>

      {/* Export Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Export Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Format</p>
            <p className="font-semibold uppercase">{selectedFormat}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Quality</p>
            <p className="font-semibold">{selectedQuality}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Est. Size</p>
            <p className="font-semibold">{getEstimatedSize()}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Est. Time</p>
            <p className="font-semibold">{getEstimatedTime()}</p>
          </div>
        </div>

        {isExporting ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exporting video...</span>
              <span className="text-sm text-muted-foreground">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              This may take a few minutes depending on your video length and quality settings
            </p>
          </div>
        ) : (
          <Button 
            onClick={handleExport}
            size="lg" 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Video
          </Button>
        )}
      </Card>

      {/* Export Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Export Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• MP4 format is recommended for best compatibility</li>
          <li>• 1080p quality provides the best balance of size and quality</li>
          <li>• Higher quality settings will take longer to export</li>
          <li>• Your video will be automatically downloaded when ready</li>
        </ul>
      </Card>
    </div>
  )
}