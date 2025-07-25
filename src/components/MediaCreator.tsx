import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Type, 
  Palette, 
  Crop, 
  RotateCw, 
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Layers,
  Filter,
  Sparkles,
  Save
} from 'lucide-react'
import { VisualAsset } from '../App'

interface MediaCreatorProps {
  onAssetCreated: (asset: VisualAsset) => void
}

interface ImageFilter {
  name: string
  filter: string
}

const imageFilters: ImageFilter[] = [
  { name: 'None', filter: 'none' },
  { name: 'Sepia', filter: 'sepia(100%)' },
  { name: 'Grayscale', filter: 'grayscale(100%)' },
  { name: 'Blur', filter: 'blur(2px)' },
  { name: 'Brightness', filter: 'brightness(150%)' },
  { name: 'Contrast', filter: 'contrast(150%)' },
  { name: 'Saturate', filter: 'saturate(200%)' },
  { name: 'Hue Rotate', filter: 'hue-rotate(90deg)' },
  { name: 'Invert', filter: 'invert(100%)' },
  { name: 'Vintage', filter: 'sepia(50%) contrast(120%) brightness(110%)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(120%)' },
  { name: 'Warm', filter: 'hue-rotate(30deg) saturate(130%) brightness(110%)' }
]

const clipTransitions = [
  'fade',
  'slide-left',
  'slide-right',
  'slide-up',
  'slide-down',
  'zoom-in',
  'zoom-out',
  'rotate',
  'flip'
]

