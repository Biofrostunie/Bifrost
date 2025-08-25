# 🔒 Security Policy

## 🛡️ Supported Versions

Nós fornecemos atualizações de segurança para as seguintes versões:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Sim             |
| < 1.0   | ❌ Não             |

## 🚨 Reporting a Vulnerability

A segurança da Bifröst Education Platform é uma prioridade. Se você descobrir uma vulnerabilidade de segurança, por favor, siga estas diretrizes:

### 📧 Como Reportar

**NÃO** crie uma issue pública para vulnerabilidades de segurança.

Em vez disso, envie um email para: **security@bifrost-platform.com**

### 📋 Informações a Incluir

Por favor, inclua as seguintes informações em seu relatório:

- **Descrição** da vulnerabilidade
- **Passos para reproduzir** o problema
- **Impacto potencial** da vulnerabilidade
- **Versão afetada** do software
- **Ambiente** onde foi descoberta (OS, Node.js version, etc.)
- **Prova de conceito** (se aplicável)

### ⏱️ Tempo de Resposta

- **Confirmação inicial**: 24 horas
- **Avaliação detalhada**: 72 horas
- **Correção**: Dependendo da severidade
  - **Crítica**: 1-7 dias
  - **Alta**: 7-14 dias
  - **Média**: 14-30 dias
  - **Baixa**: 30-90 dias

### 🏆 Reconhecimento

Agradecemos pesquisadores de segurança responsáveis e oferecemos:

- **Reconhecimento público** (se desejado)
- **Listagem** em nosso hall da fama de segurança
- **Feedback detalhado** sobre o relatório

## 🔐 Práticas de Segurança

### 🛡️ Medidas Implementadas

- **Autenticação JWT** com expiração
- **Rate limiting** em endpoints sensíveis
- **Validação rigorosa** de entrada
- **Sanitização** de dados
- **HTTPS** obrigatório em produção
- **Logs de auditoria** para ações críticas
- **Princípio do menor privilégio**

### 🔒 Configurações Seguras

#### Variáveis de Ambiente
```bash
# Use senhas fortes
JWT_SECRET="use-a-strong-random-secret-here"

# Configure HTTPS em produção
NODE_ENV="production"

# Use conexões seguras para banco
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### Headers de Segurança
```typescript
// Configurações recomendadas
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 🔍 Auditoria Regular

- **Dependências**: `npm audit` automatizado
- **Código**: Análise estática com CodeQL
- **Containers**: Scan de vulnerabilidades
- **Penetration testing**: Trimestral

## 🚫 Vulnerabilidades Conhecidas

### Mitigadas
- **CVE-2023-XXXX**: Corrigida na versão 1.0.1
- **CVE-2023-YYYY**: Corrigida na versão 1.0.2

### Em Investigação
Nenhuma no momento.

## 📚 Recursos de Segurança

### 🔗 Links Úteis
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)

### 📖 Documentação
- [Guia de Configuração Segura](./docs/security-setup.md)
- [Práticas de Desenvolvimento Seguro](./docs/secure-development.md)
- [Incident Response Plan](./docs/incident-response.md)

## 🤝 Programa de Bug Bounty

Atualmente, não temos um programa formal de bug bounty, mas reconhecemos e agradecemos relatórios responsáveis de vulnerabilidades.

### 🎯 Escopo

**Incluído:**
- Aplicação principal (API)
- Autenticação e autorização
- Manipulação de dados sensíveis
- Configurações de infraestrutura

**Excluído:**
- Ataques de força bruta
- Spam ou flooding
- Vulnerabilidades em dependências de terceiros (reporte diretamente aos mantenedores)
- Problemas de configuração do usuário

## 📞 Contato

- **Email Geral**: noreplybifrost@gmail.com
- **GitHub Security**: Use o recurso "Security" do GitHub
- **Email De Colaboradores**: lucasoliveirasantiago3@gmail.com

---

**Obrigado por ajudar a manter a Bifröst Education Platform segura! 🛡️**