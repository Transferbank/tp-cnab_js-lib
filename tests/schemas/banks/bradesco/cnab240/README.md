# Testes do Schema Bradesco CNAB 240

Testes modularizados para validar o schema CNAB 240 do Bradesco.

## 📁 Estrutura

```
cnab240/
├── shared.ts              # Helpers compartilhados (readFixture)
├── metadata.test.ts       # Testes de metadados do banco
├── header.test.ts         # Testes do Header de Arquivo
├── segment-p.test.ts     # Testes do Segmento P (dados financeiros)
├── segment-q.test.ts     # Testes do Segmento Q (dados do pagador)
├── trailer.test.ts        # Testes do Trailer de Arquivo
├── integration.test.ts    # Testes de integração (parsing completo)
├── integrity.test.ts      # Testes de integridade do schema
└── README.md              # Este arquivo
```

## 🎯 Tipos de Testes

### 1. **Metadados (`metadata.test.ts`)**
- Valida código do banco (237)
- Valida nome do banco (Bradesco)
- Verifica se todos os schemas obrigatórios estão definidos

### 2. **Header (`header.test.ts`)**
- Definição dos campos (posições, tipos, padrões)
- Parsing de arquivo real
- Extração de dados do cedente

### 3. **Segmento P (`segment-p.test.ts`)**
- Definição dos campos financeiros
- Parsing de valores e vencimentos
- Validação de múltiplos títulos

### 4. **Segmento Q (`segment-q.test.ts`)**
- Definição dos campos do pagador
- Parsing de CPF/CNPJ, nome, endereço
- Validação de dados de múltiplos pagadores

### 5. **Trailer (`trailer.test.ts`)**
- Definição dos campos de fechamento
- Validação de padrões fixos

### 6. **Integração (`integration.test.ts`)**
- Parsing completo de arquivo com múltiplos títulos
- Validação de estrutura do arquivo (240 caracteres por linha)
- Extração de todos os campos principais sem erros

### 7. **Integridade (`integrity.test.ts`)**
- Valida que não há sobreposição de posições
- Valida que tamanhos declarados batem com posições calculadas

## 🧪 Executar Testes

### Todos os testes do Bradesco CNAB 240:
```bash
npm test -- --testPathPattern="bradesco.*cnab240"
```

### Testes específicos por módulo:
```bash
# Apenas metadados
npm test -- cnab240/metadata.test.ts

# Apenas Header
npm test -- cnab240/header.test.ts

# Apenas Segmento P
npm test -- cnab240/segment-p.test.ts

# Apenas Segmento Q
npm test -- cnab240/segment-q.test.ts

# Apenas integração
npm test -- cnab240/integration.test.ts

# Apenas integridade
npm test -- cnab240/integrity.test.ts
```

## 📊 Filosofia dos Testes

### ✅ **O que os testes VALIDAM:**
- ✅ Posições corretas dos campos
- ✅ Tipos de dados corretos (num, alfa, data)
- ✅ Formatos adequados (DDMMAAAA, decimais)
- ✅ Extração correta dos valores
- ✅ Campos obrigatórios definidos
- ✅ Valores padrão (código do banco, tipos de registro)

### ❌ **O que os testes NÃO VALIDAM:**
- ❌ Regras de negócio (datas passadas, valores zero)
- ❌ Validação de CPF/CNPJ (algoritmo de dígito verificador)
- ❌ Lógica de protesto, multa, juros
- ❌ Formato de boleto

**Regras de negócio são responsabilidade dos validators, não dos schemas.**

## 🔧 Fixtures Usadas

Os testes usam fixtures reais (anonimizadas) localizadas em:
```
tests/fixtures/cnab240/bradesco/
├── remessa-multipla.txt     # Arquivo CNAB real
└── remessa-multipla.json    # Metadados esperados
```

## 📝 Adicionar Novos Testes

Para adicionar testes de um novo segmento (ex: Segmento R):

1. Crie `segment-r.test.ts`
2. Importe helpers de `./shared`
3. Siga o padrão dos testes existentes:
   - Seção "Definição dos campos"
   - Seção "Parsing de arquivo real"

```typescript
import { bradescoCnab240 } from '../../../../../src/schemas/banks/bradesco/cnab240'
import { extractLineFields } from '../../../../../src/parser/field-extractor'
import { readFixture } from './shared'

describe('Schema Bradesco CNAB 240 - Segmento R', () => {
  describe('Definição dos campos', () => {
    test('deve ter identificador do segmento "R" na posição 14', () => {
      const field = bradescoCnab240.segmentoR!.servico_segmento
      expect(field.padrao).toBe('R')
    })
  })

  describe('Parsing de arquivo real', () => {
    let lines: string[]
    beforeAll(() => lines = readFixture('remessa-multipla.txt'))
    
    test('deve parsear corretamente', () => {
      // seus testes aqui
    })
  })
})
```

## ⚙️ Manutenção

- Quando adicionar campos ao schema, adicione testes correspondentes
- Mantenha o padrão de 2 seções: "Definição" e "Parsing"
- Use fixtures reais sempre que possível
- Documente o propósito de cada teste
