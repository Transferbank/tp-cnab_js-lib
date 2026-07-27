# Refatoração BankSchema - Registros Opcionais

## Status: Em Progresso

## O que foi feito:

### 1. ✅ Criado novo tipo `OptionalRecordSchema` em `src/types/bank-schema.ts`
- Define estrutura para registros opcionais com `identifier` e `schema`
- Documentado como funciona para CNAB 400 e CNAB 240

### 2. ✅ Modificado interface `BankSchema`
- **Removido**: `segmentoR`, `segmentoS`, `segmentoY01`, `segmentoY03`, `segmentoY04`, `segmentoY50`, `segmentoY53`
- **Adicionado**: `optionalRecords?: OptionalRecordSchema[]`
- **Mantido**: `segmentoP` e `segmentoQ` (obrigatórios, não são opcionais)

### 3. ✅ Atualizado schemas dos bancos CNAB 240
- **Bradesco**: `src/banks/bradesco/schemas/cnab240/index.ts`
  - Movido R, S, Y01, Y04, Y50 para `optionalRecords`
- **Santander**: `src/banks/santander/schemas/cnab240.ts`
  - Movido R, S, Y03, Y53 para `optionalRecords`
- **Sicredi**: `src/banks/sicredi/schemas/cnab240/index.ts`
  - Movido R, S, Y01, Y04 para `optionalRecords`

## O que falta fazer:

### 4. ⏳ Atualizar validador estrutural CNAB 240
Arquivo: `src/validators/cnab240-structure-validator.ts`

**Mudanças necessárias**:

1. Adicionar função helper para buscar registro opcional:
```typescript
function findOptionalRecord(
  bankSchema: BankSchema,
  identifier: string
): RecordSchema | undefined {
  return bankSchema.optionalRecords?.find(r => r.identifier === identifier)?.schema
}
```

2. Atualizar a função `identifyRecordKind()` para retornar o identifier em vez do nome do campo:
```typescript
// Mudar de:
type Cnab240RecordKind = 'segmentoR' | 'segmentoS' | 'segmentoY01' | ...

// Para:
type Cnab240RecordKind = 
  | 'headerArquivo'
  | 'headerLote'
  | 'trailerLote'
  | 'trailerArquivo'
  | 'segmentoP'
  | 'segmentoQ'
  | { kind: 'optional', identifier: string } // Novo formato para opcionais
```

3. Atualizar a máquina de estados para usar o novo formato:
```typescript
// No switch, trocar:
case 'segmentoR':
case 'segmentoS':
case 'segmentoY01':
// ...

// Por:
if (typeof recordKind === 'object' && recordKind.kind === 'optional') {
  // Verificar se o banco define esse opcional
  const optionalSchema = findOptionalRecord(bankSchema, recordKind.identifier)
  if (!optionalSchema) {
    errors.push({
      line: lineNumber,
      column: `Segmento ${recordKind.identifier}`,
      message: `Segmento ${recordKind.identifier} não está definido no schema do banco`,
    })
  }
  // Resto da lógica de validação...
}
```

### 5. ⏳ Atualizar validador estrutural CNAB 400  
Arquivo: `src/validators/cnab400-structure-validator.ts`

**IMPORTANTE**: Este é o maior benefício da refatoração! Atualmente este validador gera **falsos positivos** para registros opcionais válidos porque não há como declarálos no schema.

**Exemplo do problema atual**:
- Arquivo `tests/fixtures/cnab400/bancodobrasil/BANCOBRASIL_cnab_400.REM` tem 113 linhas tipo '5' (multa)
- Validador atual reporta erro "tipo de registro não reconhecido" para todas elas
- Schema define `BANCOBRASIL_CNAB400_TIPO5_MULTA` mas não há como plugar no `BankSchema`

**Mudanças necessárias**:

1. Adicionar mesmo helper `findOptionalRecord()`

2. No loop de validação, após validar header/detail/trailer, verificar registros opcionais:
```typescript
// Depois de checar header/detail/trailer:
else {
  // Tentar casar com registro opcional
  const optionalSchema = bankSchema.optionalRecords?.find(opt => {
    const typeChar = recordType // já extraído antes
    return opt.identifier === typeChar || opt.identifier.startsWith(`${typeChar}-`)
  })
  
  if (optionalSchema) {
    // Se tem sufixo composto (ex: '5-99'), validar segundo campo
    if (optionalSchema.identifier.includes('-')) {
      const [expectedType, expectedSuffix] = optionalSchema.identifier.split('-')
      // Extrair segundo campo da linha e comparar
      // ...
    }
    // Registro opcional válido reconhecido
  } else {
    // Tipo não reconhecido - manter erro atual
    errors.push({
      line: lineNumber,
      column: 'Tipo de registro',
      message: `Tipo de registro '${recordType}' não corresponde...`,
    })
  }
}
```

