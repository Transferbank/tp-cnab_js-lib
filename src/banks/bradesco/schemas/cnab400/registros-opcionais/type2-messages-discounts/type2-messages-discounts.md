# Registro Tipo 2 — Mensagem / Descontos Adicionais (Remessa, opcional)

> Fonte: manual oficial Bradesco, `4008-524-0121-layout-cobranca-versao-portugues.pdf` (revisado 27/07/2017), "Lay-out do Arquivo-Remessa - Registro de Transação-Tipo 2" (p.11-12/57). Posições extraídas via `pdftotext` e conferidas byte a byte contra `brcobranca` (`remessa/cnab400/bradesco.rb`, método `monta_descontos_adicionais`) — as duas fontes concordam em todas as posições.

## O que é

Registro inteiro separado, opcional, que serve duas finalidades independentes no mesmo layout:

1. Até **4 mensagens livres de 80 caracteres** cada, impressas no boleto (posições 2-321) — complementam ou substituem as 2 instruções de 2 posições já disponíveis no detalhe tipo 1.
2. **2 descontos adicionais** (2º e 3º desconto), além do desconto já disponível no registro de detalhe tipo 1, cuja concessão "permanece inalterada" segundo o manual (Nota 2).

O manual oficial lista este registro na composição do arquivo-remessa como `Registro 2 - Mensagem (opcional)`.

## Regras importantes (manual)

- **Nota 1**: para que o sistema considere uma linha por mensagem, é preciso preencher no mínimo 41 caracteres dentro de cada intervalo de 80 posições (ex.: posições 002-081 devem ser preenchidas até a posição 041 para contar como uma linha).
- **Nota 2**: este layout tipo 2 foi implementado especificamente para permitir aos clientes beneficiários conceder **mais dois novos descontos** (2º e 3º), informáveis nas posições 322-359. O desconto disponível no registro de detalhe tipo 1 continua funcionando normalmente e não é afetado por este registro.
- Não há evidência no manual de limite de quantidade de registros tipo 2 por título (ao contrário do tipo 4 do Itaú, que permite até 3 por título) — o layout aqui é de **um único registro por título**, imediatamente após o detalhe tipo 1 correspondente.

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'2'` | Identificação do registro (mensagem/descontos adicionais) |
| `mensagem_1` | [2,81] | alfa | 80 | 0 | false | null | 1ª mensagem livre impressa no boleto (ver Nota 1) |
| `mensagem_2` | [82,161] | alfa | 80 | 0 | false | null | 2ª mensagem livre (ver Nota 1) |
| `mensagem_3` | [162,241] | alfa | 80 | 0 | false | null | 3ª mensagem livre (ver Nota 1) |
| `mensagem_4` | [242,321] | alfa | 80 | 0 | false | null | 4ª mensagem livre (ver Nota 1) |
| `data_limite_desconto_2` | [322,327] | data (DDMMAA) | 6 | 0 | false | null | Data limite para concessão do 2º desconto (Nota 2) |
| `valor_desconto_2` | [328,340] | num | 13 | 2 | false | null | Valor do 2º desconto |
| `data_limite_desconto_3` | [341,346] | data (DDMMAA) | 6 | 0 | false | null | Data limite para concessão do 3º desconto (Nota 2) |
| `valor_desconto_3` | [347,359] | num | 13 | 2 | false | null | Valor do 3º desconto |
| `reserva` | [360,366] | alfa | 7 | 0 | false | null | Reserva/filler, sem uso definido pelo manual |
| `carteira` | [367,369] | num | 3 | 0 | true | null | Nº da carteira do beneficiário |
| `agencia` | [370,374] | num | 5 | 0 | true | null | Código da agência do beneficiário |
| `conta` | [375,381] | num | 7 | 0 | true | null | Número da conta corrente do beneficiário |
| `dac_conta` | [382,382] | alfa | 1 | 0 | true | null | Dígito da conta corrente (DAC C/C) |
| `nosso_numero` | [383,393] | num | 11 | 0 | true | null | Identificação do título no banco — deve coincidir com o do registro tipo 1 correspondente |
| `dac_nosso_numero` | [394,394] | alfa | 1 | 0 | true | null | Dígito do nosso número |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Evidência real (fixture do projeto)

Confirmado no fixture `tests/fixtures/cnab400/bradesco/remessa-multipla.txt`: **37 registros tipo 2**, um para cada um dos 37 detalhes (tipo 1) do arquivo — mesmo padrão 1:1 observado no tipo 2 (multa) do Itaú. Exemplo real (linha 3 do fixture):

```
2APOS 5 DIAS DE VENCIMENTO PROTESTAR!                                                                                                                                                                                                                                                                                            00000000000000000000000000000000000000       009000690626370409100010629P000003
```

`mensagem_1` = `"APOS 5 DIAS DE VENCIMENTO PROTESTAR!"` (mais de 41 caracteres preenchidos, conforme Nota 1); os campos de 2º/3º desconto aparecem zerados (não utilizados neste arquivo); `carteira`/`agencia`/`conta`/`nosso_numero` no final da linha reproduzem os mesmos dados do bloco de identificação da empresa/título do registro tipo 1 correspondente.
