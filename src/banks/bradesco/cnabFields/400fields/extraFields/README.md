# Campos Extras - Bradesco CNAB 400

Esta pasta contém campos extras que podem ser adicionados ao boleto Bradesco 400 além dos 11 campos obrigatórios.

## Campos Disponíveis

### Código de Ocorrência (`Bradesco400CodigoOcorrenciaField`)
- **Posição**: 109-110 (linha 0)
- **Tipo**: Numérico
- **Key**: `codigoOcorrencia`
- **Descrição**: Código de ocorrência (01=Entrada, 02=Pedido de baixa, 04=Concessão de abatimento, 06=Alteração de vencimento, etc.)

### Código da Carteira (`Bradesco400CarteiraCodigoField`)
- **Posição**: 22-24 (linha 0)
- **Tipo**: Numérico
- **Key**: `carteiraCodigo`
- **Descrição**: Código da carteira (ex: 109)

## Como Usar

### Opção 1: Criar uma nova classe que estende BoletoBradesco400

```typescript
import { CnabBoleto400 } from '@/types/boleto/cnab-boleto-400'
import {
  Bradesco400NossoNumeroField,
  // ... outros campos obrigatórios
} from '@banks/bradesco/cnabFields/bradesco-400-fields'
import {
  Bradesco400CodigoOcorrenciaField,
  Bradesco400CarteiraCodigoField,
} from '@banks/bradesco/cnabFields/400fields/extraFields/bradesco-400-extra-fields'

export class MeuBoletoBradesco extends CnabBoleto400 {
  // Campos obrigatórios
  protected readonly nossoNumeroField = new Bradesco400NossoNumeroField()
  // ... outros 10 campos obrigatórios
  
  // Campos extras
  protected readonly extraFields = [
    new Bradesco400CodigoOcorrenciaField(),
    new Bradesco400CarteiraCodigoField(),
  ]
}
```

### Opção 2: Usar a classe de exemplo

```typescript
import { BoletoBradesco400ComExtras } from '@banks/bradesco/boletos/boleto-bradesco-400-com-extras.example'

const boleto = new BoletoBradesco400ComExtras(rawContent)

// Ler campo obrigatório
const nossoNumero = boleto.readField('nossoNumero')

// Ler campo extra individual (usando key ou description)
const codigoOcorrencia = boleto.readExtraField('codigoOcorrencia') // usando key
const carteiraCodigo = boleto.readExtraField('Código da Carteira') // usando description

// Ler todos os campos de uma vez
const data = boleto.read()
console.log(data.nossoNumero) // Campo obrigatório

// Acessar campos extras usando key (sintaxe de objeto)
console.log(data.extra.codigoOcorrencia) // '01'
console.log(data.extra.carteiraCodigo) // '009'

// Ou usando description (sintaxe de chave string)
console.log(data.extra['Código de Ocorrência']) // '01'
console.log(data.extra['Código da Carteira']) // '009'
```

## Adicionar Novos Campos Extras

1. Crie um novo arquivo na pasta `extraFields/` seguindo o padrão:
   ```typescript
   import { CnabField } from '@/types/fields/cnab-field'
   import { <Validator> } from '@/types/fields/validators'
   import { <Parser> } from '@/types/fields/parsers'

   export class Bradesco400<NomeDoCampo>Field extends CnabField<<Tipo>> {
     protected readonly lineIndex = <índice da linha>
     protected readonly pos: [number, number] = [<início>, <fim>]
     protected readonly description = '<Descrição do campo>'
     protected readonly key = '<nomeEmCamelCase>' // opcional, usado como propriedade no data.extra
     protected readonly validator = new <Validator>()
     protected readonly parser = new <Parser>()
   }
   ```

2. Adicione o export em `bradesco-400-extra-fields.ts`:
   ```typescript
   export { Bradesco400<NomeDoCampo>Field } from './<nome-do-campo>-field'
   ```

3. Use na sua classe de boleto:
   ```typescript
   protected readonly extraFields = [
     new Bradesco400<NomoDoCampo>Field(),
   ]
   ```

4. Acesse o campo no resultado:
   ```typescript
   const data = boleto.read()
   // Se o campo tem 'key' definido:
   console.log(data.extra.codigoOcorrencia)
   // Ou usando a description:
   console.log(data.extra['Código de Ocorrência'])
   ```

**Dica**: Se você definir a propriedade `key`, os campos extras podem ser acessados com sintaxe de objeto (ex: `data.extra.codigoOcorrencia`). Se não definir, apenas pela description (ex: `data.extra['Código de Ocorrência']`).
