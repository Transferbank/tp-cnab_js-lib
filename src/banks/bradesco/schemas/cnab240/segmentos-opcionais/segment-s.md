# Bradesco CNAB 240 — Segmento S (rascunho para implementação futura)

> **Este arquivo é só documentação/preparação — não é código.** Ele reúne os campos e posições do Segmento S extraídos diretamente do manual oficial do Bradesco, para servir de base quando o `segment-s.ts` for implementado. Nenhuma das libs analisadas (`pycnab240`, `laravel-boleto`, `brcobranca`, `cnab_yaml`, `nodejs-cnab`) implementa este segmento para o Bradesco — ver [comparativo-cnab240-bradesco.md](../../../../docs/comparativos/bradesco/comparativo-cnab240-bradesco.md) e a conversa que originou esta análise.

## O que é

Segmento S (pos 8 = `'3'`, pos 14 = `'S'`) — **opcional, só de remessa** (não existe em retorno). Carrega **mensagens personalizadas para impressão no boleto**: uma mensagem livre de até 140 caracteres, ou até 5 blocos de "Informação" de 40 caracteres, dependendo do valor de "Tipo de Impressão". Não carrega nenhum dado financeiro, de vencimento ou de identificação do título — é puramente instrucional/cosmético.

**Fonte do layout**: manual oficial Bradesco — *"Padrão FEBRABAN 240 Posições V6.0"* (Manual de Procedimentos Nº 4008.524.0339, versão 02), página 16/46 do PDF (`docs/Bradesco/4008-524-0339-02-mp-operacionais-troca-arquivos-240-posicoes.pdf`, trazido pelo `brcobranca`).

## Estrutura

Os primeiros 7 campos (posições 1-17) são idênticos ao padrão já usado em `segment-p.ts`, `segment-q.ts` e `segment-r.ts` deste mesmo schema. A partir da posição 18, o layout **se ramifica em duas variantes**, de acordo com o valor do campo `tipo_impressao` (posição 18):

- **Variante A** — `tipo_impressao` = `1` ou `2`: uma única mensagem de texto livre (até 140 caracteres), com controle de linha e fonte de impressão.
- **Variante B** — `tipo_impressao` = `3`: cinco mensagens fixas de 40 caracteres cada (`Informação 5` a `Informação 9`).

As duas variantes **ocupam a mesma faixa de bytes (18-240)**, mas com layouts internos diferentes — são mutuamente exclusivas dentro de uma mesma linha de Segmento S.

## Campos comuns (posições 1-17)

```ts
controle_banco: {
  pos: [1, 3],
  tipo: 'num',
  tamanho: 3,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: '237',
  descricao: 'Código FEBRABAN do Bradesco',
},
controle_lote: {
  pos: [4, 7],
  tipo: 'num',
  tamanho: 4,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Lote de serviço',
},
controle_registro: {
  pos: [8, 8],
  tipo: 'num',
  tamanho: 1,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: '3',
  descricao: 'Tipo: 3=Detalhe',
},
servico_numero_registro: {
  pos: [9, 13],
  tipo: 'num',
  tamanho: 5,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Número sequencial do registro no lote',
},
servico_segmento: {
  pos: [14, 14],
  tipo: 'alfa',
  tamanho: 1,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: 'S',
  descricao: 'Segmento S = mensagem para impressão no boleto',
},
cnab_exclusivo_1: {
  pos: [15, 15],
  tipo: 'alfa',
  tamanho: 1,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: '',
  descricao: 'Uso exclusivo FEBRABAN/CNAB',
},
servico_codigo_movimento: {
  pos: [16, 17],
  tipo: 'num',
  tamanho: 2,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Código de movimento da remessa',
},
```

## Campo de ramificação (posição 18)

```ts
tipo_impressao: {
  pos: [18, 18],
  tipo: 'num',
  tamanho: 1,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Identificação da impressão: 1 ou 2=mensagem livre (variante A), 3=blocos de informação fixos (variante B)',
},
```

