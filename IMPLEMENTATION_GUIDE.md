# Guia de Implementação CNAB-Lib

Este documento orienta como adicionar um novo banco à biblioteca, seguindo a estrutura atual (por pasta, um arquivo por registro).

## Estrutura de Pastas por Banco

Cada banco tem sua própria pasta em `src/banks/<nome-do-banco>/schemas/`, com um subdiretório por formato:

```
src/banks/<banco>/schemas/
├── cnab400/
│   ├── header.ts
│   ├── detail.ts
│   ├── trailer.ts
│   ├── registros-opcionais/       # registros opcionais (multa, mensagem, etc), um por tipo
│   │   └── index.ts
│   └── index.ts                    # monta o BankSchema e reexporta os registros individuais
└── cnab240/
    ├── header.ts                   # header de arquivo
    ├── header-lote.ts
    ├── segmento-p.ts                # dados financeiros do boleto
    ├── segmento-q.ts                # dados do pagador
    ├── segmento-r.ts                # opcional: descontos/multa/mensagens
    ├── trailer-lote.ts
    ├── trailer.ts                   # trailer de arquivo
    └── index.ts
```

Cada `index.ts` importa os registros da própria pasta e monta o objeto `BankSchema`:

```typescript
// src/banks/<banco>/schemas/cnab400/index.ts
import { BankSchema, BANK_CODES } from '../../../../types'
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
  // opcional: registros que não fazem parte do núcleo (multa, mensagem, etc)
  optionalRecords: [{ identifier: '2', schema: TYPE2_ALGUM_OPCIONAL }],
}
```

> **Importante:** não crie um arquivo `cnab400.ts` (ou `cnab240.ts`) ao lado da pasta `cnab400/` — arquivo e pasta com o mesmo nome causam ambiguidade de resolução de módulo que quebra sob alguns bundlers (esbuild/Vite), mesmo funcionando normalmente no Node. Coloque a montagem do `BankSchema` direto no `index.ts` da pasta.

### 1. CNAB 400

Cada registro (`header.ts`, `detail.ts`, `trailer.ts`) exporta um `RecordSchema`:

```typescript
// src/banks/<banco>/schemas/cnab400/detail.ts
import { RecordSchema } from '../../../../types'

export const DETAIL: RecordSchema = {
  tipo_registro: {
    pos: [1, 1],
    type: 'num',
    size: 1,
    decimals: 0,
    required: true,
    dateFormat: null,
    pattern: '1',
    description: 'Tipo do registro detalhe',
    canonical: null,
  },
  // ... demais campos
  vencimento: {
    pos: [121, 126],
    type: 'data',
    size: 6,
    decimals: 0,
    required: true,
    dateFormat: 'DDMMAA',
    pattern: null,
    description: 'Data de vencimento do título',
    canonical: 'vencimento',
  },
}
```

### 2. CNAB 240

Mesmo princípio, um arquivo por segmento (`header.ts`, `header-lote.ts`, `segmento-p.ts`, `segmento-q.ts`, `trailer-lote.ts`, `trailer.ts`), montado no `index.ts`:

```typescript
// src/banks/<banco>/schemas/cnab240/index.ts
import { BankSchema, BANK_CODES } from '../../../../types'
import { HEADER_ARQUIVO } from './header'
import { SEGMENTO_P } from './segmento-p'
import { SEGMENTO_Q } from './segmento-q'
// ...

export const meuBancoCnab240: BankSchema = {
  bankCode: BANK_CODES.MEU_BANCO,
  bankName: 'Meu Banco',
  headerArquivo: HEADER_ARQUIVO,
  segmentoP: SEGMENTO_P,
  segmentoQ: SEGMENTO_Q,
  // ...
}
```

### 3. Registrar o banco

Depois de criar o schema, registre-o em `src/schemas/index.ts`:

```typescript
import { meuBancoCnab400 } from '../banks/meu-banco/schemas/cnab400'

export const cnab400Banks: Record<string, BankSchema> = {
  // ... bancos existentes
  '999': meuBancoCnab400, // código FEBRABAN do banco
}
```

## Formato do Schema (`FieldDefinition`)

Cada campo de um `RecordSchema` segue esta interface (ver `src/types/bank-schema.ts`):

```typescript
{
  pos: [inicio, fim],              // posição 1-indexed, inclusive
  type: 'num' | 'alfa' | 'data',   // tipo do campo
  size: número,                     // quantidade de caracteres
  decimals: número,                 // casas decimais (só para 'num')
  required: boolean,                // se o campo deve estar preenchido
  dateFormat: 'DDMMAA' | 'DDMMAAAA' | 'AAAAMMDD' | null,
  pattern: string | number | null,  // valor fixo esperado (só validado se required: true)
  description: string,              // descrição em português — vira o nome da coluna em erros de validação
  canonical: string | null,         // mapeamento pro campo canônico de CNABData (ex: 'vencimento', 'sacado.nome'); null se não houver equivalente canônico
}
```

