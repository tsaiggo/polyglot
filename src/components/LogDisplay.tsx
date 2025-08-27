import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LogEntry } from '@/hooks/use-sse-generation'
import { useEffect, useRef } from 'react'

interface LogDisplayProps {
  logs: LogEntry[]
  isGenerating: boolean
}

export function LogDisplay({ logs, isGenerating }: LogDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200'
      case 'ERROR': return 'bg-red-100 text-red-800 border-red-200'
      case 'AGENT': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (logs.length === 0 && !isGenerating) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-4xl mb-2">📋</div>
        <p>日志将在这里显示...</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-80 w-full border rounded-lg bg-card" ref={scrollRef}>
      <div className="p-4 space-y-3">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-start gap-3 p-3 rounded-md bg-muted/50 hover:bg-muted/70 transition-colors"
          >
            <span className="text-lg flex-shrink-0">{log.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={getLevelColor(log.level)}>
                  {log.level}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {log.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-card-foreground leading-relaxed">
                {log.message}
              </p>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
            <div className="animate-spin text-lg">⚡</div>
            <div className="flex-1">
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                PROCESSING
              </Badge>
              <p className="text-sm text-muted-foreground mt-1">
                正在处理中...
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  )
}