## Variante A — Tipo de Impressão 1 ou 2 (mensagem livre)

| Campo (posição 19-240) | Pos | Tamanho | Descrição |
| -- | -- | -- | -- |
| `numero_linha` | 19-20 | 2 | Número da linha do boleto onde a mensagem deve ser impressa |
| `mensagem` | 21-160 | 140 | Texto livre a ser impresso |
| `tipo_fonte` | 161-162 | 2 | Tipo do caractere/fonte de impressão |
| `cnab_exclusivo_2` | 163-240 | 78 | Uso exclusivo FEBRABAN/CNAB (brancos) |

```ts
numero_linha: {
  pos: [19, 20],
  tipo: 'num',
  tamanho: 2,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Número da linha a ser impressa',
},
mensagem: {
  pos: [21, 160],
  tipo: 'alfa',
  tamanho: 140,
  decimais: 0,
  obrigatorio: true,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem a ser impressa no boleto',
},
tipo_fonte: {
  pos: [161, 162],
  tipo: 'num',
  tamanho: 2,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Tipo do caractere a ser impresso',
},
cnab_exclusivo_2: {
  pos: [163, 240],
  tipo: 'alfa',
  tamanho: 78,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: '',
  descricao: 'Uso exclusivo FEBRABAN/CNAB',
},
```

## Variante B — Tipo de Impressão 3 (blocos de informação fixos)

| Campo (posição 19-240) | Pos | Tamanho | Descrição |
| -- | -- | -- | -- |
| `informacao_5` | 19-58 | 40 | Mensagem 5 |
| `informacao_6` | 59-98 | 40 | Mensagem 6 |
| `informacao_7` | 99-138 | 40 | Mensagem 7 |
| `informacao_8` | 139-178 | 40 | Mensagem 8 |
| `informacao_9` | 179-218 | 40 | Mensagem 9 |
| `cnab_exclusivo_2` | 219-240 | 22 | Uso exclusivo FEBRABAN/CNAB (brancos) |

```ts
informacao_5: {
  pos: [19, 58],
  tipo: 'alfa',
  tamanho: 40,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem 5',
},
informacao_6: {
  pos: [59, 98],
  tipo: 'alfa',
  tamanho: 40,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem 6',
},
informacao_7: {
  pos: [99, 138],
  tipo: 'alfa',
  tamanho: 40,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem 7',
},
informacao_8: {
  pos: [139, 178],
  tipo: 'alfa',
  tamanho: 40,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem 8',
},
informacao_9: {
  pos: [179, 218],
  tipo: 'alfa',
  tamanho: 40,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: null,
  descricao: 'Mensagem 9',
},
cnab_exclusivo_2: {
  pos: [219, 240],
  tipo: 'alfa',
  tamanho: 22,
  decimais: 0,
  obrigatorio: false,
  formatoData: null,
  padrao: '',
  descricao: 'Uso exclusivo FEBRABAN/CNAB',
},
```

## Observações para quando for implementar

- Não há dado real de negócio aqui (valor, vencimento, identificação) — é seguro tratar este segmento como **opcional** e pouco prioritário para parsing (ver discussão anterior sobre por que nenhuma lib o implementa).
- O campo `cnab_exclusivo_2` tem tamanho diferente entre as variantes (78 na A, 22 na B) porque a variante B usa mais bytes úteis (200 contra 140+2 da A) — a soma de cada variante sempre fecha em 240.
- Como o `RecordSchema` do projeto (`src/types`) não parece ter suporte nativo a "campos condicionais" (um único registro com layouts alternativos dependendo de um campo de controle), a implementação futura provavelmente vai precisar de duas constantes exportadas (ex.: `BRADESCO_CNAB240_SEGMENT_S_MESSAGE` e `BRADESCO_CNAB240_SEGMENT_S_INFO`) ou de uma função que escolhe o schema certo com base no valor de `tipo_impressao` já extraído.