## Peculiaridades por Banco

### Banco do Brasil (001)
- **CNAB 400**: Usa tipo_registro = '7' para detalhe (não '1')
- Nome do pagador tem 37 caracteres (não 40)

### Santander (033)
- **CNAB 400**: Trailer contém quantidade de documentos e valor total
- Útil para validação cruzada

### Caixa Econômica (104)
- Sistema SIGCB
- Nosso número de 17 posições

### Sicredi (748)
- **CNAB 240**: Cooperativa com layout versão 081
- Particularidades nos campos de controle

## Validações Customizadas

A validação é dividida em duas camadas independentes, que sempre rodam as duas (modelo merge, não gate):

- **Estrutural** (`src/validators/cnab240-structure-validator.ts` / `cnab400-structure-validator.ts`): sequência de registros, tipos nas posições corretas, pareamento núcleo+satélite, contadores do trailer.
- **Negócio** (`src/validators/cnab240-business-validator.ts` / `cnab400-business-validator.ts`): valores, datas, documentos (CPF/CNPJ), nomes.

Para adicionar uma regra de negócio específica de um banco, edite o validador correspondente e condicione pelo `bankSchema.bankCode`:

```typescript
if (bankSchema?.bankCode === BANK_CODES.MEU_BANCO) {
  if (/* condição específica */) {
    errors.push({ line: lineNumber, column: 'Campo Específico', message: 'Mensagem de erro' })
  }
}
```

## Testes

Siga o padrão de `tests/schemas/banks/<banco>/<formato>/` — um arquivo de teste por registro (`header.test.ts`, `detail.test.ts`, etc), mais `integrity.test.ts` comparando contra um fixture real quando disponível. Convenção de nomenclatura: descrições em português começando com "deve" (`test('deve ter tipo de registro na posição 1', ...)`).

Para testar o fluxo completo (`openCnab` → `read`/`validate`), veja `tests/open-cnab-integration.test.ts`.

## Fontes de Informação

### Layouts Oficiais
- **FEBRABAN**: Documentação oficial do padrão CNAB
- **Manuais dos Bancos**: Cada banco publica especificações técnicas

### Repositórios Open Source Úteis (usados como fonte cruzada, não vendorizados no repo)
- **cnab_yaml**: https://github.com/cnab/cnab_yaml
- **pycnab240**: https://github.com/eduardosan/pycnab240
- **laravel-boleto**: https://github.com/eduardokum/laravel-boleto
- **brcobranca**: https://github.com/kivanio/brcobranca

## Extensões Futuras

### Geração de Arquivos CNAB
Para adicionar funcionalidade de geração (não apenas leitura/validação):

1. Criar `src/generators/` com builders para CNAB 240 e 400
2. Implementar `CNABBuilder` com API fluente:
   ```typescript
   const cnab = new CNAB400Builder('033')
     .setCompany({ name: 'Empresa', cnpj: '...' })
     .addBoleto({
       payerName: 'João',
       amount: 100.50,
       dueDate: '01/07/2026',
       // ...
     })
     .build()
   ```

### Suporte a Retorno
Vários bancos já têm o header de retorno mapeado (ver `*_HEADER_RETORNO` em alguns schemas), mas o parsing completo de arquivo de retorno ainda não é suportado. Para adicionar:

1. Criar `src/parsers/return-parser.ts`
2. Completar os schemas de retorno em `src/banks/<banco>/schemas/`

## Checklist para Novo Banco

- [ ] Obter layout oficial do banco
- [ ] Criar `src/banks/<banco>/schemas/cnab400/` (e/ou `cnab240/`) com um arquivo por registro
- [ ] Montar o `BankSchema` no `index.ts` da pasta e registrar em `src/schemas/index.ts`
- [ ] Testar com arquivo real (`tests/fixtures/`)
- [ ] Documentar peculiaridades (comentário no topo do schema, citando a fonte do layout)
- [ ] Adicionar testes em `tests/schemas/banks/<banco>/`

## Boas Práticas

1. **Sempre baseie-se em documentação oficial** — evite suposições
2. **Teste com arquivos reais** — layouts teóricos podem ter diferenças
3. **Cite a fonte no topo do arquivo** — manual oficial, ou lib de referência cruzada usada pra confirmar
4. **Mantenha consistência** — siga o padrão dos schemas existentes (um arquivo por registro, `index.ts` monta e reexporta)
5. **Evite arquivo + pasta com o mesmo nome** — ver aviso na seção de estrutura de pastas