### 6. ⏳ Conectar registros opcionais CNAB 400 aos schemas dos bancos

Criar arquivos de índice para cada banco CNAB 400 (similar ao que já existe para CNAB 240):

**Banco do Brasil**: `src/banks/bancoDoBrasil/schemas/cnab400/index.ts`
```typescript
export const bancoDoBrasilCnab400: BankSchema = {
  // ... campos existentes ...
  optionalRecords: [
    { identifier: '5-07', schema: BANCOBRASIL_CNAB400_TIPO5_DESCONTOS },
    { identifier: '5-08', schema: BANCOBRASIL_CNAB400_TIPO5_AGENTE_NEGATIVADOR },
    { identifier: '5-99', schema: BANCOBRASIL_CNAB400_TIPO5_MULTA },
  ],
}
```

**Bradesco**: Similar, com tipo 2, tipo 6, tipo 7

**Itaú**: Similar, com tipo 2, 5, 6 (layouts variados)

**Santander**: Tipo 2/4/5/6/7 (mensagens variáveis)

**Sicredi**: Tipo 2, 5, 6, 7, 8

**Caixa**: Tipo 2, 3

**Sicoob**: (verificar se tem opcionais)

### 7. ⏳ Atualizar testes

**Testes dos schemas dos bancos**:
- `tests/schemas/banks/*/cnab240/integrity.test.ts` - atualizar para iterar sobre `optionalRecords`
- `tests/schemas/banks/*/cnab240/metadata.test.ts` - atualizar verificações de segmentos opcionais

**Testes dos validadores estruturais**:
- `tests/validators/cnab240-structure-validator.test.ts` - atualizar casos que criam schemas sintéticos
- `tests/validators/cnab400-structure-validator.test.ts` - adicionar testes para registros opcionais

### 8. ⏳ Atualizar validadores de negócio (se necessário)
- `src/validators/cnab240-validator.ts` - verificar se acessa campos removidos
- `src/validators/cnab400-validator.ts` - idem

## Exemplo completo de migração:

### Antes:
```typescript
export const bradescoCnab240: BankSchema = {
  bankCode: '237',
  bankName: 'Bradesco',
  segmentoP: SEGMENTO_P,
  segmentoQ: SEGMENTO_Q,
  segmentoR: SEGMENTO_R,      // ❌ Campo nomeado
  segmentoS: SEGMENTO_S,      // ❌ Campo nomeado
  segmentoY01: SEGMENTO_Y01,  // ❌ Campo nomeado
}
```

### Depois:
```typescript
export const bradescoCnab240: BankSchema = {
  bankCode: '237',
  bankName: 'Bradesco',
  segmentoP: SEGMENTO_P,      // ✅ Obrigatório, mantém nome
  segmentoQ: SEGMENTO_Q,      // ✅ Obrigatório, mantém nome
  optionalRecords: [          // ✅ Lista genérica
    { identifier: 'R', schema: SEGMENTO_R },
    { identifier: 'S', schema: SEGMENTO_S },
    { identifier: 'Y01', schema: SEGMENTO_Y01 },
  ],
}
```

## Benefícios desta refatoração:

1. **Extensibilidade**: Adicionar novo registro opcional não requer mudança na interface `BankSchema`
2. **CNAB 400**: Finalmente pode conectar os 30+ registros opcionais já implementados e testados
3. **Falsos positivos eliminados**: Validador estrutural CNAB 400 vai parar de reportar registros válidos como erro
4. **Consistência**: Mesmo padrão para CNAB 240 e CNAB 400
5. **Clareza**: Separação explícita entre registros obrigatórios (campos nomeados) e opcionais (lista)

## Comandos úteis para testar:

```bash
# Rodar apenas testes de schemas
npm test -- schemas/banks

# Rodar apenas testes de validadores estruturais
npm test -- validators/cnab.*-structure-validator

# Rodar teste de um banco específico
npm test -- bancoDoBrasil

# Rodar todos os testes
npm test
```

## Próximos passos imediatos:

1. ✅ Commit atual: "refactor(types): adicionar OptionalRecordSchema e migrar schemas CNAB 240"
2. ⏳ Atualizar validador estrutural CNAB 240
3. ⏳ Atualizar validador estrutural CNAB 400
4. ⏳ Conectar registros opcionais CNAB 400
5. ⏳ Atualizar testes
6. ⏳ Commit final e PR
