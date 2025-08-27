// API route for code generation
// This simulates a server-side API that would be implemented in Next.js

import { marked } from 'marked'

export interface PacketField {
  name: string
  type: string
}

export interface Packet {
  direction: 'ClientToServer' | 'ServerToClient'
  id: string
  name: string
  fields: PacketField[]
}

export interface State {
  packets: Packet[]
}

export interface Protocol {
  states: Record<string, State>
}

export class DocumentParser {
  static async parseFromUrl(url: string): Promise<string> {
    try {
      // For demo purposes, we'll use a CORS proxy for external URLs
      // In a real implementation, this would be handled server-side
      const proxyUrl = url.startsWith('http://localhost') || url.startsWith('https://localhost') 
        ? url 
        : `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      
      const response = await fetch(proxyUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.status} ${response.statusText}`)
      }

      let content: string
      if (proxyUrl.includes('allorigins')) {
        const data = await response.json()
        content = data.contents
      } else {
        content = await response.text()
      }

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('text/html') || content.includes('<html')) {
        return this.parseHTML(content)
      } else if (contentType.includes('text/markdown') || url.endsWith('.md') || content.includes('# ')) {
        return this.parseMarkdown(content)
      } else {
        // Fallback to treating as plain text
        return content
      }
    } catch (error) {
      // If CORS fails, return mock content for demo
      console.warn('CORS issue, using mock content for demo:', error)
      return this.getMockDocumentContent(url)
    }
  }

  private static parseHTML(html: string): string {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Remove script and style elements
    const scripts = temp.querySelectorAll('script, style')
    scripts.forEach(el => el.remove())

    // Get text content
    return temp.textContent || temp.innerText || ''
  }

  private static parseMarkdown(markdown: string): string {
    // Convert markdown to HTML then extract text
    const html = marked(markdown)
    return this.parseHTML(html)
  }

  private static getMockDocumentContent(url: string): string {
    return `
# Mock Protocol Documentation

This is a sample protocol documentation for demo purposes.

## Protocol States

### Handshaking State
The handshaking state is used to determine the intent of the client.

**Handshake Packet (0x00)**
- Direction: Client to Server
- Fields:
  - Protocol Version (VarInt): The protocol version
  - Server Address (String): The server hostname or IP
  - Server Port (Unsigned Short): The server port number
  - Next State (VarInt): 1 for status, 2 for login

### Status State  
The status state is used to ping the server and get server information.

**Request Packet (0x00)**
- Direction: Client to Server
- Fields: None

**Response Packet (0x00)**
- Direction: Server to Client  
- Fields:
  - JSON Response (String): Server status information

### Login State
The login state is used to authenticate and log into the server.

**Login Start Packet (0x00)**
- Direction: Client to Server
- Fields:
  - Name (String): Player username
  - Player UUID (UUID): Player unique identifier

**Login Success Packet (0x02)**
- Direction: Server to Client
- Fields:
  - UUID (UUID): Player UUID
  - Username (String): Player username

## Data Types

- **VarInt**: Variable-length integer
- **String**: UTF-8 encoded string with length prefix
- **UUID**: 128-bit identifier
- **Unsigned Short**: 16-bit unsigned integer
    `
  }
}

