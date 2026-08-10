# Guia de Implementação — Adicionar um Banco

## Estrutura Requerida

Para adicionar suporte a um novo banco, implemente:

1. **Campos** (`cnabFields/{240,400}fields/`)
2. **Boleto** (`boletos/boleto-<banco>-{240,400}.ts`)
3. **Arquivo** (`files/cnab-file-<banco>-{240,400}.ts`)
4. **Registro** (`src/registry/cnab-registry.ts`)

## Passo 1: Criar Campos

### CNAB 400

```
src/banks/<banco>/cnabFields/400fields/
├── nosso-numero-field.ts
├── numero-documento-field.ts
├── vencimento-field.ts
├── valor-field.ts
├── data-emissao-field.ts
├── desconto-valor-field.ts
├── abatimento-valor-field.ts
├── sacado-documento-field.ts
├── sacado-nome-field.ts
├── sacado-logradouro-field.ts
├── sacado-cep-field.ts
├── <banco>-400-fields.ts  (re-exports)
└── extraFields/           (campos extras específicos do banco)
```

Exemplo de campo:

```typescript
import { CnabField } from '@/types/fields/cnab-field'
import { NumericValidator } from '@/types/fields/validators'
import { TrimParser } from '@/types/fields/parsers'

export class MeuBanco400NossoNumeroField extends CnabField<string> {
  constructor() {
    super({
      name: 'Nosso Número',
      pos: [63, 73],       // posições 1-indexed do layout
      lineIndex: 0,        // linha 0-indexed no boleto
      validator: new NumericValidator(),
      parser: new TrimParser()
    })
  }
}
```

### CNAB 240

```
src/banks/<banco>/cnabFields/240fields/
├── segmentoP/             (campos do segmento P)
├── segmentoQ/             (campos do segmento Q)
├── extraFields/           (campos extras específicos do banco)
└── <banco>-240-fields.ts  (re-exports)
```

## Passo 2: Implementar CnabBoleto

### Para CNAB 400

```typescript
import { CnabBoleto400 } from '@/types/boleto/cnab-boleto-400'
import { BANK_CODES } from '@/types/bank/bank-codes'
import {
  MeuBanco400NossoNumeroField,
  // ... outros campos
} from '@/banks/meubanco/cnabFields/400fields/meubanco-400-fields'

export class BoletoMeuBanco400 extends CnabBoleto400 {
  protected get bankCode(): string {
    return BANK_CODES.MEU_BANCO
  }

  // Campos compartilhados (lazy initialization pattern)
  private static readonly NOSSO_NUMERO_FIELD = new MeuBanco400NossoNumeroField()
  protected get nossoNumeroField() { return BoletoMeuBanco400.NOSSO_NUMERO_FIELD }
  
  // ... repetir para todos os 11 campos obrigatórios

  // Campos extras opcionais
  private static readonly EXTRA_FIELDS = [
    new MeuBancoExtraField1(),
    new MeuBancoExtraField2(),
  ]
  protected get extraFields() { return BoletoMeuBanco400.EXTRA_FIELDS }
}
```

### Para CNAB 240

```typescript
import { CnabBoleto240 } from '@/types/boleto/cnab-boleto-240'
import { BANK_CODES } from '@/types/bank/bank-codes'

export class BoletoMeuBanco240 extends CnabBoleto240 {
  protected get bankCode(): string {
    return BANK_CODES.MEU_BANCO
  }

  // Implementar mesma lógica de campos compartilhados
}
```

**Nota**: Use o padrão de campos estáticos para evitar criar novas instâncias de campo a cada boleto.

## Passo 3: Implementar CnabFile

### Para CNAB 400

```typescript
import { CnabFile400 } from '@/types/file/cnab400/cnab-file-400'
import { BoletoMeuBanco400 } from '@/banks/meubanco/boletos/boleto-meubanco-400'
import { BANK_CODES } from '@/types/bank/bank-codes'

export class CnabFileMeuBanco400 extends CnabFile400<BoletoMeuBanco400> {
  protected get bankCode(): string {
    return BANK_CODES.MEU_BANCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoMeuBanco400 {
    return BoletoMeuBanco400
  }

  // Opcional: validar campos literais fixos específicos do banco
  protected validateHeader(): void {
    super.validateHeader()  // valida tamanho e tipo de registro
    
    const header = this.rawLines[0]
    this.validateLiteral(header, 79, 94, 'MEU BANCO', 'nome do banco', 0)
    // ... outras validações de literais
  }

  protected validateTrailer(): void {
    super.validateTrailer()  // valida tamanho e tipo de registro
    
    const trailerIndex = this.rawLines.length - 1
    const trailer = this.rawLines[trailerIndex]
    
    // Exemplo: validar sequencial bate com total de linhas
    const sequencial = parseInt(trailer.substring(394, 400), 10)
    if (sequencial !== this.rawLines.length) {
      this.throwFileError(
        `trailer: sequencial (${sequencial}) não bate com total de linhas (${this.rawLines.length})`,
        trailerIndex
      )
    }
  }
}
```

