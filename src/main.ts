import * as fs from 'fs'
import * as path from 'path'
import { CnabFile } from './cnab/type/cnab-file'

function createFileFromPath(filePath: string): File {
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer])
  return new File([blob], path.basename(filePath))
}

async function main(): Promise<void> {
  const filePath = path.resolve(__dirname, '../res/bradesco/cnab240/bradesco_cnab_240.txt')
  const file = createFileFromPath(filePath)
  
  const cnabFile = await CnabFile.open(file)
  
  console.log('=== Informações do Arquivo CNAB ===')
  console.log(`Banco: ${cnabFile.bank}`)
  console.log(`Formato: CNAB${cnabFile.format}`)
  console.log(`Total de linhas: ${cnabFile.rawLines.length}`)
  console.log()
  
  console.log('=== Validação ===')
  const validationResult = cnabFile.validate(true)
  console.log(`Válido: ${validationResult.isValid}`)
  console.log(`Erros: ${validationResult.errors.length}`)
  console.log()
  
  if (validationResult.isValid) {
    console.log('=== Leitura do CNAB ===')
    const cnab = cnabFile.read()
    
    console.log('Campos do header:', cnab.header.fieldNames.length > 0 ? cnab.header.fieldNames.join(', ') : '(sem campos)')
    console.log('Campos do trailer:', cnab.trailer.fieldNames.length > 0 ? cnab.trailer.fieldNames.join(', ') : '(sem campos)')
    console.log(`Total de boletos: ${cnab.boletos.length}`)
    console.log()
    
    cnab.boletos.forEach((boleto, index) => {
      console.log(`=== Boleto ${index + 1} ===`)
      console.log(`Linhas no boleto: ${boleto.lineCount}`)
      console.log()
      
      console.log('Segmentos do boleto:')
      for (const line of boleto.lines) {
        const segmentType = line.rawLine.length > 13 ? line.rawLine[13] : '?'
        const fieldList = line.fieldNames.length > 0 ? line.fieldNames.join(', ') : '(sem campos)'
        console.log(`  Linha ${line.lineNumber} [Segmento ${segmentType}]: ${fieldList}`)
      }
      console.log()
      
      const nome = boleto['nome do sacado'] as string | undefined
      const valor = boleto['valor titulo'] as number | undefined
      const dataEmissao = boleto['data de emissão'] as Date | undefined
      
      console.log('Dados do boleto:')
      if (nome) {
        console.log(`  Nome do sacado: ${nome}`)
      }
      
      if (valor != null) {
        console.log(`  Valor do título: R$ ${valor.toFixed(2)}`)
      }
      
      if (dataEmissao) {
        const dataFormatada = dataEmissao.toLocaleDateString('pt-BR')
        console.log(`  Data de emissão: ${dataFormatada}`)
      }
      console.log()
    })
  } else {
    console.log('Erros de validação:')
    validationResult.errors.forEach(error => {
      console.log(`  Linha ${error.lineNumber}: ${error.message}`)
    })
  }
}

main().catch(console.error)
