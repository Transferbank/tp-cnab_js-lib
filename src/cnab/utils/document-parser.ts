// Campos CNAB sao numericos por layout: qualquer caractere que nao seja
// digito (formatacao, letras de padding etc.) indica um campo malformado e
// deve reprovar, em vez de ser descartado silenciosamente.
function isDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value)
}

export function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || !isDigitsOnly(cpf) || /^(\d)\1{10}$/.test(cpf)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i)
  let digit1 = 11 - (sum % 11)
  if (digit1 >= 10) digit1 = 0
  if (digit1 !== parseInt(cpf[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i)
  let digit2 = 11 - (sum % 11)
  if (digit2 >= 10) digit2 = 0
  return digit2 === parseInt(cpf[10])
}

export function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || !isDigitsOnly(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit1 = sum % 11
  digit1 = digit1 < 2 ? 0 : 11 - digit1
  if (digit1 !== parseInt(cnpj[12])) return false
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit2 = sum % 11
  digit2 = digit2 < 2 ? 0 : 11 - digit2
  return digit2 === parseInt(cnpj[13])
}

export function isValidCpfCnpj(document: string): boolean {
  if (document.length === 11) return isValidCPF(document)
  if (document.length === 14) return isValidCNPJ(document)
  return false
}

export function validateDocument(rawDocument: string): boolean {
  const digits = rawDocument.trim()
  if (digits.length === 0 || !isDigitsOnly(digits)) return false

  // O documento real esta sempre nos digitos mais a direita (o campo e
  // preenchido com zero a esquerda), entao testamos as duas leituras fixas
  // em vez de adivinhar CPF/CNPJ pelo tamanho apos remover zeros.
  const asCPF = digits.slice(-11)
  const asCNPJ = digits.slice(-14).padStart(14, '0')

  return isValidCpfCnpj(asCPF) || isValidCpfCnpj(asCNPJ)
}

// Alguns layouts (Segmento Q do CNAB240, campo de pagador do CNAB400 do
// Itau) trazem um indicador explicito de tipo de inscricao ao lado do
// documento, evitando a ambiguidade de validateDocument(). O tamanho do
// codigo varia por banco/formato (ex.: "1"/"2" no CNAB240, "01"/"02" no
// CNAB400 do Itau), por isso os codigos sao parametros.
export function validateDocumentByIndicator(
  document: string,
  tipoInscricao: string,
  cpfIndicator: string,
  cnpjIndicator: string
): boolean {
  if (!isDigitsOnly(document)) return false
  if (tipoInscricao === cpfIndicator) return isValidCPF(document.slice(-11))
  if (tipoInscricao === cnpjIndicator) return isValidCNPJ(document.slice(-14).padStart(14, '0'))
  return false
}
