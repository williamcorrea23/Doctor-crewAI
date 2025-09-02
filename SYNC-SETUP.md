# 🔄 Sistema de Sincronização Automática

Este projeto está configurado com um sistema completo de sincronização automática entre o ambiente local e o repositório GitHub.

## 🚀 Funcionalidades

### 1. Hooks do Git (Husky)
- **Pre-commit**: Formata código, executa linter e type-check antes de cada commit
- **Pre-push**: Valida build antes de enviar para o repositório remoto

### 2. GitHub Actions
- **CI/CD Pipeline**: Build, teste e deploy automático na Vercel
- **Auto-sync**: Sincronização automática a cada 30 minutos
- **Dependabot**: Atualizações automáticas de dependências

### 3. Scripts de Sincronização
- **Formatação automática**: Prettier + ESLint
- **Validação de tipos**: TypeScript
- **Commit e push automático**: Com mensagens padronizadas

## 📋 Comandos Disponíveis

```bash
# Sincronização manual
npm run sync

# Sincronização forçada (sem validações)
npm run sync:force

# Formatação de código
npm run format
npm run format:check

# Linting
npm run lint
npm run lint:fix

# Verificação de tipos
npm run type-check
```

## ⚙️ Configuração Automática

### Quando você faz um commit:
1. ✅ Código é formatado automaticamente
2. ✅ Linter corrige problemas automaticamente
3. ✅ Type-check é executado
4. ✅ Arquivos são adicionados ao commit

### Quando você faz um push:
1. ✅ Type-check é executado
2. ✅ Linter é executado
3. ✅ Build é testado
4. ✅ Push é realizado se tudo estiver OK

### GitHub Actions (Automático):
1. ✅ A cada 30 minutos verifica mudanças
2. ✅ Formata código se necessário
3. ✅ Faz commit e push automático
4. ✅ Deploy na Vercel em caso de mudanças

## 🔧 Arquivos de Configuração

- `.github/workflows/ci-cd.yml` - Pipeline de CI/CD
- `.github/workflows/auto-sync.yml` - Sincronização automática
- `.husky/pre-commit` - Hook de pre-commit
- `.husky/pre-push` - Hook de pre-push
- `.prettierrc` - Configuração do Prettier
- `.prettierignore` - Arquivos ignorados pelo Prettier
- `lint-staged.config.js` - Configuração do lint-staged
- `scripts/auto-sync.js` - Script de sincronização

## 🚨 Resolução de Problemas

### Se o commit falhar:
```bash
# Verificar erros de tipo
npm run type-check

# Corrigir linting
npm run lint:fix

# Formatar código
npm run format
```

### Se o push falhar:
```bash
# Verificar se o build funciona
npm run build

# Sincronizar manualmente
npm run sync
```

### Bypass de hooks (emergência):
```bash
# Commit sem hooks
git commit --no-verify -m "mensagem"

# Push sem hooks
git push --no-verify
```

## 📊 Monitoramento

- **GitHub Actions**: Veja os workflows em `Actions` no GitHub
- **Vercel**: Deploy automático configurado
- **Logs**: Verifique os logs dos workflows para debugging

## 🎯 Benefícios

✅ **Zero configuração manual** após setup inicial  
✅ **Código sempre formatado** e consistente  
✅ **Deploy automático** na Vercel  
✅ **Sincronização contínua** com GitHub  
✅ **Validação automática** antes de commits/pushes  
✅ **Atualizações de dependências** automáticas  

---

**Nota**: O sistema está configurado para funcionar automaticamente. Você pode continuar desenvolvendo normalmente que tudo será sincronizado automaticamente!