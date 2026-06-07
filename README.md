# AddressSearch

## Instale os pacotes
```
    npm install
```

## Execute o projeto
```
    npm run start
```

## Funcionamento da busca de endereços

A aplicação permite consultar endereços de duas formas:

1. Busca por CEP: ao informar um CEP válido, o sistema consulta automaticamente o endereço e preenche os campos de logradouro, bairro, complemento, localidade e UF.
2. Busca por UF, cidade e logradouro: ao selecionar o estado, escolher a cidade e informar o logradouro, o usuário pode acionar a busca para localizar o endereço correspondente.

O formulário também valida os campos obrigatórios e exibe mensagens específicas para cada regra configurada, como formato do CEP, tamanho mínimo de texto e obrigatoriedade dos campos. Quando a opção S/N é marcada, o campo de número é desabilitado e deixa de ser obrigatório.

## APIs consumidas

O projeto consome as seguintes APIs externas:

- ViaCEP: `https://viacep.com.br/ws/{cep}/json/`
	- Consulta endereço a partir do CEP.
- ViaCEP por endereço: `https://viacep.com.br/ws/{uf}/{cidade}/{logradouro}/json/`
	- Consulta CEP/endereço a partir de UF, cidade e logradouro.
- IBGE Estados: `https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome`
	- Lista os estados para o campo de UF.
- IBGE Municípios por estado: `https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios?orderBy=nome`
	- Lista as cidades do estado selecionado.


