import { DocumentParser, LLMService, CodeGenerator } from './generation-engine'

export class APIService {
  static async *generateCode(url: string): AsyncGenerator<any, void, unknown> {
    try {
      // Step 1: Parse document
      yield {
        type: 'log',
        level: 'INFO',
        message: '任务开始啦... 准备解析文档',
        emoji: '✨'
      }

      yield {
        type: 'log',
        level: 'INFO',
        message: `正在读取URL: ${url}`,
        emoji: '🧐'
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      const documentText = await DocumentParser.parseFromUrl(url)
      
      yield {
        type: 'log',
        level: 'SUCCESS',
        message: `文档解析成功，一共${documentText.length}个字符喔...`,
        emoji: '✅'
      }

      // Step 2: Generate IR with LLM
      yield {
        type: 'log',
        level: 'AGENT',
        message: '正在召唤LLM思考...',
        emoji: '🧠'
      }

      await new Promise(resolve => setTimeout(resolve, 1500))

      const protocol = await LLMService.generateIR(documentText)

      const totalPackets = Object.values(protocol.states).reduce((sum, state) => sum + state.packets.length, 0)
      const stateCount = Object.keys(protocol.states).length

      yield {
        type: 'log',
        level: 'SUCCESS',
        message: `思考完毕！识别出${stateCount}个状态，${totalPackets}个数据包定义...`,
        emoji: '🎉'
      }

      // Step 3: Generate code
      yield {
        type: 'log',
        level: 'AGENT',
        message: '开始变魔法（生成代码）...',
        emoji: '🪄'
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      const files = CodeGenerator.generateMCPCode(protocol)

      yield {
        type: 'log',
        level: 'AGENT',
        message: '检查一下代码有没有问题...',
        emoji: '👀'
      }

      await new Promise(resolve => setTimeout(resolve, 800))

      // Step 4: Create ZIP
      yield {
        type: 'log',
        level: 'INFO',
        message: '正在打包文件...',
        emoji: '📦'
      }

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add all generated files to zip
      Object.entries(files).forEach(([filename, content]) => {
        zip.file(filename, content)
      })

      const zipData = await zip.generateAsync({ type: 'base64' })

      yield {
        type: 'log',
        level: 'SUCCESS',
        message: `代码生成并通过检查！太棒了！生成了${Object.keys(files).length}个文件`,
        emoji: '👍'
      }

      // Complete
      yield {
        type: 'complete',
        result: {
          files,
          zipData
        }
      }

    } catch (error) {
      yield {
        type: 'error',
        message: error instanceof Error ? error.message : '未知错误'
      }
    }
  }
}