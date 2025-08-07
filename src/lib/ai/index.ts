import { AIProvider } from './types'
import { DeepSeekProvider } from './providers/deepseek'

export function createAIProvider(): AIProvider {
  try {
    return new DeepSeekProvider()
  } catch (error) {
    console.error('DeepSeek initialization failed:', error)
    throw new Error('AI_NOT_CONFIGURED')
  }
}

export * from './types'