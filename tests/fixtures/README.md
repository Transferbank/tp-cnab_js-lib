# 📂 Fixtures - Arquivos CNAB de Teste

Arquivos CNAB reais (anonimizados) usados para validação dos schemas e testes de parsing.

## 📁 Estrutura das Pastas

```
fixtures/
├── cnab240/                    # Arquivos CNAB 240 (240 caracteres/linha)
│   └── bradesco/
│       ├── remessa-multipla.txt     # Arquivo CNAB original
│       ├── remessa-multipla.json    # Metadados extraídos
│       └── remessa-multipla.test.ts # Testes de validação
│
└── cnab400/                    # Arquivos CNAB 400 (400 caracteres/linha)
    └── bradesco/
        ├── remessa-multipla.txt
        ├── remessa-multipla.json
        └── remessa-multipla.test.ts
```

## 🎯 Componentes de um Fixture

Cada fixture completo possui **3 arquivos**:

### 1. **Arquivo TXT** (`remessa-multipla.txt`)
- Arquivo CNAB real com dados anonimizados
- Encoding: **latin1** (ISO-8859-1)
- Linhas fixas: 240 caracteres (CNAB 240) ou 400 caracteres (CNAB 400)
- Contém: header + registros de detalhe + trailer

### 2. **Arquivo JSON** (`remessa-multipla.json`)
- Metadados extraídos do arquivo TXT
- Campos formatados (valores decimais, datas DD/MM/YYYY)
- Campos raw (strings originais do arquivo)
- Totalizadores (contagem, soma de valores)

### 3. **Arquivo de Teste** (`remessa-multipla.test.ts`)
- Testes 100% dinâmicos usando o JSON
- Valida integridade, estrutura e campos
- Usa loops sobre `metadata.records` (sem valores hardcoded)

## ⚙️ Como Adicionar um Novo Fixture

### Passo 1: Obter o Arquivo TXT
Coloque seu arquivo CNAB na pasta correta:
```bash
# Para CNAB 240
tests/fixtures/cnab240/[banco]/[nome].txt

# Para CNAB 400
tests/fixtures/cnab400/[banco]/[nome].txt
```

### Passo 2: Gerar os Metadados JSON
Use o script gerador automático:

```bash
npm run generate-metadata
```

O script irá perguntar:
- Código do banco (ex: 237 para Bradesco)
- Formato (240 ou 400)
- Nome do fixture (ex: remessa-multipla)

O JSON será gerado automaticamente com todos os campos extraídos.

**Ou use parâmetros diretos:**
```bash
npm run generate-metadata -- --bank=237 --format=CNAB400 --fixture=remessa-multipla
```

### Passo 3: Criar os Testes
Copie um teste existente e adapte:

```typescript
// tests/fixtures/cnab400/bradesco/remessa-multipla.test.ts
import { loadFixtureMetadata } from '../../../helpers/fixture-metadata'

describe('Metadados: remessa-multipla.json', () => {
  let metadata: ReturnType<typeof loadFixtureMetadata>

  beforeAll(() => {
    metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', 'cnab400')
  })

  test('deve ter quantidade correta de títulos', () => {
    expect(metadata.records.length).toBeGreaterThan(0)
  })

  test('deve validar valores de todos os títulos', () => {
    metadata.records.forEach((record) => {
      expect(record.amount).toBeGreaterThan(0)
      expect(record.name).toBeTruthy()
      expect(record.document).toMatch(/^\d+$/)
    })
  })
})
```

### Passo 4: Validar
Execute os testes:
```bash
npm test -- tests/fixtures/cnab400/bradesco
```

## 💡 Sistema de Metadados

### Por Que Usar Metadados?

**❌ Antes (hardcoded):**
```typescript
test('deve ter valor correto', () => {
  expect(records[0].amount).toBe(100.00)  // Se mudar o TXT, teste quebra
})
```

**✅ Depois (dinâmico):**
```typescript
test('deve ter valores corretos', () => {
  metadata.records.forEach((expected, index) => {
    expect(records[index].amount).toBe(expected.amount)  // Sempre sincronizado!
  })
})
```

### Estrutura do JSON

