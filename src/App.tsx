import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { LogDisplay } from '@/components/LogDisplay'
import { ResultDisplay } from '@/components/ResultDisplay'
import { useSSEGeneration } from '@/hooks/use-sse-generation'
import { useKV } from '@github/spark/hooks'
import { Link, Play, Stop, Clock } from '@phosphor-icons/react'

interface ExampleURL {
  id: string
  name: string
  url: string
  description: string
}

function App() {
  const [url, setUrl] = useState('')
  const [recentUrls] = useKV<string[]>('recent-urls', [])
  const [exampleUrls] = useKV<ExampleURL[]>('example-urls', [
    {
      id: 'minecraft-protocol',
      name: 'Minecraft Protocol',
      url: 'https://wiki.vg/Protocol',
      description: 'Complete Minecraft protocol documentation'
    },
    {
      id: 'http-spec', 
      name: 'HTTP/1.1 Specification',
      url: 'https://datatracker.ietf.org/doc/html/rfc2616',
      description: 'HTTP protocol specification'
    },
    {
      id: 'websocket-protocol',
      name: 'WebSocket Protocol', 
      url: 'https://datatracker.ietf.org/doc/html/rfc6455',
      description: 'WebSocket protocol specification'
    }
  ])
  
  const { logs, isGenerating, result, startGeneration, stopGeneration, clearLogs } = useSSEGeneration({
    onComplete: (result) => {
      toast.success('Code generation completed！🎉', {
        description: `Successfully generated ${Object.keys(result.files).length} files`
      })
    },
    onError: (error) => {
      toast.error('Generation failed', {
        description: error
      })
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!url.trim()) {
      toast.error('Please enter SDK documentation URL 🔗')
      return
    }

    try {
      new URL(url)
    } catch {
      toast.error('Please enter a valid URL format ❌')
      return
    }

    clearLogs()
    await startGeneration(url)
  }

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString)
      return true
    } catch {
      return false
    }
  }

  const handleExampleClick = (exampleUrl: string) => {
    setUrl(exampleUrl)
    toast.info('Example URL filled in 📝')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <span>✨</span>
            <span>polyglot</span>
            <span>🤖</span>
          </h1>
          <p className="text-xl text-muted-foreground">
              SDK Documentation to MCP Code Generation Agent
          </p>
          <p className="text-sm text-muted-foreground mt-2">
              Paste SDK documentation URL, AI will automatically parse and generate MCP protocol code
          </p>
        </div>

        {/* URL Input Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link size={20} />
              Enter SDK Documentation URL
            </CardTitle>
            <CardDescription>
              Supports HTML and Markdown format technical documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="url"
                  placeholder="https://docs.example.com/sdk/protocol"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 text-base"
                  disabled={isGenerating}
                />
                {isGenerating ? (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={stopGeneration}
                    className="gap-2 px-6"
                  >
                    <Stop size={16} />
                    Stop ⏹️
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={!url.trim() || !isValidUrl(url)}
                    className="gap-2 px-6"
                  >
                    <Play size={16} />
                    Generate Code 🚀
                  </Button>
                )}
              </div>
              
              {url && !isValidUrl(url) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span>❌</span>
                  Please enter a valid URL format
                </p>
              )}
            </form>

            {/* Example URLs */}
            {exampleUrls.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock size={16} />
                  Example Documentation
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {exampleUrls.map((example) => (
                    <Button
                      key={example.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExampleClick(example.url)}
                      className="justify-start h-auto p-3 text-left"
                      disabled={isGenerating}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{example.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {example.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real-time Logs */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              Real-time Logs
            </CardTitle>
            <CardDescription>
              View the AI agent's working process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LogDisplay logs={logs} isGenerating={isGenerating} />
          </CardContent>
        </Card>

        {/* Generated Code Results */}
        {result && <ResultDisplay result={result} />}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by AI • Focused on automatic conversion from SDK documentation to MCP code •
            <span className="mx-1">🤖</span>
            Making development more efficient
          </p>
        </div>
      </div>
    </div>
  )
}

export default App