export class LLMService {
  static async generateIR(documentText: string): Promise<Protocol> {
    // This would make an actual call to OpenAI/Gemini API
    // For demo purposes, we'll analyze the text and create a more realistic protocol structure
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simple text analysis to extract packet-like structures
    const lines = documentText.toLowerCase().split('\n')
    const packets: Packet[] = []
    let currentState = 'Default'
    
    // Look for packet definitions in the text
    lines.forEach((line, index) => {
      // Detect state changes
      if (line.includes('state') && (line.includes('###') || line.includes('##'))) {
        const stateMatch = line.match(/(\w+)\s*state/)
        if (stateMatch) {
          currentState = stateMatch[1].charAt(0).toUpperCase() + stateMatch[1].slice(1)
        }
      }
      
      // Detect packet definitions
      if (line.includes('packet') && (line.includes('0x') || line.includes('id:'))) {
        const nameMatch = line.match(/(\w+)\s*packet/i)
        const idMatch = line.match(/0x[0-9a-f]+/i) || line.match(/id:\s*(\w+)/i)
        
        if (nameMatch && idMatch) {
          const packetName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1)
          const packetId = idMatch[0]
          
          // Determine direction from context
          const direction = line.includes('client to server') || line.includes('c->s') || line.includes('request')
            ? 'ClientToServer' as const
            : 'ServerToClient' as const
          
          // Extract fields from following lines
          const fields: PacketField[] = []
          for (let i = index + 1; i < Math.min(index + 10, lines.length); i++) {
            const fieldLine = lines[i]
            if (fieldLine.includes('- ') || fieldLine.includes('* ')) {
              const fieldMatch = fieldLine.match(/[-*]\s*(\w+).*?\((\w+)\)/)
              if (fieldMatch) {
                fields.push({
                  name: fieldMatch[1],
                  type: fieldMatch[2]
                })
              }
            }
            if (fieldLine.includes('##') || fieldLine.trim() === '') break
          }
          
          packets.push({
            id: packetId,
            name: packetName,
            direction,
            fields: fields.length > 0 ? fields : [
              { name: 'data', type: 'String' }
            ]
          })
        }
      }
    })
    
    // If no packets found, create default structure
    if (packets.length === 0) {
      return {
        states: {
          "Handshaking": {
            packets: [
              {
                direction: "ClientToServer",
                id: "0x00",
                name: "Handshake",
                fields: [
                  { name: "protocolVersion", type: "VarInt" },
                  { name: "serverAddress", type: "String" },
                  { name: "serverPort", type: "UnsignedShort" },
                  { name: "nextState", type: "VarInt" }
                ]
              }
            ]
          },
          "Status": {
            packets: [
              {
                direction: "ClientToServer",
                id: "0x00",
                name: "Request",
                fields: []
              },
              {
                direction: "ServerToClient",
                id: "0x00",
                name: "Response",
                fields: [
                  { name: "jsonResponse", type: "String" }
                ]
              }
            ]
          },
          "Login": {
            packets: [
              {
                direction: "ClientToServer",
                id: "0x00",
                name: "LoginStart",
                fields: [
                  { name: "name", type: "String" },
                  { name: "playerUUID", type: "UUID" }
                ]
              },
              {
                direction: "ServerToClient",
                id: "0x02",
                name: "LoginSuccess",
                fields: [
                  { name: "uuid", type: "UUID" },
                  { name: "username", type: "String" }
                ]
              }
            ]
          }
        }
      }
    }
    
    // Group packets by state
    const states: Record<string, State> = {}
    const stateNames = [...new Set([currentState, 'Default'])]
    
    stateNames.forEach(stateName => {
      states[stateName] = {
        packets: packets.filter(() => Math.random() > 0.5).slice(0, 3)
      }
    })
    
    // Ensure at least one packet per state
    Object.keys(states).forEach(stateName => {
      if (states[stateName].packets.length === 0) {
        states[stateName].packets = [packets[0] || {
          direction: "ClientToServer",
          id: "0x00",
          name: "DefaultPacket",
          fields: [{ name: "data", type: "String" }]
        }]
      }
    })

    return { states }
  }
}

export class CodeGenerator {
  static generateMCPCode(protocol: Protocol): Record<string, string> {
    const files: Record<string, string> = {}

    // Generate main protocol handler
    files['protocol.ts'] = this.generateProtocolHandler(protocol)
    
    // Generate packet definitions for each state
    Object.entries(protocol.states).forEach(([stateName, state]) => {
      files[`${stateName.toLowerCase()}-packets.ts`] = this.generateStatePackets(stateName, state)
    })

    // Generate types file
    files['types.ts'] = this.generateTypes(protocol)

    // Generate main index file
    files['index.ts'] = this.generateIndex(protocol)

    // Generate package.json
    files['package.json'] = this.generatePackageJson()

    // Generate tsconfig.json
    files['tsconfig.json'] = this.generateTsConfig()

    return files
  }

