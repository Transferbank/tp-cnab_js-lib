# Registro Tipo 6 — Múltiplas Transferências / Cadastro e Autorização para Débito Automático (Remessa, opcional)

> **Fonte primária**: Manual oficial Bradesco, `bradesco_2022_layout_400P.pdf` (versão Abril/2022, revisado Março/2023), "Layout do Arquivo-Remessa - Registro de Transação-Tipo 6" (p.12/44).
> 
> **Nota histórica**: A primeira versão deste documento foi escrita por inferência a partir do manual de 2017 (`4008-524-0121-layout-cobranca-versao-portugues.pdf`, p.14/57), que não dava título explícito à seção e tratava as posições 29-394 como filler/reserva. O manual de 2022 revelou o título completo da seção e o conteúdo real das posições 29-64, aqui documentado.

## O que é

Registro inteiro separado, opcional, usado para duas finalidades distintas:

1. **Múltiplas Transferências**: transferir um título de uma carteira para outra dentro do Bradesco (ocorrência 23 no registro tipo 1)
2. **Cadastro e Autorização para Débito Automático**: autorizar débito automático em conta-corrente do pagador em instituições autorizadas pelo BACEN

## Regras importantes (manual)

- **Cadastro prévio obrigatório**: *"Para utilizar o serviço, o Beneficiário deve procurar a Agência e solicitar o cadastro no contrato de cobrança."* (manual 2017)
- **Ocorrência associada**: Para transferência entre carteiras, usar ocorrência **23** no registro tipo 1 (posição 109-110)
- **Conta sem dígito**: *"Para o registro Tipo 6, atentar que para a conta não existe o dígito"* — diferente dos tipos 2/3/7 que têm `dac_conta`
- **Nosso número**: Deve ser idêntico ao do registro tipo 1 correspondente
- **Instituições autorizadas**: Funcionalidade de débito automático disponível apenas para instituições autorizadas pelo BACEN

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'6'` | Identificação do registro (múltiplas transferências / débito automático) |
| `carteira` | [2,4] | num | 3 | 0 | true | null | Nº da carteira de destino |
| `agencia` | [5,9] | num | 5 | 0 | true | null | Código da agência do beneficiário |
| `conta` | [10,16] | num | 7 | 0 | true | null | Número da conta corrente — **sem dígito verificador** (nota do manual) |
| `nosso_numero` | [17,27] | num | 11 | 0 | true | null | Identificação do título no banco — deve ser idêntico ao do registro tipo 1 correspondente |
| `dac_nosso_numero` | [28,28] | alfa | 1 | 0 | false | null | Dígito do nosso número |
| `tipo_operacao` | [29,29] | num | 1 | 0 | false | null | Tipo de operação: `'1'` = Crédito, `'2'` = Arrendamento Mercantil, `'3'` = Outros |
| `utilizacao_cheque_especial` | [30,30] | alfa | 1 | 0 | false | null | Utilização do cheque especial: `'S'` = Sim, `'N'` = Não |
| `consulta_saldo_apos_vencimento` | [31,31] | alfa | 1 | 0 | false | null | Consulta saldo após o vencimento: `'S'` = Sim, `'N'` = Não |
| `codigo_identificacao_contrato` | [32,56] | alfa | 25 | 0 | false | null | Número código de identificação/contrato |
| `prazo_validade_contrato` | [57,64] | data | 8 | 0 | false | 'DDMMAAAA' | Prazo de validade do contrato (formato DD/MM/AAAA) ou `'99999999'` = indeterminado |
| `brancos` | [65,394] | alfa | 330 | 0 | false | null | Complemento de registro (filler) |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Nenhuma evidência real disponível

O fixture do projeto (`tests/fixtures/cnab400/bradesco/remessa-multipla.txt`) **não contém** nenhum registro tipo 6 — só tipos 0, 1, 2 e 9. `brcobranca` e `laravel-boleto` também não implementam este registro. Todas as posições acima vêm exclusivamente dos manuais oficiais do Bradesco.
