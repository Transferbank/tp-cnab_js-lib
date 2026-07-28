# CNAB-Lib

Biblioteca TypeScript para processamento e validação de arquivos CNAB 240 e 400.

## Características

- **TypeScript first**, zero dependências
- CNAB 240 e 400, múltiplos bancos
- Validação em duas camadas: estrutural (sequência/tipo de registro) e de negócio (CPF/CNPJ, datas, valores)

## Instalação

Não publicado em registry — consumido direto do Git. `dist/` não é commitado; o script `prepare` builda (`tsc`) na instalação.

```bash
npm install git+https://github.com/Transferbank/tp-cnab-lib.git
```

> **Windows**: se o clone falhar com `Filename too long`, rode `git config --global core.longpaths true`.

## Uso Básico

```typescript
import { openCnab } from 'tp-cnab-lib'
import * as fs from 'fs'

// CNAB usa encoding Latin-1, não UTF-8
const fileContent = fs.readFileSync('remessa.rem', 'latin1')

const cnabFile = openCnab(fileContent) // detecta formato/banco, resolve o schema
console.log(cnabFile.type, cnabFile.bankName)

const validation = cnabFile.validate()
if (!validation.isValid) {
  validation.feedback.lines.forEach(err => console.log(`Linha ${err.line}: ${err.message}`))
}

const { header, trailer, bills } = cnabFile.read()
bills.forEach(bill => console.log(bill.sacado?.nome, bill.valor, bill.vencimento))
```

`openCnab()` lança exceção (nunca retorna `null`) para arquivo vazio, formato não reconhecido, banco não identificado no header, ou banco/formato sem schema cadastrado:

```typescript
try {
  const cnabFile = openCnab(fileContent)
} catch (error) {
  // CNABEmptyFileError | CNABFormatNotRecognizedError | CNABBankNotFoundError | CNABSchemaNotFoundError
  console.error(error.code, error.message)
}
```

## API

### `openCnab(raw: string): CNABFile`

Ponto de entrada único. O corpo do arquivo só é processado quando `.read()`/`.validate()` são chamados.

### `CNABFile`

| Membro | Descrição |
|---|---|
| `.type`, `.bankCode`, `.bankName`, `.lineCount` | Metadados já detectados |
| `.validate(options?)` | Validação estrutural + negócio. Nunca lança por erro de conteúdo — devolve `{ isValid, feedback: { type, bank, lines } }` |
| `.read(options?)` | Extrai `{ header, trailer, bills }`. `mode: 'SIMPLE'` (campos canônicos) ou `'FULL'` (todos os campos do banco); `lazy: true` devolve `LazyBillItem[]` (extração sob demanda via `.resolve()`); `page: { start, size }` pagina |
| `.readAsync(options?)` | Igual a `.read()`, assíncrono; aceita `onProgress`/`batchSize` para arquivos grandes |

```typescript
const { bills } = cnabFile.read({ lazy: true })
const primeiro = await bills[0].resolve() // extrai só esse boleto
```

> Formato completo do que cada método devolve: [RETURN_TYPES_GUIDE.md](RETURN_TYPES_GUIDE.md).

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

## Desenvolvimento

```bash
npm install
npm run build     # tsc
npm run dev       # tsc --watch
npm test          # jest
npm run lint
```

## Estrutura do Projeto

```
src/
├── index.ts          # openCnab + exports públicos
├── types/            # core (CNABFile), bank (BankSchema), errors, read, processing
├── banks/<banco>/schemas/{cnab400,cnab240}/  # um arquivo por registro — ver IMPLEMENTATION_GUIDE.md
├── schemas/index.ts  # registro central (cnab400Banks/cnab240Banks)
├── provider/catalog.ts   # monta schema + regra de agrupamento
├── grouping/          # agrupa linhas em boletos (núcleo + satélites)
├── read/              # extração de campos canônicos/full
├── parser/            # extração de campos por posição, detecção de formato/banco
├── validators/         # validação estrutural e de negócio (240/400)
└── utils/              # datas, CPF/CNPJ
```

## Contribuindo

Para adicionar um banco novo, veja [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md).

## Licença

MIT
