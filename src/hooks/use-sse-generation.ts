import { useState, useEffect, useRef, useCallback } from 'react'
import { APIService } from '@/services/api-service'

export interface LogEntry {
  id: string
  level: 'INFO' | 'SUCCESS' | 'AGENT' | 'ERROR'
  message: string
  emoji: string
  timestamp: Date
}

export interface GenerationResult {
  files: Record<string, string>
  zipData: string
}

interface UseSSEGenerationProps {
  onComplete?: (result: GenerationResult) => void
  onError?: (error: string) => void
}

export function useSSEGeneration({ onComplete, onError }: UseSSEGenerationProps = {}) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const addLog = useCallback((level: LogEntry['level'], message: string, emoji: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      level,
      message,
      emoji,
      timestamp: new Date()
    }
    setLogs(prev => [...prev, newLog])
  }, [])

  const startGeneration = useCallback(async (url: string) => {
    if (isGenerating) return

    setIsGenerating(true)
    setLogs([])
    setResult(null)

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      // Simulate SSE by iterating through the async generator
      for await (const event of APIService.generateCode(url)) {
        // Check if generation was aborted
        if (abortControllerRef.current?.signal.aborted) {
          break
        }

        if (event.type === 'log') {
          addLog(event.level, event.message, event.emoji)
        } else if (event.type === 'complete') {
          setResult(event.result)
          onComplete?.(event.result)
          break
        } else if (event.type === 'error') {
          addLog('ERROR', event.message, '❌')
          onError?.(event.message)
          break
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addLog('ERROR', `Generation failed: ${errorMessage}`, '💥')
      onError?.(errorMessage)
    } finally {
      setIsGenerating(false)
      abortControllerRef.current = null
    }
  }, [isGenerating, addLog, onComplete, onError])

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      addLog('INFO', 'Generation stopped by user', '⏹️')
      setIsGenerating(false)
    }
  }, [addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
    setResult(null)
  }, [])

  return {
    logs,
    isGenerating,
    result,
    startGeneration,
    stopGeneration,
    clearLogs
  }
}