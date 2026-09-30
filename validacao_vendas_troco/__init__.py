"""
Sistema de Validação de Vendas e Troco Comercial
Automação comercial para pequenos negócios
"""

__version__ = "1.0.0"
__author__ = "Fabio Mateus"
__email__ = "fabiomateus069@gmail.com"
__description__ = "Script em Python para automação comercial: validação de pagamentos em caixa, cálculo automático de troco e alertas de saldo devedor."

from .validacao import validar_pagamento, calcular_troco

__all__ = ["validar_pagamento", "calcular_troco"]
