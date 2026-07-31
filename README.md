# CNAB-Lib

Biblioteca TypeScript para processamento e validação de arquivos CNAB 240 e 400.

## Características

- **TypeScript first**, zero dependências
- CNAB 240 e 400, múltiplos bancos
- Suporte assíncrono
- Validações com feedback detalhado
- Decodificação automática Latin-1
- Extensível para novos bancos

## Instalação

```bash
npm install tp-cnab-lib
```

## Uso Básico

```typescript
import { openCnab } from 'tp-cnab-lib'
import * as fs from 'fs'

// Carregar arquivo CNAB como File (browser) ou criar File a partir do buffer (Node.js)
const buffer = fs.readFileSync('remessa.rem')
const file = new File([buffer], 'remessa.rem')

try {
  // openCnab detecta formato/banco automaticamente e resolve o schema
  const cnabFile = await openCnab(file)
  console.log(cnabFile.type, cnabFile.bankName)

  // Apenas verificar se é válido (retorna boolean)
  const isValid = cnabFile.validate()
  if (!isValid) {
    console.log('Arquivo inválido')
  }

  // Ou obter feedback detalhado (retorna objeto com erros)
  const validation = cnabFile.validate(true)
  if (!validation.isValid) {
    validation.feedback.lines.forEach(err => 
      console.log(`Linha ${err.line}: ${err.message}`)
    )
  }

  // Extrair dados dos boletos
  const { header, trailer, bills } = cnabFile.read()
  bills.forEach(bill => 
    console.log(bill.sacado?.nome, bill.valor, bill.vencimento)
  )
} catch (error) {
  // CNABEmptyFileError | CNABFormatNotRecognizedError | 
  // CNABBankNotFoundError | CNABSchemaNotFoundError
  console.error(error.code, error.message)
}
```

## API

### `openCnab(file: File): Promise<CNABFile>`

Ponto de entrada único e assíncrono. Recebe um objeto `File` (Web API), detecta automaticamente o formato (CNAB 240/400) e o banco, e decodifica o conteúdo usando encoding Latin-1 (ISO-8859-1).

**Lança exceções** para:
- Arquivo vazio (`CNABEmptyFileError`)
- Formato não reconhecido (`CNABFormatNotRecognizedError`)
- Banco não identificado (`CNABBankNotFoundError`)
- Banco sem schema cadastrado (`CNABSchemaNotFoundError`)

O corpo do arquivo só é processado quando `.read()`/`.validate()` são chamados.

### `CNABFile`

| Membro | Descrição |
|---|---|
| `.type`, `.bankCode`, `.bankName`, `.lineCount` | Metadados já detectados |
| `.validate()` | Retorna `boolean` — validação rápida (fail-fast) |
| `.validate(true)` | Retorna `CNABValidationResult` — validação completa com feedback detalhado `{ isValid, feedback: { type, bank, lines } }` |
| `.read(options?)` | Extrai `{ header, trailer, bills }`. `mode: 'SIMPLE'` (campos canônicos) ou `'FULL'` (todos os campos do banco); `lazy: true` devolve `LazyBillItem[]` (extração sob demanda via `.resolve()`); `page: { start, size }` pagina |
| `.readAsync(options?)` | Igual a `.read()`, assíncrono; aceita `onProgress`/`batchSize` para arquivos grandes |

```typescript
const { bills } = cnabFile.read({ lazy: true })
const primeiro = await bills[0].resolve() // extrai só esse boleto
```

> Formato completo do que cada método devolve: [RETURN_TYPES_GUIDE.md](RETURN_TYPES_GUIDE.md).

## Encoding

Arquivos CNAB usam **Latin-1 (ISO-8859-1)**, não UTF-8. A biblioteca faz a decodificação automaticamente ao receber o `File`. Se você estiver lendo o arquivo manualmente (ex: Node.js), não especifique encoding ao ler:

```typescript
// ✅ Correto - deixa o buffer binário
const buffer = fs.readFileSync('remessa.rem')
const file = new File([buffer], 'remessa.rem')

// ❌ Errado - não especifique 'utf8' ou 'latin1'
const wrong = fs.readFileSync('remessa.rem', 'utf8') // ❌
```

## Bancos Suportados

| Banco | CNAB 400 | CNAB 240 |
|---|:---:|:---:|
| Banco do Brasil (001) | ✅ | |
| Santander (033) | ✅ | ✅ |
| Caixa (104) | ✅ | |
| Bradesco (237) | ✅ | ✅ |
| Itaú (341) | ✅ | |
| Sicredi (748) | ✅ | ✅ |
| Sicoob (756) | ✅ | |

## Estrutura do Projeto

```
src/
├── index.ts              # openCnab + exports públicos
├── types/                # Core (CNABFile), bank (BankSchema), errors, read
├── banks/                # Schemas específicos de cada banco
│   └── <banco>/
│       ├── docs/         # Arquivos de exemplo e documentação
│       ├── schemas/      # Definições CNAB 240/400
│       └── tests/        # Testes específicos do banco
├── schemas/              # Registro central (cnab400Banks/cnab240Banks)
├── provider/             # Monta schema + regra de agrupamento
├── grouping/             # Agrupa linhas em boletos
├── read/                 # Extração de campos canônicos/full
├── parser/               # Detecção de formato/banco, extração de campos
├── validators/           # Validação estrutural e de negócio
└── utils/                # Helpers (datas, CPF/CNPJ, leitura de arquivo)
```

## Contribuindo

Para adicionar um banco novo, veja [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md).

## Licença

Copyright (c) 2026 Transferbank

Este projeto é distribuído sob os termos da GNU Lesser General Public License, versão 3.0 (LGPL-3.0).

Você pode utilizá-lo, modificá-lo e redistribuí-lo conforme os termos da LGPL. Alterações feitas na própria biblioteca devem permanecer sob a mesma licença.

Consulte o arquivo LICENSE para o texto completo.

```json
{
  "license": "LGPL-3.0-or-later"
}
```
