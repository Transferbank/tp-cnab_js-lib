/**
 * Central registry for all bank schemas
 * 
 * This file aggregates schemas from individual banks and provides
 * a unified interface for schema lookup.
 */

import { BankSchema } from '../types'

// Import CNAB 400 schemas
import { bancoDoBrasilCnab400 } from '../banks/bancoDoBrasil/schemas/cnab400'
import { bradescoCnab400 } from '../banks/bradesco/schemas/cnab400'
import { itauCnab400 } from '../banks/itau/schemas/cnab400'
import { santanderCnab400 } from '../banks/santander/schemas/cnab400'
import { caixaCnab400 } from '../banks/caixa/schemas/cnab400'
import { sicoobCnab400 } from '../banks/sicoob/schemas/cnab400'
import { sicrediCnab400 } from '../banks/sicredi/schemas/cnab400'

// Import CNAB 240 schemas
import { bradescoCnab240 } from '../banks/bradesco/schemas/cnab240'
import { santanderCnab240 } from '../banks/santander/schemas/cnab240'
import { sicrediCnab240 } from '../banks/sicredi/schemas/cnab240'

/**
 * Registry of all CNAB 400 bank schemas
 * Key: bank code (e.g., '001', '237', '341')
 */
export const cnab400Banks: Record<string, BankSchema> = {
  '001': bancoDoBrasilCnab400,
  '033': santanderCnab400,
  '104': caixaCnab400,
  '237': bradescoCnab400,
  '341': itauCnab400,
  '748': sicrediCnab400,
  '756': sicoobCnab400,
}

/**
 * Registry of all CNAB 240 bank schemas
 * Key: bank code (e.g., '237', '033')
 */
export const cnab240Banks: Record<string, BankSchema> = {
  '033': santanderCnab240,
  '237': bradescoCnab240,
  '748': sicrediCnab240,
}

/**
 * Get the schema for a specific bank and CNAB format
 * 
 * @param bankCode - Bank code (e.g., '001', '237', '341')
 * @param format - CNAB format ('cnab240' or 'cnab400')
 * @returns Bank schema or null if not found
 */
export function getBankSchema(bankCode: string, format: 'cnab240' | 'cnab400'): BankSchema | null {
  if (format === 'cnab240') {
    return cnab240Banks[bankCode] || null
  }
  return cnab400Banks[bankCode] || null
}
