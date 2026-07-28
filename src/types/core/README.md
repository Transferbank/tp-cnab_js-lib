# Core Types - Tipos Fundamentais CNAB

Esta pasta contém os tipos fundamentais para processamento de arquivos CNAB.

## Estrutura de Arquivos

### 📄 `cnab.ts`
Tipos básicos de CNAB:
- `CNABFormatCode` - Enum para formato do arquivo (CNAB240 / CNAB400)
- `CNABFileValidationResult` - Resultado de validação
- `ParsedLine` - Linha parseada
- `ParsedField` - Campo parseado

### 📄 `cnab-file.ts`
Classe principal para manipulação de arquivos CNAB:
- `CNABFile` - Classe que representa um arquivo CNAB
  - `validate()` - Valida estrutura e conteúdo
  - `read()` - Lê dados (síncrono)
  - `readAsync()` - Lê dados (assíncrono com callback de progresso)

### 📄 `read-mode.ts`
Modos de leitura:
- `ReadMode` - 'SIMPLE' (campos canônicos) ou 'FULL' (todos os campos do banco)

### 📄 `read-options.ts`
Opções de leitura:
- `ReadOptions` - Opções básicas (mode, lazy, page)
- `ReadPageOptions` - Opções de paginação (start, size)
- `ReadAsyncOptions` - Opções assíncronas (inclui onProgress, batchSize)
- `ReadProgressCallback` - Callback de progresso para leitura assíncrona

### 📄 `read-result.ts`
Resultado de leitura:
- `CNABReadResult<T>` - Estrutura retornada por read() e readAsync()
  - `header` - Dados do header
  - `trailer` - Dados do trailer
  - `bills` - Lista de boletos/títulos

### 📄 `lazy-bill.ts`
Extração lazy (sob demanda):
- `LazyBillItem<T>` - Representa um boleto ainda não extraído
  - `startLine` - Linha onde começa o boleto
  - `resolve()` - Função para extrair os dados sob demanda

## Organização por Domínio

```
Validação          → cnab.ts (CNABFileValidationResult)
Classe Principal   → cnab-file.ts (CNABFile)
Configuração       → read-mode.ts, read-options.ts
Resultado          → read-result.ts
Performance        → lazy-bill.ts
```

## Uso Típico

```typescript
import { openCnab } from 'tp-cnab-lib'
import type { CNABReadResult, ReadOptions } from 'tp-cnab-lib'

// Abrir arquivo
const cnabFile = openCnab(fileContent)

// Validar
const validation = cnabFile.validate()
if (!validation.isValid) {
  console.error(validation.feedback.lines)
}

// Ler dados (modo SIMPLE)
const result: CNABReadResult = cnabFile.read()
console.log(result.bills)

// Ler dados (modo FULL com lazy loading)
const options: ReadOptions = { mode: 'FULL', lazy: true }
const lazyResult = cnabFile.read(options)

for (const item of lazyResult.bills) {
  const bill = await item.resolve()
  console.log(bill)
}

// Ler com paginação e progresso
const asyncResult = await cnabFile.readAsync({
  page: { start: 0, size: 100 },
  onProgress: ({ current, total }) => {
    console.log(`${current}/${total}`)
  }
})
```
