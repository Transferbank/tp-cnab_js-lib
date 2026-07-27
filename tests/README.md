# Estrutura de Testes

Esta pasta contém todos os testes da biblioteca tp-cnab-lib, organizados por módulos.

## Estrutura de Pastas

```
tests/
├── parser/              # Testes dos parsers CNAB
│   ├── field-extractor.test.ts      # Extração de campos das linhas
│   └── format-detector.test.ts      # Detecção de formato e banco
│
├── utils/               # Testes dos utilitários
│   ├── date-parser.test.ts          # Parsing e validação de datas
│   └── string-utils.test.ts         # Validação de CPF/CNPJ e strings
│
├── validators/          # Testes dos validadores
│   ├── cnab240-validator.test.ts    # Validação de arquivos CNAB 240
│   ├── cnab400-validator.test.ts    # Validação de arquivos CNAB 400
│   └── document-validator.test.ts   # Re-exports de validação de documentos
│
├── schemas/             # Testes dos schemas de banco
│   └── banks/
│       └── bradesco/
│           └── cnab240.test.ts      # Schema CNAB 240 do Bradesco
│
├── fixtures/            # Arquivos CNAB reais (anonimizados)
│   └── cnab240/
│       └── bradesco/
│           ├── remessa-simples.txt  # 1 título
│           ├── remessa-multipla.txt # 3 títulos
│           └── README.md
│
├── schemas.test.ts                  # Teste integrado de schemas
└── README.md                        # Este arquivo
```

## Executando os Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes de um arquivo específico
npm test -- field-extractor.test.ts

# Executar testes de uma pasta específica
npm test -- tests/parser

# Executar com cobertura
npm test -- --coverage
```

## Cobertura Atual

### ✅ Totalmente testados
- **parser/field-extractor** - Extração de campos de linhas CNAB
  - Extração de campos básicos (alfanuméricos, numéricos, datas)
  - Campos numéricos com decimais
  - Validação de campos obrigatórios
  - Validação de padrões fixos
  - Validação de formato numérico
  - Casos extremos

- **parser/format-detector** - Detecção de formato e banco
  - Detecção de CNAB 240 e 400
  - Extração de código de banco
  - Casos inválidos
  - Bancos conhecidos (BB, Santander, CEF, Bradesco, Itaú, Sicredi)

- **utils/date-parser** - Parsing e formatação de datas
  - Formatos DDMMAA e DDMMAAAA
  - Validação de datas no passado
  - Formatação brasileira

- **utils/string-utils** - Validação de documentos
  - Validação de CPF
  - Validação de CNPJ
  - Validação combinada CPF/CNPJ
  - Validação de documentos com padding

- **validators/cnab240-validator** - Validação de arquivos CNAB 240
  - Validação de estrutura (header, segmentos P/Q, trailer)
  - Validação de tamanho de linha (240 caracteres)
  - Validação de campos (valor, vencimento, documento)
  - Validação com schema do Santander
  - Múltiplos títulos (pares de Segmentos P + Q)
  - Fallback para posições fixas FEBRABAN (sem schema)
  - Detecção de erros: CPF/CNPJ inválido, nome muito curto, valor zero, data inválida/passada

- **validators/cnab400-validator** - Validação de arquivos CNAB 400
  - Validação básica com schema do Bradesco
  - Validação de múltiplos detalhes
  - Detecção de erros: CPF/CNPJ inválido, nome muito curto, valor zero, data inválida/passada
  - Checagem cruzada de quantidade de documentos no trailer (Santander)
  - Validação com múltiplos bancos (Bradesco 237, Santander 033)

- **validators/document-validator** - Re-exports de validação de documentos
  - Garantia de que todas as funções são exportadas corretamente
  - Testes de isValidCPF, isValidCNPJ, isValidCpfCnpj, validatePayerDocument

- **schemas/banks/bradesco/cnab240** - Schema CNAB 240 do Bradesco (NOVO!)
  - Metadados do banco (código 237, nome)
  - Estrutura completa dos schemas (Header, Segmento P, Segmento Q, Trailer)
  - Validação de posições de campos (banco, tipo registro, lote, etc.)
  - Validação de tipos de dados e formatos (datas, valores, CPF/CNPJ)
  - Parsing de arquivos reais (remessa simples e múltipla)
  - Extração de todos os campos (cedente, valores, vencimentos, pagadores)
  - Validação de integridade (sem sobreposição de posições, tamanhos corretos)
  - Testes com fixtures reais anonimizados

### ⏳ A fazer
- **schemas** - Testes de schemas para outros bancos (Santander, Sicredi, etc.)
- **integration** - Testes de integração end-to-end

## Convenções

### Nomenclatura
- Arquivos de teste: `*.test.ts`
- Um arquivo de teste por módulo testado
- Nome do arquivo de teste igual ao módulo: `foo-bar.ts` → `foo-bar.test.ts`

### Estrutura dos Testes
```typescript
describe('NomeDoMódulo', () => {
  describe('Grupo de funcionalidade', () => {
    test('deve fazer algo específico', () => {
      // Arrange - Preparar dados
      // Act - Executar ação
      // Assert - Verificar resultado
    })
  })
})
```

### Mensagens de Teste
- Use português para mensagens de teste
- Comece com "deve" para descrever o comportamento esperado
- Seja específico e descritivo

### Exemplos
```typescript
✅ 'deve extrair campos corretamente de uma linha válida'
✅ 'deve retornar null para array vazio'
✅ 'deve reportar erro quando campo obrigatório está vazio'

❌ 'teste 1'
❌ 'funciona'
❌ 'valida campo'
```

## Adicionando Novos Testes

1. **Identifique o módulo** que você quer testar
2. **Crie o arquivo** na pasta apropriada: `tests/<categoria>/<modulo>.test.ts`
3. **Importe o módulo** usando caminho relativo correto
4. **Organize em describes** agrupando funcionalidades relacionadas
5. **Escreva testes claros** seguindo o padrão Arrange-Act-Assert
6. **Verifique a cobertura** - busque pelo menos 80% de cobertura

## Exemplo de Novo Teste

```typescript
/**
 * Testes para novo-modulo
 */

import { minhaFuncao } from '../../src/caminho/novo-modulo'

describe('minhaFuncao', () => {
  describe('Casos válidos', () => {
    test('deve processar entrada válida', () => {
      // Arrange
      const entrada = 'valor teste'
      
      // Act
      const resultado = minhaFuncao(entrada)
      
      // Assert
      expect(resultado).toBe('esperado')
    })
  })

  describe('Casos inválidos', () => {
    test('deve retornar null para entrada vazia', () => {
      expect(minhaFuncao('')).toBeNull()
    })
  })
})
```

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Jest](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