### Para CNAB 240

```typescript
import { CnabFile240 } from '@/types/file/cnab240/cnab-file-240'
import { BoletoMeuBanco240 } from '@/banks/meubanco/boletos/boleto-meubanco-240'

export class CnabFileMeuBanco240 extends CnabFile240<BoletoMeuBanco240> {
  protected get bankCode(): string {
    return BANK_CODES.MEU_BANCO
  }

  protected get BoletoClass(): new (lines: string[]) => BoletoMeuBanco240 {
    return BoletoMeuBanco240
  }

  // Opcional: validar literais fixos
  protected validateHeader(): void {
    super.validateHeader()
    
    const header = this.rawLines[0]
    this.validateLiteral(header, 0, 3, '999', 'código do banco', 0)
    this.validateLiteral(header, 3, 7, '0000', 'controle de lote (header)', 0)
    // ... outros literais específicos
  }
}
```

**Método helper `validateLiteral()`:**

Disponível na classe base `CnabFile`, use para validar campos literais fixos:

```typescript
protected validateLiteral(
  line: string,
  start: number,      // posição inicial (0-indexed)
  end: number,        // posição final (0-indexed, exclusiva)
  expected: string,   // valor esperado
  label: string,      // descrição do campo para mensagem de erro
  lineNumber?: number // número da linha para contexto no erro
): void
```

## Passo 4: Registrar no Registry

Em `src/types/bank/bank-codes.ts`:

```typescript
export const BANK_CODES = {
  // ... bancos existentes
  MEU_BANCO: '999',
} as const
```

Em `src/registry/cnab-registry.ts`:

```typescript
import { CnabFileMeuBanco400 } from '@/banks/meubanco/files/cnab-file-meubanco-400'
import { CnabFileMeuBanco240 } from '@/banks/meubanco/files/cnab-file-meubanco-240'

// Adicionar nos mapas correspondentes
const CNAB400_BANKS: Record<string, CnabFileClass> = {
  // ... bancos existentes
  [BANK_CODES.MEU_BANCO]: CnabFileMeuBanco400,
}

const CNAB240_BANKS: Record<string, CnabFileClass> = {
  // ... bancos existentes
  [BANK_CODES.MEU_BANCO]: CnabFileMeuBanco240,
}
```

## Validações de Estrutura

Validações estruturais específicas do banco devem ser implementadas em `validateStructure()` da subclasse de `CnabBoleto`:

```typescript
export class BoletoMeuBanco400 extends CnabBoleto400 {
  protected validateStructure(rawContent: string[]): void {
    super.validateStructure(rawContent)  // valida o básico
    
    // Validações específicas do banco
    const firstLine = rawContent[0]
    const tipoRegistro = firstLine[0]
    
    if (tipoRegistro !== '1') {
      this.throwStructureError(`primeira linha deve ser tipo '1', encontrado '${tipoRegistro}'`, 0)
    }
  }
}
```

## Validadores e Parsers Disponíveis

### Validators

- `NumericValidator` - apenas dígitos
- `StringValidator` - não vazio após trim
- `AlphanumericValidator` - letras e números
- `AlphanumericExtendedValidator` - alfanumérico + `-`, `/`, `.`
- `DateDDMMAAValidator` / `DateDDMMAAAAValidator` - datas
- `MoneyValidator` - valores monetários
- `DocumentValidator` - CPF/CNPJ (valida dígito verificador)
- `OptionalValidator` - wrapper para tornar opcional
- `CustomValidator` - função customizada

### Parsers

- `TrimParser` - remove espaços
- `MoneyParser` - converte para number (divide por 100)
- `DateDDMMAAParser` / `DateDDMMAAAAParser` - converte para Date
- `DocumentParser` - formata CPF/CNPJ (sempre retorna 11 ou 14 dígitos com padding correto)

**Nota sobre DocumentParser:** Corrige automaticamente CPF/CNPJ que começam com zero. Por exemplo, `000001234567890` → `01234567890` (11 dígitos), não `1234567890` (10 dígitos incorretos).

