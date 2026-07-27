# CNAB-Lib 🏦

Biblioteca TypeScript moderna para processamento e validação de arquivos CNAB 240 e 400.

## Características

✅ **TypeScript First** — Totalmente tipado para melhor experiência de desenvolvimento  
✅ **CNAB 240 e 400** — Suporte para os dois formatos mais utilizados no Brasil  
✅ **Validação Completa** — Valida estrutura, formato de campos e regras de negócio  
✅ **Múltiplos Bancos** — Schemas específicos para diferentes instituições financeiras  
✅ **Zero Dependências** — Biblioteca leve e independente  
✅ **Fácil de Usar** — API simples e intuitiva

## 📥 Instalação

Este pacote não é publicado em nenhum registry — é consumido direto do repositório Git privado. O `dist/` **não é commitado**: ao instalar, o script `prepare` do `package.json` roda o build (`tsc`) automaticamente, então o projeto que consome sempre pega o TypeScript mais recente já compilado, sem depender de artefato versionado.

```bash
npm install git+https://github.com/Transferbank/tp-cnab-lib.git
```

ou com Yarn:

```bash
yarn add tp-cnab-lib@git+https://github.com/Transferbank/tp-cnab-lib.git
```

Se preferir autenticar por SSH em vez de HTTPS (evita prompt de usuário/senha em máquinas já configuradas com chave):

```bash
yarn add tp-cnab-lib@git+ssh://git@github.com/Transferbank/tp-cnab-lib.git
```

> **Windows**: se o clone falhar com `Filename too long`, rode uma vez `git config --global core.longpaths true` (alguns arquivos de documentação do schema têm caminho longo o suficiente para estourar o limite padrão do Windows).

## Uso Básico

```typescript
import { openCnab } from 'tp-cnab-lib'
import * as fs from 'fs'

// CNAB usa encoding Latin-1, não UTF-8
const fileContent = fs.readFileSync('remessa.rem', 'latin1')

// Detecta formato (240/400) e banco pelo header, resolve o schema
const cnabFile = openCnab(fileContent)
console.log(cnabFile.type, cnabFile.bankName) // 'cnab400', 'Bradesco'

// Validar
const validation = cnabFile.validate()
if (!validation.isValid) {
  validation.feedback.lines.forEach(err => console.log(`Linha ${err.line}: ${err.message}`))
}

// Ler os boletos
const { header, trailer, bills } = cnabFile.read()
bills.forEach(bill => console.log(bill.sacado?.nome, bill.valor, bill.vencimento))
```

`openCnab()` lança exceção (nunca retorna `null`/objeto parcial) quando o arquivo está vazio, o tamanho de linha não é 240/400, o banco não é identificado no header, ou o banco/formato não tem schema cadastrado:

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

Ponto de entrada principal. Detecta formato e banco, resolve o schema, e devolve um `CNABFile` — o corpo do arquivo só é processado quando `.read()`/`.validate()` são chamados.

### `CNABFile`

| Membro | Descrição |
|---|---|
| `.type`, `.bankCode`, `.bankName`, `.lineCount` | Metadados já detectados |
| `.validate(): CNABFileValidationResult` | Validação estrutural + de negócio. Nunca lança por erro de conteúdo — devolve `{ isValid, feedback: { type, bank, lines } }` |
| `.read(options?): CNABReadResult` | Extrai `{ header, trailer, bills }`. `mode: 'SIMPLE'` (padrão, campos canônicos como `valor`/`vencimento`/`sacado`) ou `'FULL'` (todos os campos do banco); `lazy: true` devolve `bills` como `LazyBillItem[]` — cada item só é extraído ao chamar `.resolve()`; `page: { start, size }` pagina os boletos |
| `.readAsync(options?): Promise<CNABReadResult>` | Igual a `.read()`, assíncrono; aceita `onProgress`/`batchSize` para arquivos grandes |

Modo lazy, útil para não processar boletos que você não vai usar:

```typescript
const { bills } = cnabFile.read({ lazy: true })
const primeiro = await bills[0].resolve() // extrai só esse boleto, sob demanda
```

### `validateCnabFile(fileContent: string)` — API legada

