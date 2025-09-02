# Plataforma de Estudos ENEM

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/williamcorrea23s-projects/v0-teste0v)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

## 📚 Sobre o Projeto

Plataforma educacional completa para preparação do ENEM, oferecendo:

- **Dashboard Interativo**: Acompanhe seu progresso com gráficos de evolução
- **Aulas por Matéria**: Conteúdo organizado em Matemática, Linguagens, Ciências Humanas e Ciências da Natureza
- **Chat Inteligente**: Tire dúvidas com IA especializada em conteúdo do ENEM
- **Simulados**: Pratique com questões no formato do exame
- **Redação**: Ferramentas para aprimorar sua escrita

## 🚀 Deploy na Vercel

### Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Projeto Firebase configurado
3. Chave da API OpenAI

### Variáveis de Ambiente

Configure as seguintes variáveis no painel da Vercel:

```env
# Firebase (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (Server-side)
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# OpenAI
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### Passos para Deploy

1. **Fork/Clone** este repositório
2. **Conecte** à Vercel via GitHub
3. **Configure** as variáveis de ambiente
4. **Deploy** automático será iniciado

### Configurações Otimizadas

- ✅ Compressão habilitada
- ✅ Headers de segurança configurados
- ✅ Otimização de imagens
- ✅ Cache otimizado
- ✅ Build command personalizado

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Configurar ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📱 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Firebase** - Backend e autenticação
- **OpenAI** - IA para chat
- **Recharts** - Gráficos interativos
- **Radix UI** - Componentes acessíveis

## 📄 Licença

Este projeto está licenciado sob a MIT License.