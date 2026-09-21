const CPF_PATTERN = /^\d{11}$/
const CNPJ_PATTERN = /^[A-Z0-9]{12}\d{2}$/

// CNPJ alfanumerico (Receita Federal, vigente desde 01/08/2026): o digito
// verificador usa o codigo ASCII do caractere menos 48, que para digitos
// coincide com o proprio valor numerico (ord('0') - 48 == 0).
function charValue(char: string): number {
  return char.charCodeAt(0) - 48
}

export function isValidCPF(cpf: string): boolean {
  if (!CPF_PATTERN.test(cpf) || cpf === cpf[0].repeat(11)) return false
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

// As 12 primeiras posicoes aceitam letras A-Z alem de digitos; os 2 digitos
// verificadores continuam sempre numericos.
export function isValidCNPJ(cnpj: string): boolean {
  const value = cnpj.toUpperCase()
  if (!CNPJ_PATTERN.test(value) || value === value[0].repeat(14)) return false

  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += charValue(value[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit1 = sum % 11
  digit1 = digit1 < 2 ? 0 : 11 - digit1
  if (digit1 !== charValue(value[12])) return false

  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += charValue(value[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit2 = sum % 11
  digit2 = digit2 < 2 ? 0 : 11 - digit2
  return digit2 === charValue(value[13])
}

function isDigitsOnly(value: string): boolean {
  return /^\d+$/.test(value)
}

function isAlphanumeric(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value)
}

export function validateDocument(rawDocument: string): boolean {
  const digits = rawDocument.trim()
  if (digits.length === 0 || !isAlphanumeric(digits)) return false

  // O documento real esta sempre nos caracteres mais a direita quando o
  // campo é numerico (zero-padding a esquerda); campos alfanumericos já
  // chegam sem padding após o trim, então o slice vira um no-op.
  const asCPF = digits.slice(-11)
  const asCNPJ = digits.slice(-14).padStart(14, '0')

  // isDigitsOnly(digits) roda no valor inteiro (não só no slice) para
  // reprovar letras fora da janela dos 11 digitos, como um CPF com lixo
  // alfabetico de padding que "some" no slice.
  const cpfMatches = isDigitsOnly(digits) && isValidCPF(asCPF)
  const cnpjMatches = isValidCNPJ(asCNPJ)

  return cpfMatches || cnpjMatches
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
  if (tipoInscricao === cpfIndicator) return isDigitsOnly(document) && isValidCPF(document.slice(-11))
  if (tipoInscricao === cnpjIndicator) return isAlphanumeric(document) && isValidCNPJ(document.slice(-14).padStart(14, '0'))
  return false
}