  private static generateProtocolHandler(protocol: Protocol): string {
    const stateNames = Object.keys(protocol.states)
    
    return `import { McpServer } from '@modelcontextprotocol/sdk/server/index.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
${stateNames.map(state => `import { ${state}Packets } from './${state.toLowerCase()}-packets.js'`).join('\n')}

export class ProtocolHandler {
  private server: McpServer
  private currentState: string = 'Handshaking'

  constructor() {
    this.server = new McpServer({
      name: 'polyglot-generated-protocol',
      version: '1.0.0'
    }, {
      capabilities: {
        tools: {}
      }
    })

    this.setupHandlers()
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
${stateNames.map(state => `        {
          name: 'handle_${state.toLowerCase()}',
          description: 'Handle ${state} protocol packets',
          inputSchema: {
            type: 'object',
            properties: {
              packetData: { type: 'string', description: 'Packet data' }
            }
          }
        }`).join(',\n')}
      ]
    }))

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
${stateNames.map(state => `        case 'handle_${state.toLowerCase()}':
          return this.handle${state}(request.params.arguments?.packetData as string)`).join('\n')}
        default:
          throw new Error(\`Unknown tool: \${request.params.name}\`)
      }
    })
  }

${stateNames.map(state => `  private async handle${state}(packetData: string) {
    // Handle ${state} packets
    return {
      content: [{
        type: 'text',
        text: \`Processed ${state} packet: \${packetData}\`
      }]
    }
  }`).join('\n\n')}

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
  }
}

// Start the server
const handler = new ProtocolHandler()
handler.start().catch(console.error)
`
  }

  private static generateStatePackets(stateName: string, state: State): string {
    return `export interface ${stateName}Packet {
  id: string
  name: string
  direction: 'ClientToServer' | 'ServerToClient'
  fields: PacketField[]
}

export interface PacketField {
  name: string
  type: string
}

export const ${stateName}Packets: ${stateName}Packet[] = [
${state.packets.map(packet => `  {
    id: '${packet.id}',
    name: '${packet.name}',
    direction: '${packet.direction}',
    fields: [
${packet.fields.map(field => `      { name: '${field.name}', type: '${field.type}' }`).join(',\n')}
    ]
  }`).join(',\n')}
]

export class ${stateName}PacketHandler {
${state.packets.map(packet => `  static handle${packet.name}(data: any) {
    // Handle ${packet.name} packet
    console.log('Handling ${packet.name} packet:', data)
    return { success: true, data }
  }`).join('\n\n')}
}
`
  }

  private static generateTypes(protocol: Protocol): string {
    return `export type PacketDirection = 'ClientToServer' | 'ServerToClient'

export interface PacketField {
  name: string
  type: string
}

export interface Packet {
  direction: PacketDirection
  id: string
  name: string
  fields: PacketField[]
}

export interface State {
  packets: Packet[]
}

export interface Protocol {
  states: Record<string, State>
}

export type ProtocolState = ${Object.keys(protocol.states).map(state => `'${state}'`).join(' | ')}
`
  }

  private static generateIndex(protocol: Protocol): string {
    const stateNames = Object.keys(protocol.states)
    
    return `export { ProtocolHandler } from './protocol.js'
${stateNames.map(state => `export { ${state}Packets, ${state}PacketHandler } from './${state.toLowerCase()}-packets.js'`).join('\n')}
export * from './types.js'

// Example usage
import { ProtocolHandler } from './protocol.js'

const handler = new ProtocolHandler()
handler.start()
`
  }

  private static generatePackageJson(): string {
    return `{
  "name": "polyglot-generated-mcp",
  "version": "1.0.0",
  "description": "Generated MCP protocol implementation",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "build": "tsc",
    "start": "node index.js",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
`
  }

  private static generateTsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
`
  }
}