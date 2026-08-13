# CNAB-Lib

Biblioteca TypeScript para processamento de arquivos CNAB 240 e 400.

## Características

- TypeScript com validação de tipos completa
- Suporte a CNAB 240 e 400
- Recuperação de erros parciais (error-resilient)
- Validação de campos literais fixos em headers/trailers
- Decodificação automática Latin-1
- Zero dependências de runtime

## Instalação

```bash
npm install tp-cnab-lib
```

## Uso Básico

```typescript
import { openCnabFile } from 'tp-cnab-lib'
import * as fs from 'fs'

// Carregar arquivo CNAB como File (browser) ou criar File a partir do buffer (Node.js)
const buffer = fs.readFileSync('arquivo.rem')
const file = new File([buffer], 'arquivo.rem')

// Processar arquivo CNAB
const cnabFile = await openCnabFile(file)

console.log(`Formato: ${cnabFile.type}`)
console.log(`Boletos: ${cnabFile.boletoCount}`)

// Ler todos os boletos
const results = cnabFile.readAll()

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Boleto ${index}: ${result.data.numeroDocumento} - R$ ${result.data.valor}`)
  } else {
    console.log(`Boleto ${index}: ${result.errors?.length} erro(s)`)
  }
})

// Ler boleto individual
const boleto = cnabFile.getBoleto(0)
const result = boleto.read() // ou readSimple() / readFull()

if (result.errors.length === 0) {
  console.log('Sacado:', result.data.sacado?.nome)
  console.log('Valor:', result.data.valor)
  console.log('Vencimento:', result.data.vencimento)
}
```

## API

### `openCnabFile(file: File): Promise<CnabFile>`

Detecta formato e banco automaticamente, valida estrutura e retorna arquivo CNAB pronto para leitura.

**Lança exceções:**
- `CNABNoLinesProvidedError` - arquivo vazio
- `CNABFormatNotRecognizedError` - formato não identificado
- `CNABBankNotFoundError` - banco não suportado
- `CNABFileValidationError` - erro estrutural não recuperável (header/trailer inválido)

### `CnabFile`

| Propriedade/Método | Descrição |
|---|---|
| `.type` | `'CNAB240'` ou `'CNAB400'` |
| `.boletoCount` | Quantidade de boletos no arquivo |
| `.structureErrors` | Erros estruturais recuperáveis encontrados |
| `.hasStructureErrors` | `true` se há erros estruturais |
| `.getBoleto(index)` | Retorna `CnabBoleto` no índice especificado |
| `.readAll()` | Retorna array de `BoletoResult` com todos os boletos |
| `.read(start, end)` | Retorna array de `BoletoResult` para intervalo específico |

### `CnabBoleto`

| Método | Descrição |
|---|---|
| `.read(mode?)` | Lê boleto (padrão: `ReadMode.SIMPLE`) |
| `.readSimple()` | Lê apenas campos canônicos |
| `.readFull()` | Lê campos canônicos + extras do banco |
| `.readField(name)` | Lê campo individual (lança erro se houver problema) |
| `.readExtraField(key)` | Lê campo extra individual |

### `BoletoResult`

Retornado por `.readAll()` e `.read(start, end)` do `CnabFile` - inclui metadados sobre posição e sucesso.

```typescript
{
  index: number          // índice do boleto no arquivo
  success: boolean       // true se errors.length === 0
  data?: Partial<BoletoCnabData>  // dados parciais extraídos
  errors?: (CNABFieldValidationError | CNABBoletoValidationError)[]
  error?: Error          // erro inesperado durante processamento
}
```

### `BoletoReadResult`

Retornado por `.read()`, `.readSimple()` e `.readFull()` do `CnabBoleto` - apenas dados e erros de validação.

```typescript
{
  data: PartialBoletoCnabData  // dados parciais (vazio se houver erro estrutural)
  errors: (CNABFieldValidationError | CNABBoletoValidationError)[]
}
```

## Campos Canônicos (`BoletoCnabData`)

Todos os campos são opcionais:

```typescript
{
  nossoNumero?: string
  numeroDocumento?: string
  vencimento?: Date
  valor?: number
  dataEmissao?: Date
  desconto?: { valor: number }
  abatimento?: { valor: number }
  sacado?: {
    documento?: string
    nome?: string
    endereco?: {
      logradouro?: string
      cep?: string
    }
  }
  extra?: Record<string, any>  // campos específicos do banco (modo FULL)
}
```

## Encoding

Arquivos CNAB usam **Latin-1 (ISO-8859-1)**:

```typescript
// ✅ Correto
const content = fs.readFileSync('arquivo.rem', 'latin1')

// ❌ Errado
const content = fs.readFileSync('arquivo.rem', 'utf8')
```

## Erros

A biblioteca distingue entre:

- **Erros não recuperáveis**: lançam exceção, interrompem processamento
- **Erros recuperáveis**: coletados em listas, retornam dados parciais

### Erros de Campo (`CNABFieldValidationError`)

Campo inválido ou com formato incorreto.

```typescript
{
  code: 'FIELD_VALIDATION_ERROR'
  field: string        // nome do campo
  rawValue: string     // valor bruto que falhou
  message: string
  lineNumber?: number  // 0-indexed internamente, 1-indexed na mensagem
}
```

### Erros de Boleto (`CNABBoletoValidationError`)

Problema estrutural em um boleto específico (ex: segmento órfão).

```typescript
{
  code: 'BOLETO_VALIDATION_ERROR'
  message: string
  lineNumber?: number
}
```

### Erros de Arquivo (`CNABFileValidationError`)

Problema estrutural no arquivo inteiro (ex: header/trailer inválido, campos literais incorretos).

```typescript
{
  code: 'FILE_VALIDATION_ERROR'
  message: string
  lineNumber?: number
}
```

## Validações Implementadas

### CNAB 400 Bradesco

**Header:**
- Identificação arquivo-remessa (posição 1: '1')
- Literal REMESSA (posições 2-8)
- Código de serviço (posições 9-10: '01')
- Literal COBRANCA (posições 11-25)
- Nome do banco (posições 79-93: 'BRADESCO')
- Número sequencial (posições 394-399: '000001')

**Trailer:**
- Posições 2-394 devem estar em branco
- Sequencial de registro deve bater com quantidade de linhas

### CNAB 240 Bradesco

**Header:**
- Código do banco (posições 0-2: '237')
- Controle de lote (posições 3-6: '0000')
- Código do arquivo remessa (posição 142: '1')
- Versão do layout (posições 163-165: '084')

**Trailer:**
- Código do banco (posições 0-2: '237')
- Controle de lote (posições 3-6: '9999')

## Bancos Suportados

| Banco | Código | CNAB 400 | CNAB 240 |
|---|:---:|:---:|:---:|
| Bradesco | 237 | ✅ | ✅ |

## Estrutura do Projeto

```
src/
├── index.ts                    # API pública
├── types/
│   ├── file/                  # CnabFile (base + 240/400)
│   ├── boleto/                # CnabBoleto (base + 240/400)
│   ├── fields/                # CnabField + validators/parsers
│   ├── errors/                # Hierarquia de erros
│   └── processing/            # Tipos de retorno e agrupamento
├── banks/
│   └── bradesco/
│       ├── boletos/           # Implementações de CnabBoleto
│       ├── files/             # Implementações de CnabFile
│       └── cnabFields/        # Definições de campos específicos
├── parser/                    # Detecção de formato/banco
├── registry/                  # Registro de bancos suportados
└── utils/                     # Helpers (validação CPF/CNPJ, etc)
```

## Licença

LGPL-3.0-or-later

Copyright (c) 2026 Transferbank