export function MediaCreator({ onAssetCreated }: MediaCreatorProps) {
  const [activeTab, setActiveTab] = useState('import')
  const [importedImages, setImportedImages] = useState<File[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [editedImageUrl, setEditedImageUrl] = useState<string>('')
  
  // Image Editor State
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [textOverlay, setTextOverlay] = useState('')
  const [textColor, setTextColor] = useState('#ffffff')
  const [textSize, setTextSize] = useState(24)
  const [rotation, setRotation] = useState(0)
  
  // Clip Creator State
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [clipDuration, setClipDuration] = useState(3)
  const [transition, setTransition] = useState('fade')
  const [isCreatingClip, setIsCreatingClip] = useState(false)
  const [clipPreview, setClipPreview] = useState<string>('')
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Handle file import
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setImportedImages(prev => [...prev, ...imageFiles])
  }

  // Apply image edits
  const applyImageEdits = useCallback(() => {
    if (!selectedImage || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${selectedFilter !== 'none' ? imageFilters.find(f => f.name.toLowerCase() === selectedFilter)?.filter || '' : ''}`
    
    ctx.drawImage(img, 0, 0)

    // Add text overlay
    if (textOverlay) {
      ctx.filter = 'none'
      ctx.fillStyle = textColor
      ctx.font = `${textSize}px Arial`
      ctx.textAlign = 'center'
      ctx.fillText(textOverlay, canvas.width / 2, canvas.height / 2)
    }

    ctx.restore()

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob)
        setEditedImageUrl(url)
      }
    })
  }, [selectedImage, brightness, contrast, saturation, selectedFilter, textOverlay, textColor, textSize, rotation])

  // Save edited image
  const saveEditedImage = () => {
    if (!editedImageUrl) return

    const asset: VisualAsset = {
      id: Date.now().toString(),
      type: 'image',
      url: editedImageUrl,
      thumbnail: editedImageUrl,
      name: `Edited_${selectedImage?.name || 'image'}`
    }

    onAssetCreated(asset)
  }

  // Create video clip from images
  const createVideoClip = async () => {
    if (selectedImages.length === 0) return

    setIsCreatingClip(true)

    try {
      // Create a simple slideshow-style video using canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 1920
      canvas.height = 1080

      const frames: string[] = []
      
      for (let i = 0; i < selectedImages.length; i++) {
        const img = new Image()
        const imageUrl = URL.createObjectURL(selectedImages[i])
        
        await new Promise((resolve) => {
          img.onload = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // Draw image (fit to canvas)
            const aspectRatio = img.width / img.height
            const canvasAspectRatio = canvas.width / canvas.height
            
            let drawWidth, drawHeight, drawX, drawY
            
            if (aspectRatio > canvasAspectRatio) {
              drawWidth = canvas.width
              drawHeight = canvas.width / aspectRatio
              drawX = 0
              drawY = (canvas.height - drawHeight) / 2
            } else {
              drawWidth = canvas.height * aspectRatio
              drawHeight = canvas.height
              drawX = (canvas.width - drawWidth) / 2
              drawY = 0
            }
            
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
            
            // Convert frame to data URL
            frames.push(canvas.toDataURL())
            URL.revokeObjectURL(imageUrl)
            resolve(null)
          }
          img.src = imageUrl
        })
      }

      // Create a simple "video" preview (just show first frame for now)
      setClipPreview(frames[0])

      // Create asset
      const asset: VisualAsset = {
        id: Date.now().toString(),
        type: 'video',
        url: frames[0], // In a real implementation, this would be a video file
        thumbnail: frames[0],
        name: `Clip_${selectedImages.length}_images`,
        duration: selectedImages.length * clipDuration
      }

      onAssetCreated(asset)
      
    } catch (error) {
      console.error('Error creating clip:', error)
    } finally {
      setIsCreatingClip(false)
    }
  }

  // Load image for editing
  useEffect(() => {
    if (selectedImage && imageRef.current) {
      const url = URL.createObjectURL(selectedImage)
      imageRef.current.src = url
      imageRef.current.onload = () => {
        applyImageEdits()
        URL.revokeObjectURL(url)
      }
    }
  }, [selectedImage, applyImageEdits])

  // Apply edits when settings change
  useEffect(() => {
    if (selectedImage) {
      applyImageEdits()
    }
  }, [selectedImage, brightness, contrast, saturation, selectedFilter, textOverlay, textColor, textSize, rotation, applyImageEdits])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            Media Creator
          </h2>
          <p className="text-muted-foreground">
            Create and edit images and video clips offline - no API required
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" className="flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import Media</span>
          </TabsTrigger>
          <TabsTrigger value="image-editor" className="flex items-center space-x-2">
            <ImageIcon className="w-4 h-4" />
            <span>Image Editor</span>
          </TabsTrigger>
          <TabsTrigger value="clip-creator" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Clip Creator</span>
          </TabsTrigger>
        </TabsList>

        {/* Import Media Tab */}
        <TabsContent value="import" className="mt-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Import Your Media</h3>
                <div 
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Drop your images here</p>
                  <p className="text-muted-foreground mb-4">
                    or click to browse (JPG, PNG, GIF, WebP)
                  </p>
                  <Button>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </div>

              {importedImages.length > 0 && (
                <div>
                  <h4 className="font-medium mb-4">Imported Images ({importedImages.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {importedImages.map((file, index) => (
                      <Card key={index} className="relative cursor-pointer hover:shadow-lg transition-shadow">
                        <div className="aspect-square relative overflow-hidden rounded-lg">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Button
                              size="sm"
                              className="opacity-0 hover:opacity-100 transition-opacity"
                              onClick={() => {
                                setSelectedImage(file)
                                setActiveTab('image-editor')
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / (1024 * 1024)).toFixed(1)} MB
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Image Editor Tab */}
        <TabsContent value="image-editor" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Image Editor
              </h3>
              
              {!selectedImage ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Select an image to start editing</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setActiveTab('import')}
                  >
                    Import Images
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Basic Adjustments */}
                  <div>
                    <h4 className="font-medium mb-3">Basic Adjustments</h4>
                    <div className="space-y-4">
                      <div>
                        <Label>Brightness: {brightness}%</Label>
                        <Slider
                          value={[brightness]}
                          onValueChange={(value) => setBrightness(value[0])}
                          min={0}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Contrast: {contrast}%</Label>
                        <Slider
                          value={[contrast]}
                          onValueChange={(value) => setContrast(value[0])}
                          min={0}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Saturation: {saturation}%</Label>
                        <Slider
                          value={[saturation]}
                          onValueChange={(value) => setSaturation(value[0])}
                          min={0}
                          max={200}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label>Rotation: {rotation}°</Label>
                        <Slider
                          value={[rotation]}
                          onValueChange={(value) => setRotation(value[0])}
                          min={-180}
                          max={180}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div>
                    <Label>Filter</Label>
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {imageFilters.map((filter) => (
                          <SelectItem key={filter.name} value={filter.name.toLowerCase()}>
                            {filter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Text Overlay */}
                  <div>
                    <h4 className="font-medium mb-3">Text Overlay</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Text</Label>
                        <Input
                          value={textOverlay}
                          onChange={(e) => setTextOverlay(e.target.value)}
                          placeholder="Enter text..."
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Color</Label>
                          <Input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="mt-1 h-10"
                          />
                        </div>
                        <div>
                          <Label>Size: {textSize}px</Label>
                          <Slider
                            value={[textSize]}
                            onValueChange={(value) => setTextSize(value[0])}
                            min={12}
                            max={72}
                            step={1}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button onClick={saveEditedImage} disabled={!editedImageUrl}>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Library
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setBrightness(100)
                        setContrast(100)
                        setSaturation(100)
                        setSelectedFilter('none')
                        setTextOverlay('')
                        setRotation(0)
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Preview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Preview</h3>
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      ref={imageRef}
                      className="hidden"
                      alt="Original"
                    />
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {selectedImage.name}
                  </p>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">No image selected</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Clip Creator Tab */}
        <TabsContent value="clip-creator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clip Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Clip Creator
              </h3>
              
              <div className="space-y-6">
                {/* Image Selection */}
                <div>
                  <h4 className="font-medium mb-3">Select Images for Clip</h4>
                  {importedImages.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-3">No images imported</p>
                      <Button onClick={() => setActiveTab('import')}>
                        Import Images
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {importedImages.map((file, index) => (
                        <div
                          key={index}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImages.includes(file) 
                              ? 'border-primary' 
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                          onClick={() => {
                            setSelectedImages(prev => 
                              prev.includes(file)
                                ? prev.filter(f => f !== file)
                                : [...prev, file]
                            )
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full aspect-square object-cover"
                            onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                          />
                          {selectedImages.includes(file) && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">
                                {selectedImages.indexOf(file) + 1}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clip Settings */}
                <div>
                  <h4 className="font-medium mb-3">Clip Settings</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Duration per Image: {clipDuration}s</Label>
                      <Slider
                        value={[clipDuration]}
                        onValueChange={(value) => setClipDuration(value[0])}
                        min={1}
                        max={10}
                        step={0.5}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Transition Effect</Label>
                      <Select value={transition} onValueChange={setTransition}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {clipTransitions.map((trans) => (
                            <SelectItem key={trans} value={trans}>
                              {trans.charAt(0).toUpperCase() + trans.slice(1).replace('-', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Create Clip Button */}
                <Button 
                  onClick={createVideoClip}
                  disabled={selectedImages.length === 0 || isCreatingClip}
                  className="w-full"
                >
                  {isCreatingClip ? (
                    <>
                      <Layers className="w-4 h-4 mr-2 animate-spin" />
                      Creating Clip...
                    </>
                  ) : (
                    <>
                      <Video className="w-4 h-4 mr-2" />
                      Create Clip ({selectedImages.length} images)
                    </>
                  )}
                </Button>

                {selectedImages.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total duration: {(selectedImages.length * clipDuration).toFixed(1)}s
                  </div>
                )}
              </div>
            </Card>

            {/* Clip Preview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Clip Preview</h3>
              {clipPreview ? (
                <div className="space-y-4">
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={clipPreview}
                      alt="Clip preview"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-black/70 rounded-full px-4 py-2">
                      <Button size="sm" variant="ghost" className="text-white hover:text-white">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:text-white">
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:text-white">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Clip created with {selectedImages.length} images
                  </p>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Select images and create a clip</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}