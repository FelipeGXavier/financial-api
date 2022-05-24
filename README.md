# Financial API

Essa API é um projeto fictício que simula transações entre a carteira de dois usuário.

O desafio foi inspirado no <a href="https://github.com/PicPay/picpay-desafio-backend">teste do Picpay</a>

Temos 2 tipos de usuários, os comuns e lojistas, ambos têm carteira com dinheiro e realizam transferências entre eles. Vamos nos atentar somente ao fluxo de transferência entre dois usuários.

Requisitos:

- Para ambos tipos de usuário, precisamos do Nome Completo, CPF, e-mail e Senha. CPF/CNPJ e e-mails devem ser únicos no sistema. Sendo assim, seu sistema deve permitir apenas um cadastro com o mesmo CPF ou endereço de e-mail.
- Usuários podem enviar dinheiro (efetuar transferência) para lojistas e entre usuários.
- Lojistas só recebem transferências, não enviam dinheiro para ninguém.
- Validar se o usuário tem saldo antes da transferência.
- Antes de finalizar a transferência, deve-se consultar um serviço autorizador externo, use este mock para simular (https://run.mocky.io/v3/8fafdd68-a090-496f-8c9a-3442cf30dae6).
- A operação de transferência deve ser uma transação (ou seja, revertida em qualquer caso de inconsistência) e o dinheiro deve voltar para a carteira do usuário que envia.
- No recebimento de pagamento, o usuário ou lojista precisa receber notificação (envio de email, sms) enviada por um serviço de terceiro e eventualmente este serviço pode estar indisponível/instável. Use este mock para simular o envio (http://o4d9z.mocklab.io/notify).

A arquitetura do código é inspirada nos conceitos de arquitetura hexagonal e clean architecture.

São existentes dois ambientes, _development_ utilizado para testes e _production_ para simular um ambiente de produção.

Sendo assim são utilizados dois bancos Postgres para cada um dos ambientes, para executá-los a partir do diretório wallet-api:

<pre>docker-compose up -d</pre>

Para executar os testes unitários:

Executando _migrations_ e _seeders_:

<pre>npm run migrate</pre>

<pre>npm run seed</pre>

Executando testes unitários:

<pre>npm run test:unit</pre>

Executando testes de integração:

<pre>npm run test:integration</pre>

## Tecnologias e ferramentas:

- Node 17
- NPM
- Postgres
- Knex
- Jest
- Typescript
- Express
- Morgan e Winston (Logger)
- ESLint e Prettier
