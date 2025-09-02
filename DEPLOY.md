# 🚀 Guia de Deploy - Plataforma ENEM

## 📋 Pré-requisitos

Antes de fazer o deploy, você precisará configurar as seguintes credenciais:

### 1. Firebase
- Projeto Firebase configurado
- Credenciais do Firebase Client (já configuradas)
- Credenciais do Firebase Admin SDK

### 2. OpenAI
- Conta na OpenAI Platform
- Chave de API válida

## 🔧 Configuração Local

1. Copie o arquivo de exemplo:
```bash
cp .env.example .env.local
```

2. Configure as variáveis no `.env.local`:
```env
# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=seu_email_service_account@projeto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nSUA_CHAVE_PRIVADA_AQUI\n-----END PRIVATE KEY-----\n"

# OpenAI API
OPENAI_API_KEY=sk-sua_chave_openai_aqui
```

## 🌐 Deploy na Vercel

### Passo 1: Preparar o Repositório
1. Certifique-se que o `.env.local` **NÃO** está commitado
2. Faça push do código para o GitHub
3. O `.gitignore` já protege arquivos `.env*`

### Passo 2: Configurar Variáveis de Ambiente na Vercel
1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard)
2. Importe seu projeto do GitHub
3. Vá em **Project Settings** > **Environment Variables**
4. Adicione todas as variáveis do `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
OPENAI_API_KEY
```

### Passo 3: Deploy
1. Clique em **Deploy** na Vercel
2. Aguarde o build completar
3. Teste todas as funcionalidades

## 🔒 Segurança

### ✅ Boas Práticas
- ✅ Arquivos `.env*` estão no `.gitignore`
- ✅ Variáveis sensíveis são configuradas na Vercel
- ✅ Chaves de API não estão expostas no código

### ⚠️ Verificações Importantes
- [ ] Confirme que `.env.local` não está no repositório
- [ ] Verifique se todas as variáveis estão configuradas na Vercel
- [ ] Teste a autenticação Firebase em produção
- [ ] Teste as funcionalidades de IA (OpenAI)
- [ ] Verifique os logs de erro na Vercel

## 🛠️ Funcionalidades Implementadas

### 🎓 Sistema de Aulas
- Pedagogia baseada em Paulo Freire
- Histórico de conversas persistente
- Autenticação via Firebase

### 📝 Correção de Redações
- Sistema de dupla avaliação
- Avaliador técnico (Competências 1, 3, 4)
- Avaliador de conteúdo (Competências 2, 5)
- Feedback detalhado por competência

### 🔐 Autenticação
- Login/Registro via Firebase Auth
- Proteção de rotas
- Tokens seguros para APIs

## 📞 Suporte

Em caso de problemas durante o deploy:
1. Verifique os logs na Vercel Dashboard
2. Confirme se todas as variáveis de ambiente estão configuradas
3. Teste as credenciais Firebase e OpenAI separadamente

---

**Importante**: Mantenha suas chaves de API seguras e nunca as compartilhe publicamente!