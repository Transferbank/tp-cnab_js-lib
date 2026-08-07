# Campos Extras - Bradesco CNAB 240

Esta pasta contém campos extras que podem ser adicionados ao boleto Bradesco 240 além dos campos obrigatórios.

## Campos Disponíveis

### Carteira (`Bradesco240CarteiraField`)
- **Posição**: 38-40 (linha 0, Segmento P)
- **Tipo**: Numérico
- **Key**: `carteira`
- **Descrição**: Código da carteira (ex: 109)

## Como Usar

### Opção 1: Criar uma nova classe que estende CnabBoleto

```typescript
import { CnabBoleto } from '@/types/boleto/cnab-boleto'
import {
  Bradesco240NossoNumeroField,
  // ... outros campos obrigatórios
} from '@banks/bradesco/cnabFields/240fields/bradesco-240-fields'
import {
  Bradesco240CarteiraField,
} from '@banks/bradesco/cnabFields/240fields/extraFields/bradesco-240-extra-fields'

export class MeuBoletoBradesco240 extends CnabBoleto {
  protected get bankCode(): string {
    return BANK_CODES.BRADESCO
  }
  
  protected get lineLength(): number {
    return 240
  }
  
  // Campos obrigatórios
  protected readonly nossoNumeroField = new Bradesco240NossoNumeroField()
  // ... outros campos obrigatórios
  
  // Campos extras
  protected readonly extraFields = [
    new Bradesco240CarteiraField(),
  ]
}
```

### Opção 2: Adicionar campos extras ao boleto existente

```typescript
const boleto = new BoletoBradesco240(rawLines)

// Ler campo obrigatório
const nossoNumero = boleto.readField('nossoNumero')

// Ler campo extra individual (usando key ou description)
const carteira = boleto.readExtraField('carteira') // usando key
const carteiraAlt = boleto.readExtraField('Carteira') // usando description

// Ler todos os campos de uma vez
const data = boleto.read()
console.log(data.nossoNumero) // Campo obrigatório

// Acessar campos extras usando key (sintaxe de objeto)
console.log(data.extra.carteira) // '109'

// Ou usando description (sintaxe de chave string)
console.log(data.extra['Carteira']) // '109'
```

## Adicionar Novos Campos Extras

1. Crie um novo arquivo na pasta `extraFields/` seguindo o padrão:
   ```typescript
   import { CnabField } from '@/types/fields/cnab-field'
   import { <Validator> } from '@/types/fields/validators'
   import { <Parser> } from '@/types/fields/parsers'

   export class Bradesco240<NomeDoCampo>Field extends CnabField<<Tipo>> {
     protected readonly lineIndex = <índice da linha>
     protected readonly pos: [number, number] = [<início>, <fim>]
     protected readonly description = '<Descrição do campo>'
     protected readonly key = '<nomeEmCamelCase>' // opcional, usado como propriedade no data.extra
     protected readonly validator = new <Validator>()
     protected readonly parser = new <Parser>()
   }
   ```

2. Adicione o export em `bradesco-240-extra-fields.ts`:
   ```typescript
   export { Bradesco240<NomeDoCampo>Field } from './<nome-do-campo>-field'
   ```

3. Use na sua classe de boleto:
   ```typescript
   protected readonly extraFields = [
     new Bradesco240<NomeDoCampo>Field(),
   ]
   ```

4. Acesse o campo no resultado:
   ```typescript
   const data = boleto.read()
   // Se o campo tem 'key' definido:
   console.log(data.extra.carteira)
   // Ou usando a description:
   console.log(data.extra['Carteira'])
   ```

**Dica**: Se você definir a propriedade `key`, os campos extras podem ser acessados com sintaxe de objeto (ex: `data.extra.carteira`). Se não definir, apenas pela description (ex: `data.extra['Carteira']`).

## Notas sobre Segmentos

No CNAB 240, um boleto pode ter múltiplos segmentos (P, Q, R, S, etc.). Os campos extras devem especificar o `lineIndex` correto:
- `lineIndex = 0`: Segmento P (dados principais do título)
- `lineIndex = 1`: Segmento Q (dados do sacado)
- `lineIndex = 2`: Segmento R ou outros satélites opcionais

O campo `carteira` está no Segmento P, portanto usa `lineIndex = 0`.
