/**
 * Utilitários para manipulação de strings
 */

/**
 * Valida CPF utilizando o algoritmo de dígito verificador (módulo 11).
 *
 * @param cpf - CPF em qualquer formatação (com ou sem pontos/traço); apenas os dígitos
 *   são considerados (`replace(/\D/g, '')`). Deve ter exatamente 11 dígitos após a limpeza.
 * @returns `false` para string vazia, tamanho diferente de 11, sequências de dígito repetido
 *   (ex: "00000000000") ou dígitos verificadores incorretos; `true` caso contrário
 */
export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false // Todos dígitos iguais

  // Validação do primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(9))) return false

  // Validação do segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(10))) return false

  return true
}

/**
 * Valida CNPJ utilizando o algoritmo de dígito verificador (módulo 11, com pesos cíclicos 2-9).
 *
 * @param cnpj - CNPJ em qualquer formatação; apenas os dígitos são considerados. Deve ter
 *   exatamente 14 dígitos após a limpeza.
 * @returns `false` para string vazia, tamanho diferente de 14, sequências de dígito repetido
 *   ou dígitos verificadores incorretos; `true` caso contrário
 */
export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleaned)) return false // Todos dígitos iguais

  // Validação do primeiro dígito verificador
  let sum = 0
  let pos = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned.charAt(12))) return false

  // Validação do segundo dígito verificador
  sum = 0
  pos = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned.charAt(13))) return false

  return true
}

/**
 * Valida CPF ou CNPJ, decidindo qual algoritmo usar pela quantidade de dígitos.
 *
 * @param document - documento em qualquer formatação (só os dígitos são considerados)
 * @returns `true` se for um CPF válido (11 dígitos) ou CNPJ válido (14 dígitos);
 *   `false` para qualquer outro tamanho (não tenta adivinhar/truncar)
 */
export function isValidCpfCnpj(document: string): boolean {
  const cleaned = document.replace(/\D/g, '')

  if (cleaned.length === 11) return isValidCPF(cleaned)
  if (cleaned.length === 14) return isValidCNPJ(cleaned)

  return false
}

/**
 * Valida o documento (CPF/CNPJ) do pagador conforme ele vem gravado no CNAB: o campo
 * tem largura fixa e vem preenchido com zeros à esquerda (ex: campo de 15 posições
 * para um CPF de 11 dígitos).
 *
 * Passos: remove os zeros à esquerda para achar o tamanho "real" do documento e, então,
 * repadroniza para 11 dígitos (CPF) se sobrarem até 11 dígitos, ou para 14 (CNPJ) caso
 * contrário — antes de checar os dígitos verificadores. Documentos com 12 ou 13 dígitos
 * "reais" (o que não deveria acontecer num CNAB bem formado) acabam sendo tratados como
 * CNPJ incompleto e falham na validação.
 *
 * @param rawDocument - valor bruto do campo tal como extraído da linha (`ParsedField.raw`),
 *   ainda com padding de zeros à esquerda
 * @returns `true` se, após remover o padding, resultar num CPF ou CNPJ válido
 */
export function validatePayerDocument(rawDocument: string): boolean {
  const cleaned = rawDocument.trim().replace(/^0+/, '')
  if (!cleaned) return false

  const padded = cleaned.length <= 11 ? cleaned.padStart(11, '0') : cleaned.padStart(14, '0')
  return isValidCpfCnpj(padded)
}
