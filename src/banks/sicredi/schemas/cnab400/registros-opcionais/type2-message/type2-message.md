# Registro Tipo 2 — Mensagem (Remessa, opcional)

> Fonte: manual oficial Sicredi, `2026_03_12_manual_cnab_400_30.pdf` (v3.0, fev/2026), §8.3, p.31. Posições confirmadas por `laravel-boleto` (`Cnab/Remessa/Cnab400/Banco/Sicredi.php`, registro tipo `'2'` condicionado a `byte==1`).

## O que é

Registro opcional de texto livre para impressão de até 4 linhas de instrução (80 caracteres cada) no boleto. O manual é explícito: instruções de juros, multa, desconto, protesto automático e negativação **não precisam** ser cadastradas aqui — o sistema do Sicredi já imprime essas informações automaticamente a partir dos campos de negócio do detalhe (tipo 1). Este registro serve só para texto adicional livre.

## Regras importantes (manual)

- Opcional — só deve constar no arquivo quando houver alguma instrução de impressão adicional.
- O registro de cadastro do título (tipo 1) deve vir **antes** do registro mensagem correspondente.
- O beneficiário pode organizar o arquivo de duas formas: todos os detalhes seguidos de todas as mensagens, OU intercalado detalhe+mensagem por título. As duas ordens são válidas.
- Campo `numero_documento` (342-351) deve bater com o mesmo campo do detalhe (posições 111-120).

## Campos

| Campo | Posição | Tipo | Tamanho | Obrigatório | Descrição |
| -- | -- | -- | -- | -- | -- |
| `tipo_registro` | [1,1] | num | 1 | true | `'2'` |
| `brancos_1` | [2,12] | alfa | 11 | false | Complemento de registro |
| `nosso_numero` | [13,21] | num | 9 | false | Pode ficar em branco se impressão pelo Sicredi (gerado automaticamente) |
| `instrucao_linha_1` | [22,101] | alfa | 80 | false | 1ª linha de instrução de impressão |
| `instrucao_linha_2` | [102,181] | alfa | 80 | false | 2ª linha |
| `instrucao_linha_3` | [182,261] | alfa | 80 | false | 3ª linha |
| `instrucao_linha_4` | [262,341] | alfa | 80 | false | 4ª linha |
| `numero_documento` | [342,351] | alfa | 10 | false | "Seu número" — deve bater com posições 111-120 do detalhe |
| `brancos_2` | [352,394] | alfa | 43 | false | Complemento de registro |
| `numero_sequencial` | [395,400] | num | 6 | true | Sequencial do registro no arquivo |

## Confirmado por biblioteca de terceiros

`laravel-boleto` implementa uma versão simplificada deste registro (só emitido quando a propriedade `byte` do boleto é `1`) — as posições batem exatamente com o manual. A condição `byte==1` não é documentada no manual como regra de emissão deste registro especificamente; pode ser decisão de negócio específica da lib, não confirmada como regra geral do Sicredi.
