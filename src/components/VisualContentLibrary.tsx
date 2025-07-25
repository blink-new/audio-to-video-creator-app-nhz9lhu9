import { useState } from 'react'
import { VisualAsset } from '../App'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Input } from './ui/input'
import { Image, Video, Palette, Search, Plus, Sparkles } from 'lucide-react'
import { MediaCreator } from './MediaCreator'

interface VisualContentLibraryProps {
  onAssetSelect: (asset: VisualAsset) => void
}

// Mock data for demonstration
const mockImages: VisualAsset[] = [
  {
    id: '1',
    type: 'image',
    url: '/example-image.png',
    thumbnail: '/example-image.png',
    name: 'Gaming Character'
  },
  {
    id: '2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    name: 'Abstract Music'
  },
  {
    id: '3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
    name: 'Music Studio'
  },
  {
    id: '4',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=200',
    name: 'Sound Waves'
  },
  {
    id: '5',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200',
    name: 'Neon Lights'
  },
  {
    id: '6',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200',
    name: 'Digital Art'
  }
]

const mockVideos: VisualAsset[] = [
  {
    id: '5',
    type: 'video',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200',
    name: 'Abstract Motion',
    duration: 10
  },
  {
    id: '6',
    type: 'video',
    url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=200',
    name: 'Particle Effects',
    duration: 15
  }
]

const mockClipart: VisualAsset[] = [
  {
    id: '7',
    type: 'clipart',
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    name: 'Music Note'
  },
  {
    id: '8',
    type: 'clipart',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200',
    name: 'Speaker Icon'
  }
]

export function VisualContentLibrary({ onAssetSelect }: VisualContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())

  const handleAssetClick = (asset: VisualAsset) => {
    setSelectedAssets(prev => new Set([...prev, asset.id]))
    onAssetSelect(asset)
  }

  const filterAssets = (assets: VisualAsset[]) => {
    if (!searchQuery) return assets
    return assets.filter(asset => 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const AssetGrid = ({ assets, type }: { assets: VisualAsset[], type: string }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filterAssets(assets).map((asset) => (
        <Card
          key={asset.id}
          className={`relative cursor-pointer transition-all hover:shadow-lg group ${
            selectedAssets.has(asset.id) ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => handleAssetClick(asset)}
        >
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <img
              src={asset.thumbnail}
              alt={asset.name}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {asset.type === 'video' && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {asset.duration}s
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Button
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleAssetClick(asset)
                }}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
            
            {selectedAssets.has(asset.id) && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          
          <div className="p-2">
            <p className="text-xs font-medium truncate">{asset.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{asset.type}</p>
          </div>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Visual Content Library</h2>
          <p className="text-muted-foreground">
            Choose images, videos, and clipart to enhance your video
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs defaultValue="creator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creator" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Create</span>
          </TabsTrigger>
          <TabsTrigger value="images" className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>Images ({mockImages.length})</span>
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Videos ({mockVideos.length})</span>
          </TabsTrigger>
          <TabsTrigger value="clipart" className="flex items-center space-x-2">
            <Palette className="w-4 h-4" />
            <span>Clipart ({mockClipart.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creator" className="mt-6">
          <MediaCreator onAssetCreated={onAssetSelect} />
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <AssetGrid assets={mockImages} type="images" />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <AssetGrid assets={mockVideos} type="videos" />
        </TabsContent>

        <TabsContent value="clipart" className="mt-6">
          <AssetGrid assets={mockClipart} type="clipart" />
        </TabsContent>
      </Tabs>

      {selectedAssets.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{selectedAssets.size}</span>
            </div>
            <span className="font-medium">
              {selectedAssets.size} asset{selectedAssets.size > 1 ? 's' : ''} selected
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setSelectedAssets(new Set())}
          >
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  )
}