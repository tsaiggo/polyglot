import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GenerationResult } from '@/hooks/use-sse-generation'
import { Download, FileText } from '@phosphor-icons/react'

interface ResultDisplayProps {
  result: GenerationResult
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  const handleDownload = () => {
    try {
      // Convert base64 to blob and download
      const byteCharacters = atob(result.zipData)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/zip' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'polyglot-generated-code.zip'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const fileEntries = Object.entries(result.files)

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🎁</span>
              生成结果
            </CardTitle>
            <CardDescription>
              成功生成 {fileEntries.length} 个文件
            </CardDescription>
          </div>
          <Button onClick={handleDownload} className="gap-2">
            <Download size={16} />
            下载 ZIP 文件 💌
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={fileEntries[0]?.[0]} className="w-full">
          <TabsList className="grid w-full grid-cols-auto gap-1 h-auto p-1">
            {fileEntries.map(([filename]) => (
              <TabsTrigger 
                key={filename} 
                value={filename}
                className="flex items-center gap-1 px-3 py-2 text-xs"
              >
                <FileText size={12} />
                {filename}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {fileEntries.map(([filename, content]) => (
            <TabsContent key={filename} value={filename} className="mt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText size={16} />
                  {filename}
                </div>
                <ScrollArea className="h-96 w-full border rounded-md">
                  <pre className="p-4 text-sm font-mono bg-muted/30 overflow-x-auto">
                    <code className="language-typescript">{content}</code>
                  </pre>
                </ScrollArea>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}