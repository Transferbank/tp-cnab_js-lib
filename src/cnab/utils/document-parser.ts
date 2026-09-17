export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i)
  let digit1 = 11 - (sum % 11)
  if (digit1 >= 10) digit1 = 0
  if (digit1 !== parseInt(clean[9])) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i)
  let digit2 = 11 - (sum % 11)
  if (digit2 >= 10) digit2 = 0
  return digit2 === parseInt(clean[10])
}

export function isValidCNPJ(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14 || /^(\d)\1{13}$/.test(clean)) return false
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit1 = sum % 11
  digit1 = digit1 < 2 ? 0 : 11 - digit1
  if (digit1 !== parseInt(clean[12])) return false
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit2 = sum % 11
  digit2 = digit2 < 2 ? 0 : 11 - digit2
  return digit2 === parseInt(clean[13])
}

export function isValidCpfCnpj(document: string): boolean {
  const clean = document.replace(/\D/g, '')
  if (clean.length === 11) return isValidCPF(document)
  if (clean.length === 14) return isValidCNPJ(document)
  return false
}

export function validateDocument(rawDocument: string): boolean {
  const digits = rawDocument.trim()
  if (digits.length === 0) return false

  // O campo CNAB e preenchido com zero a esquerda ate uma largura fixa, sem
  // indicar se o conteudo e CPF ou CNPJ - por isso o documento real esta
  // sempre nos digitos mais a direita. Descobrir CPF vs CNPJ removendo
  // zeros e adivinhando pelo tamanho resultante e ambiguo: um CNPJ cuja
  // raiz comece com zero, somado ao padding do campo, pode sobrar com
  // exatamente 11 digitos e ser validado como CPF por engano. Testar as
  // duas leituras fixas (ultimos 11 digitos como CPF, ultimos 14 como
  // CNPJ) evita essa ambiguidade.
  const asCPF = digits.slice(-11)
  const asCNPJ = digits.slice(-14).padStart(14, '0')

  return isValidCpfCnpj(asCPF) || isValidCpfCnpj(asCNPJ)
}
