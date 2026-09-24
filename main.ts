import * as fs from 'fs'
import * as path from 'path'
import { openCnabFileFromLines } from './src/index'

function readExampleLines(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'latin1')
  return content.split(/\r?\n/).filter(line => line.length > 0)
}

function printBoletoResults(cnabFile: ReturnType<typeof openCnabFileFromLines>): void {
  const boletoResults = cnabFile.validateBoletos(true)
  const invalidResults = boletoResults.filter(result => !result.isValid)

  console.log(`Boletos encontrados: ${boletoResults.length} (${invalidResults.length} inválido(s))`)
  for (const result of invalidResults) {
    console.log(`  Boleto ${result.index} (linhas ${result.lineNumbers.join(', ')}): inválido`)
    for (const error of result.errors) {
      console.log(`    - ${error.message}`)
    }
  }
}

function main(): void {
  const filePath = path.join(__dirname, 'res/bradesco/cnab240/bradesco_cnab_240.txt')

  console.log('=== Cenário 1: arquivo válido ===')
  const validLines = readExampleLines(filePath)
  const validFile = openCnabFileFromLines(validLines)
  console.log(`Banco: ${validFile.bank} | Formato: CNAB${validFile.format} | Linhas: ${validFile.rawLines.length}`)
  console.log(`Arquivo válido: ${validFile.validate(true).isValid}`)
  printBoletoResults(validFile)

  console.log('\n=== Cenário 2: um boleto corrompido no meio do arquivo ===')
  const corruptedLines = readExampleLines(filePath)
  corruptedLines[7] = corruptedLines[7].substring(0, 5) // trunca uma linha do 2º boleto
  const corruptedFile = openCnabFileFromLines(corruptedLines)
  console.log(`Arquivo válido: ${corruptedFile.validate(true).isValid}`)
  printBoletoResults(corruptedFile)

  console.log('\n=== Cenário 3: arquivos reais da pasta res/older ===')
  const olderDir = path.join(__dirname, 'res/older')
  const olderFiles = fs.readdirSync(olderDir).sort()

  for (const fileName of olderFiles) {
    console.log(`\n--- ${fileName} ---`)
    try {
      const lines = readExampleLines(path.join(olderDir, fileName))
      const cnabFile = openCnabFileFromLines(lines)
      console.log(`Banco: ${cnabFile.bank} | Formato: CNAB${cnabFile.format} | Linhas: ${cnabFile.rawLines.length}`)
      console.log(`Arquivo válido: ${cnabFile.validate(true).isValid}`)
      printBoletoResults(cnabFile)
    } catch (error) {
      console.log(`Falha ao abrir o arquivo: ${(error as Error).message}`)
    }
  }
}

main()