```json
{
  "description": "Descrição do fixture",
  "bankCode": "237",
  "bankName": "Bradesco",
  "format": "CNAB400",
  "structure": {
    "totalLines": 76,
    "headerLines": 1,
    "detailLines": 37,
    "trailerLines": 1
  },
  "header": {
    "cedenteNome": "EMPRESA EXEMPLO",
    "dataGeracao": "26/05/2026",
    "dataGeracaoRaw": "260526"
  },
  "records": [
    {
      "index": 1,
      "name": "JOAO DA SILVA",
      "document": "11144477735",
      "documentRaw": "00011144477735",
      "documentType": "CPF",
      "documentTypeCode": "01",
      "amount": 100.50,
      "amountRaw": "0000000010050",
      "dueDate": "31/12/2026",
      "dueDateRaw": "311226",
      "address": "RUA EXEMPLO 123",
      "zipCode": "01234-567"
    }
  ],
  "totals": {
    "recordCount": 37,
    "totalAmount": 296958.12
  }
}
```

## 🛠️ Comandos Disponíveis

### Gerar Metadados
```bash
# Modo interativo
npm run generate-metadata

# Com parâmetros
npm run generate-metadata -- --bank=237 --format=CNAB400 --fixture=remessa-multipla
```

### Executar Testes
```bash
# Todos os testes
npm test

# Testes de um banco específico
npm test -- tests/fixtures/cnab400/bradesco

# Teste específico
npm test -- tests/fixtures/cnab400/bradesco/remessa-multipla.test.ts
```

## 📋 Bancos Disponíveis

| Código | Nome | CNAB 240 | CNAB 400 |
|--------|------|----------|----------|
| 001 | Banco do Brasil | ⏳ | ✅ |
| 033 | Santander | ⏳ | ✅ |
| 104 | Caixa | ⏳ | ⏳ |
| 237 | Bradesco | ✅ | ✅ |
| 341 | Itaú | ⏳ | ✅ |
| 748 | Sicredi | ⏳ | ✅ |
| 756 | Sicoob | ⏳ | ⏳ |

## 🔒 Dados Anonimizados

**IMPORTANTE**: Todos os fixtures contêm apenas dados fictícios:
- ✅ CPF/CNPJ válidos mas fictícios
- ✅ Nomes genéricos
- ✅ Endereços de exemplo
- ✅ Valores pequenos

**⚠️ Nunca comite arquivos com dados reais de clientes!**

## 🎓 Tipos de Testes

A lib possui dois tipos de testes complementares:

### 1. Testes de Fixture (`tests/fixtures/`)
- Validam a **integridade dos metadados JSON**
- Verificam que dados extraídos estão consistentes
- Testam estrutura do arquivo (linhas, contadores)
- **Não testam o schema diretamente**

### 2. Testes de Schema (`tests/schemas/banks/`)
- Validam as **definições do schema** (posições, formatos, tipos)
- Testam parsing campo a campo com arquivo real
- Verificam valores padrão e campos obrigatórios
- **Testam o schema propriamente dito**

Ambos são necessários para cobertura completa!

## 📚 Helpers Disponíveis

### `loadFixtureMetadata()`
Carrega e valida JSON de metadados:

```typescript
import { loadFixtureMetadata } from '../../helpers/fixture-metadata'

const metadata = loadFixtureMetadata('bradesco', 'remessa-multipla', 'cnab400')
console.log(metadata.totals.recordCount) // 37
```

### `validateFixtureIntegrity()`
Valida integridade entre TXT e JSON:

```typescript
import { validateFixtureIntegrity } from '../../helpers/fixture-validator'

const errors = validateFixtureIntegrity(lines, metadata, schema)
if (errors.length > 0) {
  console.error('Inconsistências:', errors)
}
```

## ⚠️ Troubleshooting

### "Metadados inválidos: arquivo não encontrado"
**Causa**: Caminho do arquivo JSON incorreto  
**Solução**: Verifique que o arquivo existe em `tests/fixtures/[formato]/[banco]/[nome].json`

### "Valor não corresponde"
**Causa**: JSON desatualizado em relação ao TXT  
**Solução**: Regere o JSON usando `npm run generate-metadata`

### "Número de linhas não corresponde"
**Causa**: TXT foi modificado mas JSON não foi atualizado  
**Solução**: Regere o JSON ou atualize manualmente os campos `structure` e `records`

## ✅ Checklist para Novo Fixture

- [ ] Arquivo TXT com dados anonimizados (240 ou 400 chars/linha)
- [ ] JSON gerado com `npm run generate-metadata`
- [ ] Arquivo de teste criado (copiar de fixture existente)
- [ ] Testes passando: `npm test`
- [ ] README atualizado (tabela de bancos)

---

**Documentação completa:** `/tests/fixtures/cnab240/README.md` (detalhes técnicos)