Função stateless equivalente a `openCnab(...).validate()`, mas nunca lança: devolve `{ valid, format, bank, totalRecords, records, errors }` mesmo quando formato/banco não são reconhecidos (`format`/`bank` vêm `null` nesse caso). **Atenção:** `records`/`totalRecords` não têm equivalente em `.validate()`/`.read()` — são exclusivos dessa função legada. Mantida por compatibilidade; em código novo prefira `openCnab()`.

> Para o formato completo (campo a campo) do que `.validate()`, `.read()` e `.readAsync()` devolvem, veja [RETURN_TYPES_GUIDE.md](RETURN_TYPES_GUIDE.md).

### Funções Utilitárias

```typescript
import {
  detectFormat,
  detectBank,
  parseDate,
  formatDateBR,
  isValidCPF,
  isValidCNPJ
} from 'tp-cnab-lib'
```

## Bancos Suportados

### CNAB 400
- Banco do Brasil (001)
- Santander (033)
- Caixa Econômica (104)
- Bradesco (237)
- Itaú (341)
- Sicoob (756)
- Sicredi (748)

### CNAB 240
- Santander (033)
- Bradesco (237)
- Sicredi (748)

## Validações Realizadas

### Estrutura
- Presença de header e trailer
- Tamanho correto das linhas (240 ou 400 caracteres)
- Tipo de registro correto em cada posição
- Sequência lógica de registros

### Campos
- Campos obrigatórios preenchidos
- Campos numéricos contêm apenas dígitos
- Valores fixos (padrao) estão corretos
- Tamanho dos campos respeitado

### Regras de Negócio
- CPF/CNPJ válidos (algoritmo de dígito verificador)
- Datas de vencimento válidas e não vencidas
- Valores maiores que zero
- Nome do pagador com mínimo de caracteres

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Build
npm run build

# Desenvolvimento (watch mode)
npm run dev

# Testes
npm test

# Lint
npm run lint

# Format
npm run format
```

## Estrutura do Projeto

```
src/
├── index.ts                    # Exportações principais (openCnab, validateCnabFile, ...)
├── types/
│   ├── index.ts                # Barrel de tipos
│   ├── cnab.ts                 # Interfaces CNAB (ValidationError, CNABRecord legado, ...)
│   ├── cnab-file.ts             # Classe CNABFile (read/readAsync/validate)
│   ├── cnab-read/               # Tipos dos campos canônicos (CNABData, CNABHeader, CNABTrailer)
│   ├── bank-schema.ts           # Tipos de schema (BankSchema, RecordSchema, FieldDefinition)
│   ├── provider.ts              # Tipo CNABProvider
│   ├── agrupamento.ts           # Tipos de agrupamento (GroupingRule, BillGroup, ...)
│   └── errors/                  # Hierarquia de exceptions (CNABError e subclasses)
├── banks/                      # Um diretório por banco — ver IMPLEMENTATION_GUIDE.md
│   └── <banco>/schemas/{cnab400,cnab240}/
├── schemas/
│   └── index.ts                 # Registro central (cnab400Banks/cnab240Banks) — agrega src/banks/*
├── provider/
│   └── catalog.ts               # Monta CNABProvider a partir de schema + regra de agrupamento
├── agrupamento/                 # Agrupa linhas em boletos (núcleo + satélites)
├── read/                        # Extração de campos canônicos (extract-canonical, extract-full)
├── parser/
│   ├── field-extractor.ts      # Extração de campos por posição
│   └── format-detector.ts      # Detecção de formato/banco
├── validators/
│   ├── cnab240-business-validator.ts    # Validação de negócio CNAB 240
│   ├── cnab240-structure-validator.ts   # Validação estrutural CNAB 240
│   ├── cnab400-business-validator.ts    # Validação de negócio CNAB 400
│   ├── cnab400-structure-validator.ts   # Validação estrutural CNAB 400
│   ├── document-validator.ts            # Validação CPF/CNPJ
│   └── merge-validation-errors.ts       # Merge de erros estrutura + negócio
└── utils/
    ├── date-parser.ts          # Parse de datas
    └── string-utils.ts         # Utilitários de string
```

## Contribuindo

Contribuições são bem-vindas! Para adicionar suporte a um novo banco, veja o passo a passo completo em [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md).

## Licença

MIT

## Autor

Seu Nome
