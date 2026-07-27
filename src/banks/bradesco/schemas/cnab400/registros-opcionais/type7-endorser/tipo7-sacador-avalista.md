# Registro Tipo 7 — Dados do Beneficiário Final (Remessa, opcional)

> Fonte: manual oficial Bradesco, `4008-524-0121-layout-cobranca-versao-portugues.pdf` (revisado 27/07/2017), "Lay-out do Arquivo-Remessa - Registro de Transação-Tipo 7 — Dados do Sacador Avalista (opcional)" (p.14-15/57). Posições extraídas via `pdftotext`.
>
> **Nota sobre nomenclatura**: O manual de 2017 ainda usava o termo "Sacador Avalista", mas os manuais atualizados do Bradesco (2022), Banco do Brasil (2024) e Sicredi (2026) adotam "Beneficiário Final", conforme Circulares BACEN 3598, 3656 e 3956. Mantivemos o nome do campo no schema (`sacador_avalista`) para compatibilidade, mas as descrições foram atualizadas.

## O que é

Registro inteiro separado, opcional, que complementa o endereço do **beneficiário final** de um título — o campo `sacador_avalista` do detalhe tipo 1 (posição 335-394) só comporta o nome; este registro tipo 7 adiciona endereço, CEP e cidade/UF completos. O manual lista este registro na composição do arquivo-remessa como `Registro 7 - Pagador Avalista (opcional)` (nomenclatura antiga; equivale a "Beneficiário Final" na terminologia atual do BACEN).

## Regras importantes (manual)

- Deve acompanhar o registro de detalhe (tipo 1) do título ao qual se refere.
- `carteira`/`agencia`/`conta`/`nosso_numero` neste registro devem coincidir com os do tipo 1 correspondente (mesmo padrão de referência cruzada usado nos tipos 2 e 6).
- Não há indicação no manual de retorno deste registro no arquivo de resposta do banco.

## Campos

| Campo | Posição | Tipo | Tamanho | Decimais | Obrigatório | Padrão | Descrição |
| -- | -- | -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | 0 | true | `'7'` | Identificação do registro (dados do beneficiário final) |
| `endereco_sacador_avalista` | [2,46] | alfa | 45 | 0 | false | null | Rua, número e complemento do beneficiário final |
| `cep` | [47,51] | num | 5 | 0 | false | null | CEP do beneficiário final |
| `sufixo_cep` | [52,54] | num | 3 | 0 | false | null | Sufixo do CEP |
| `cidade` | [55,74] | alfa | 20 | 0 | false | null | Cidade do beneficiário final |
| `estado` | [75,76] | alfa | 2 | 0 | false | null | UF do beneficiário final |
| `reserva` | [77,366] | alfa | 290 | 0 | false | null | Filler/reserva |
| `carteira` | [367,369] | num | 3 | 0 | true | null | Nº da carteira — deve coincidir com o tipo 1 correspondente |
| `agencia` | [370,374] | num | 5 | 0 | true | null | Código da agência do beneficiário |
| `conta` | [375,381] | num | 7 | 0 | true | null | Número da conta corrente do beneficiário |
| `dac_conta` | [382,382] | alfa | 1 | 0 | true | null | Dígito da conta corrente |
| `nosso_numero` | [383,393] | num | 11 | 0 | true | null | Identificação do título no banco — deve coincidir com o tipo 1 correspondente |
| `dac_nosso_numero` | [394,394] | alfa | 1 | 0 | true | null | Dígito do nosso número |
| `numero_sequencial` | [395,400] | num | 6 | 0 | true | null | Sequencial do registro no arquivo |

## Nenhuma evidência real disponível

O fixture do projeto (`tests/fixtures/cnab400/bradesco/remessa-multipla.txt`) **não contém** nenhum registro tipo 7 — só tipos 0, 1, 2 e 9. `brcobranca` e `laravel-boleto` também não implementam este registro. Todas as posições acima vêm exclusivamente do manual oficial.