## Testes

Estrutura de testes:

```
src/banks/<banco>/
├── boletos/
│   ├── boleto-<banco>-400.test.ts
│   └── boleto-<banco>-240.test.ts
├── files/
│   ├── cnab-file-<banco>-400.test.ts
│   └── cnab-file-<banco>-240.test.ts
└── docs/
    ├── cnab400/<banco>_cnab_400.txt
    └── cnab240/<banco>_cnab_240.txt
```

### Testes de Boleto

```typescript
import { BoletoMeuBanco400 } from './boleto-meubanco-400'

describe('BoletoMeuBanco400', () => {
  test('lê fixture real', () => {
    const lines = loadFixture() // helper para ler arquivo
    const boleto = new BoletoMeuBanco400(lines.slice(1, 3))
    const result = boleto.read()
    
    expect(result.errors).toHaveLength(0)
    expect(result.data.nossoNumero).toBe('12345678901')
    expect(result.data.valor).toBe(100.50)
  })
})
```

### Testes de Arquivo (CnabFile)

```typescript
import { CnabFileMeuBanco400 } from './cnab-file-meubanco-400'

describe('CnabFileMeuBanco400', () => {
  describe('validação de literais do header', () => {
    test('rejeita nome do banco inválido', () => {
      const header = createCorruptedHeader(79, 94, 'OUTRO BANCO')
      const trailer = createValidTrailer(2)
      
      expect(() => {
        new CnabFileMeuBanco400([header, trailer])
      }).toThrow("campo 'nome do banco' deve ser 'MEU BANCO', encontrado 'OUTRO BANCO'")
    })
  })
  
  describe('validação de integridade do trailer', () => {
    test('rejeita sequencial incorreto', () => {
      const header = createValidHeader()
      const trailer = createTrailerWithSequencial(999)
      
      expect(() => {
        new CnabFileMeuBanco400([header, trailer])
      }).toThrow('sequencial (999) não bate com total de linhas (2)')
    })
  })
})
```

## Checklist

- [ ] Obter layout oficial do banco (manual técnico CNAB)
- [ ] Criar campos em `cnabFields/{240,400}fields/`
- [ ] Implementar `CnabBoleto` subclass
- [ ] Implementar `CnabFile` subclass
- [ ] Adicionar validações de literais fixos em `validateHeader()` e `validateTrailer()`
- [ ] Adicionar código em `BANK_CODES`
- [ ] Registrar em `cnab-registry.ts`
- [ ] Adicionar fixture real em `docs/`
- [ ] Escrever testes de boleto
- [ ] Escrever testes de validação de literais (header/trailer)
- [ ] Validar com arquivo real do banco

## Boas Práticas

### Validações de Literais Fixos

Sempre valide campos literais fixos do layout em `validateHeader()` e `validateTrailer()`:

```typescript
protected validateHeader(): void {
  super.validateHeader()
  
  const header = this.rawLines[0]
  // Use validateLiteral() para cada campo fixo
  this.validateLiteral(header, 1, 2, '1', 'tipo de arquivo', 0)
  this.validateLiteral(header, 2, 9, 'REMESSA', 'literal remessa', 0)
  // ...
}
```

**Por quê?** Detecta arquivos corrompidos ou de outros bancos antes do processamento.

### Padding em DocumentParser

O `DocumentParser` sempre retorna CPF (11 dígitos) ou CNPJ (14 dígitos):

- `000001234567890` → `01234567890` (preserva zero inicial)
- `20000000997330` → `20000000997330` (sem zero inicial, não precisa padding)
- `000060000001994627` → `60000001994627` (CNPJ, 14 dígitos)

Não é necessário adicionar lógica extra de padding nos campos.

### Campos Compartilhados (Otimização)

Use campos estáticos para evitar criar instâncias duplicadas:

```typescript
export class BoletoMeuBanco400 extends CnabBoleto400 {
  // ✅ Correto: campo compartilhado entre todas as instâncias
  private static readonly NOSSO_NUMERO_FIELD = new MeuBanco400NossoNumeroField()
  protected get nossoNumeroField() { return BoletoMeuBanco400.NOSSO_NUMERO_FIELD }
  
  // ❌ Errado: cria nova instância a cada boleto
  // protected get nossoNumeroField() { return new MeuBanco400NossoNumeroField() }
}
```

## Referências

- Layout oficial FEBRABAN CNAB 240/400
- Manual técnico do banco específico
- Arquivos de exemplo reais (sempre validar com arquivo real, layouts teóricos divergem)
