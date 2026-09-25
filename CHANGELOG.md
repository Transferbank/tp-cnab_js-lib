# Changelog

## 0.2.0

### ⚠️ Breaking change

- `CnabFile.read()` / `CnabSchema.read()` **não está implementado nesta versão** e lança exceção (`Método read() ainda não implementado`). A versão `0.1.1` tinha uma implementação funcional de `read()`; quem depende dela **não deve** atualizar para `0.2.0` ainda. A reimplementação de `read()` (com extração estruturada de campos por boleto) está em andamento e volta em uma versão futura.

### Adicionado

- `CnabFile.validateBoletos()`: valida cada boleto do arquivo individualmente, retornando um resultado por boleto (`index`, `lineNumbers`, `isValid`, `errors`) em vez de só um veredito para o arquivo inteiro.
- README com documentação de uso da biblioteca (bancos suportados, `validate()`, `validateBoletos()`, tratamento de erros).

## 0.1.1

Versão publicada a partir de uma linha de desenvolvimento anterior, com `read()` funcional (implementação de duplo-passe) e nomenclatura antiga de alguns campos.
