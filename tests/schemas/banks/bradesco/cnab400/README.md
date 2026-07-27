# Testes do Schema Bradesco CNAB 400

Testes modulares do schema CNAB 400 do Banco Bradesco (237).

## 📁 Estrutura

```
cnab400/
├── metadata.test.ts           # Metadados do schema
├── header.test.ts             # Header de arquivo
├── detail.test.ts             # Detalhe (registro tipo 1)
├── trailer.test.ts            # Trailer de arquivo
├── integrity.test.ts          # Integridade dos schemas
├── shared.ts                  # Helpers compartilhados
└── README.md                  # Este arquivo
```

## ⚠️ Foco dos Testes

**IMPORTANTE**: Estes testes focam APENAS no PARSING do schema:
- ✅ Posições corretas dos campos
- ✅ Tipos de dados corretos
- ✅ Valores padrão
- ✅ Campos obrigatórios
- ✅ Extração correta de valores
- ✅ Integridade (sem sobreposições)

**NÃO testam regras de negócio**:
- ❌ Datas passadas/futuras
- ❌ Valores zerados
- ❌ CPF/CNPJ válidos
- ❌ Cálculo de dígitos verificadores

## 📝 Arquivos de Teste

### metadata.test.ts
Valida metadados básicos do schema: código do banco, nome e presença de schemas obrigatórios.

---

### header.test.ts
Valida o Header de Arquivo (tipo registro 0).

---

### detail.test.ts
Valida o Detalhe (tipo registro 1).

Nomes de campo seguem a mesma convenção genérica usada pelos demais bancos
(`nome`, `logradouro`, `cep`, `sacado_codigo_inscricao`) porque
`src/validators/cnab400-business-validator.ts` lê esses nomes diretamente do schema —
usar um prefixo `sacado_*` diferente faria o validador cair no fallback de
offset fixo em vez de usar o schema.

**Campos testados (grupos)**:

1. **Identificação**: tipo_registro, agencia_debito, agencia_debito_dv, conta_corrente, conta_corrente_dv
2. **Identificação da Empresa** (21-37): zeros_1, carteira_codigo, agencia_cedente, conta_cedente, conta_cedente_dv
3. **Nosso Número**: numero_controle_empresa, codigo_banco, multa_indicador, multa_percentual, nosso_numero, nosso_numero_dv
4. **Dados do Título**: codigo_ocorrencia (109-110), numero_documento (111-120), vencimento, valor_titulo, especie_titulo, aceite, data_emissao
5. **Instruções e Valores**: instrucao_1, instrucao_2, juros_mora (161-173, campo único), desconto_data_limite (174-179), desconto_valor (180-192), iof_valor (193-205), abatimento_valor (206-218)
6. **Dados do Sacado**: sacado_codigo_inscricao, sacado_numero_inscricao, nome, logradouro, cep, sacador_avalista (335-394), numero_sequencial

---

### trailer.test.ts
Valida o Trailer de Arquivo (tipo registro 9).

**Campos testados**: tipo_registro, brancos, numero_sequencial

---

### integrity.test.ts
Valida a integridade dos schemas: ausência de sobreposições e consistência de tamanhos.

**Validações**:
- Sem sobreposição de posições em cada schema
- Tamanho declarado = tamanho calculado das posições

## 🚀 Executar os Testes

```bash
# Todos os testes do CNAB 400
npm test -- cnab400

# Apenas Bradesco CNAB 400
npm test -- bradesco/cnab400

# Teste específico
npm test -- header.test.ts
```

## 📚 Fixtures Utilizadas

Os testes usam fixtures do diretório:
```
tests/fixtures/cnab400/bradesco/
└── remessa-multipla.txt
```

Metadados das fixtures são carregados via `fixture-metadata.json`.

## 🔗 Schemas Testados

```typescript
import {
  BRADESCO_CNAB400_HEADER_REMESSA,
  BRADESCO_CNAB400_DETAIL,
  BRADESCO_CNAB400_TRAILER,
} from 'src/schemas/banks/bradesco/cnab400'
```

## ⚠️ Importante

**Arquivos de retorno NÃO são do interesse do projeto** - o foco são arquivos de **remessa** apenas. Não há `detail` de retorno; apenas o header de retorno (`BRADESCO_CNAB400_HEADER_RETORNO`) segue disponível para uso direto.
