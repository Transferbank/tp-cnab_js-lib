export function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')

  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleaned.charAt(10))) return false

  return true
}

export function isValidCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')

  if (cleaned.length !== 14) return false
  if (/^(\d)\1{13}$/.test(cleaned)) return false

  let sum = 0
  let pos = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos
    pos = pos === 2 ? 9 : pos - 1
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit !== parseInt(cleaned.charAt(12))) return false

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

export function isValidCpfCnpj(document: string): boolean {
  const cleaned = document.replace(/\D/g, '')

  if (cleaned.length === 11) return isValidCPF(cleaned)
  if (cleaned.length === 14) return isValidCNPJ(cleaned)

  return false
}

export function validateDocument(rawDocument: string): boolean {
  const cleaned = rawDocument.trim().replace(/^0+/, '')
  if (cleaned.length === 0) return false

  const padded = cleaned.length <= 11 ? cleaned.padStart(11, '0') : cleaned.padStart(14, '0')
  return isValidCpfCnpj(padded)
}
