# Guia de Implementação — Adicionar um Banco

## Estrutura de Pastas

```
src/banks/<banco>/schemas/
├── cnab400/
│   ├── header.ts / detail.ts / trailer.ts
│   ├── registros-opcionais/type<N>-<slug>/type<N>-<slug>.ts   # multa, mensagem, etc — um por tipo
│   └── index.ts        # monta o BankSchema e reexporta os registros
└── cnab240/
    ├── header.ts            # header de arquivo
    ├── batch-header.ts       # header de lote
    ├── segment-p.ts          # dados financeiros do boleto
    ├── segment-q.ts          # dados do pagador
    ├── batch-trailer.ts      # trailer de lote
    ├── trailer.ts            # trailer de arquivo
    ├── segmentos-opcionais/  # segment-r.ts, segment-s.ts, segment-y*.ts + index.ts
    └── index.ts
```

> Não crie um arquivo `cnab400.ts` (ou `cnab240.ts`) ao lado da pasta de mesmo nome — quebra a resolução de módulo em alguns bundlers (esbuild/Vite).

Cada registro exporta um `RecordSchema`; o `index.ts` da pasta monta o `BankSchema`:

```typescript
// src/banks/<banco>/schemas/cnab400/index.ts
import { BankSchema, BANK_CODES } from '@tp-types/index'
import { HEADER } from './header'
import { DETAIL } from './detail'
import { TRAILER } from './trailer'

export { HEADER } from './header'
export { DETAIL } from './detail'
export { TRAILER } from './trailer'

export const meuBancoCnab400: BankSchema = {
  bankCode: BANK_CODES.MEU_BANCO,
  bankName: 'Meu Banco',
  header: HEADER,
  detail: DETAIL,
  trailer: TRAILER,
  optionalRecords: [{ identifier: '2', schema: TYPE2_ALGUM_OPCIONAL }],
}
```

Para CNAB 240 o `BankSchema` usa `headerArquivo`, `headerLote`, `segmentoP`, `segmentoQ`, `trailerLote`, `trailerArquivo` (nomes de propriedade em português, mesmo com arquivos em inglês).

## Registrar o Banco

Em `src/schemas/index.ts`:

```typescript
import { meuBancoCnab400 } from '@banks/meu-banco/schemas/cnab400'

export const cnab400Banks: Record<string, BankSchema> = {
  // ... bancos existentes
  '999': meuBancoCnab400, // código FEBRABAN
}
```

Adicione o código também em `BANK_CODES` (`src/types/bank/bank-codes.ts`).

## `FieldDefinition` (cada campo de um `RecordSchema`)

```typescript
{
  pos: [inicio, fim],              // posição 1-indexed, inclusive
  type: 'num' | 'alfa' | 'data',
  size: número,
  decimals: número,                 // só para 'num'
  required: boolean,
  dateFormat: 'DDMMAA' | 'DDMMAAAA' | 'AAAAMMDD' | null,
  pattern: string | number | null,  // valor fixo esperado (validado só se required: true)
  description: string,              // vira nome da coluna em erros de validação
  canonical: string | null,         // mapeamento pro campo canônico (ex: 'vencimento', 'sacado.nome')
}
```

## Validações Customizadas

Duas camadas independentes, sempre rodam as duas (merge, não gate):

- **Estrutural** (`src/validators/cnab{240,400}-structure-validator.ts`): sequência de registros, pareamento núcleo+satélite, contadores do trailer.
- **Negócio** (`src/validators/cnab{240,400}-content-validator.ts`): valores, datas, CPF/CNPJ, nomes.

Regra específica de um banco: condicione pelo `bankSchema.bankCode` dentro do validador correspondente.

```typescript
if (bankSchema?.bankCode === BANK_CODES.MEU_BANCO) {
  if (/* condição específica */) {
    errors.push({ line: lineNumber, field: 'Campo Específico', message: 'Mensagem de erro' })
  }
}
```

## Testes

Padrão: `tests/schemas/banks/<banco>/<formato>/`, um arquivo por registro + `integrity.test.ts` contra fixture real quando disponível. Descrições em português começando com "deve". Fluxo completo (`openCnab` → `read`/`validate`): `tests/open-cnab-integration.test.ts`.

## Checklist para Novo Banco

- [ ] Obter layout oficial do banco
- [ ] Criar `src/banks/<banco>/schemas/{cnab400,cnab240}/` com um arquivo por registro
- [ ] Montar `BankSchema` no `index.ts` e registrar em `src/schemas/index.ts` + `BANK_CODES`
- [ ] Testar com arquivo real (`tests/fixtures/`)
- [ ] Citar a fonte do layout no topo do schema
- [ ] Adicionar testes em `tests/schemas/banks/<banco>/`

## Referências

Manual FEBRABAN + manual técnico de cada banco. Sempre valide contra arquivo real — layouts teóricos costumam divergir do que o banco realmente gera.
