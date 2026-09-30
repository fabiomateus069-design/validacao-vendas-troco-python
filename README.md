# 🛒 Sistema de Validação de Vendas e Troco Comercial

> Script em Python focado na automação de caixa para pequenos negócios, realizando validação de pagamento, cálculo automático de troco e alertas de saldo devedor com precisão decimal.

[![Python 3.8+](https://img.shields.io/badge/python-3.8%2B-blue)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PyPI](https://img.shields.io/badge/PyPI-validacao--vendas--troco-informational)](https://pypi.org/project/validacao-vendas-troco/)

---

## 🚀 Instalação Rápida

### Via pip (Recomendado)
```bash
pip install validacao-vendas-troco
```

### Ou clone o repositório
```bash
git clone https://github.com/fabiomateus069-design/validacao-vendas-troco-python.git
cd validacao-vendas-troco-python
python pandas.py
```

---

## ⚡ Teste ao Vivo (Demonstração Interativa)

Você pode testar a aplicação diretamente no seu navegador **sem instalar nada**:

👉 **[Clique aqui para testar no Replit](https://calculadora-de-troco--fabiomateus069.replit.app)**

---

## 💻 Como Usar

### Opção 1: Executar localmente
```bash
python pandas.py
```

### Opção 2: Usar como biblioteca Python
```python
from validacao_vendas_troco import validar_pagamento

# Validar pagamento
valor_compra = 150.00
valor_pago = 200.00

resultado = validar_pagamento(valor_compra, valor_pago)
print(resultado)
```

### Exemplo de Uso
```
--- FAMÍLIA SANTOS COMERCIAL ---

Digite o valor da compra (R$): 150.50
Digite o valor pago pelo cliente (R$): 200.00

[SUCESSO] Pagamento efetuado!
Troco a devolver: R$ 49.50
```

---

## 🛠️ Tecnologias Utilizadas

- **Linguagem:** Python 3.8+
- **Ambiente:** Visual Studio Code / Replit
- **Conceitos:** 
  - Entrada de dados (`float`)
  - Lógica condicional (`if/else`)
  - Formatação de moeda (`f-strings`)
  - Precisão decimal

---

## ✨ Funcionalidades

✅ **Validação de Pagamento** - Verifica se o valor pago é suficiente  
✅ **Cálculo Automático de Troco** - Calcula o troco com precisão  
✅ **Alertas de Saldo Devedor** - Informa quando falta pagamento  
✅ **Formatação de Moeda** - Exibe valores em formato real (R$)  
✅ **Interface Amigável** - Mensagens claras e intuitivas  

---

## 📋 Requisitos

- Python 3.8 ou superior
- Nenhuma dependência externa necessária!

---

## 🎯 Casos de Uso

- 🏪 **Pequenos Comércios** - Automação de caixa
- 🛒 **Pontos de Venda** - Validação de transações
- 📊 **Sistemas de PDV** - Integração em aplicações maiores
- 🎓 **Educação** - Ensino de lógica de programação

---

## 📦 Estrutura do Projeto

```
validacao-vendas-troco-python/
├── pandas.py              # Script principal
├── setup.py               # Configuração para PyPI
├── pyproject.toml         # Metadados do projeto
├── LICENSE                # Licença MIT
├── README.md              # Este arquivo
└── .replit                # Configuração Replit
```

---

## 🤝 Contribuindo

Encontrou um bug? Tem uma sugestão? **Abra uma issue!**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👤 Autor

**Fabio Mateus**
- 🐙 GitHub: [@fabiomateus069-design](https://github.com/fabiomateus069-design)
- 📧 Email: fabiomateus069@gmail.com

---

## ⭐ Dê uma Estrela!

Se este projeto foi útil para você, por favor considere dar uma ⭐ no GitHub!

---

## 📞 Suporte

Tem dúvidas? Abra uma [issue](https://github.com/fabiomateus069-design/validacao-vendas-troco-python/issues) ou entre em contato!

---

<div align="center">

**[⬆ Voltar ao Topo](#-sistema-de-validação-de-vendas-e-troco-comercial)**

Feito com ❤️ por Fabio Mateus

</div>
