import { AIProvider } from './types'
import { DeepSeekProvider } from './providers/deepseek'
import { logger } from '@/lib/core/logging-service'

export function createAIProvider(): AIProvider {
  try {
    return new DeepSeekProvider()
  } catch (error) {
    logger.error('DeepSeek initialization failed:', error)
    throw new Error('AI_NOT_CONFIGURED')
  }
}

export * from './types'