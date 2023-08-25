# Guia de Instalação e Execução do RPG Bot para Telegram

Este guia fornecerá instruções passo a passo sobre como instalar e executar o bot de RPG para Telegram encontrado no repositório: [rpg-bot-telegram](https://github.com/gustavobtflores/rpg-bot-telegram).

## Pré-requisitos

1. [Node.js](https://nodejs.org/)
2. npm (normalmente já vem com a instalação do Node.js)

## Instruções de Instalação

1. **Clone o Repositório**

   Abra o terminal e execute o seguinte comando para clonar o repositório:

   ```bash
   git clone https://github.com/gustavobtflores/rpg-bot-telegram.git
   ```

   Navegue até a pasta do projeto:

   ```bash
   cd rpg-bot-telegram
   ```

2. **Instale as Dependências**

   Ainda no terminal, execute:

   ```bash
   npm install
   ```

3. **Configurar Variável de Ambiente**

   Crie um arquivo chamado `.env` na raiz do projeto. Abra este arquivo em um editor de sua escolha e adicione a seguinte linha:

   ```env
   BOT_API_TOKEN=SEU_TOKEN_DO_BOT_TELEGRAM
   ```

   **Nota:** Substitua `SEU_TOKEN_DO_BOT_TELEGRAM` pelo token que você obteve ao criar o bot no `@BotFather` no Telegram.

## Execução

1. **Execute o Bot**

   Com tudo pronto, agora você pode iniciar o bot com:

   ```bash
   npm start
   ```

2. Agora, vá ao Telegram e inicie uma conversa com o seu bot. Se tudo estiver configurado corretamente, ele deve responder às suas mensagens conforme programado.
