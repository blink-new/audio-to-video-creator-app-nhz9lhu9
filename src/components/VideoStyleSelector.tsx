import { VideoStyle } from '../App'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Check } from 'lucide-react'

interface VideoStyleSelectorProps {
  styles: VideoStyle[]
  selectedStyle: VideoStyle | null
  onStyleSelect: (style: VideoStyle) => void
}

export function VideoStyleSelector({ styles, selectedStyle, onStyleSelect }: VideoStyleSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Video Style</h2>
        <p className="text-muted-foreground">
          Select the type of video you want to create from your audio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {styles.map((style) => (
          <Card
            key={style.id}
            className={`relative p-6 cursor-pointer transition-all hover:shadow-lg ${
              selectedStyle?.id === style.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onStyleSelect(style)}
          >
            {selectedStyle?.id === style.id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl mx-auto">
                <div className="text-primary">
                  {style.icon}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">{style.name}</h3>
                <p className="text-sm text-muted-foreground">{style.description}</p>
              </div>

              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">Best for:</div>
                <div className="flex flex-wrap gap-1">
                  {style.type === 'music' && (
                    <>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Music</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Beats</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">Rhythm</span>
                    </>
                  )}
                  {style.type === 'presentation' && (
                    <>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Slides</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Text</span>
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Business</span>
                    </>
                  )}
                  {style.type === 'slideshow' && (
                    <>
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">Photos</span>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Memories</span>
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full">Stories</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedStyle && (
        <div className="text-center">
          <Button size="lg" className="px-8">
            Continue with {selectedStyle.name}
          </Button>
        </div>
      )}
    </div>
  )
}