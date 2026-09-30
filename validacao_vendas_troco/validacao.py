"""
Módulo de validação de pagamentos e cálculo de troco
"""


def validar_pagamento(valor_compra: float, valor_pago: float) -> dict:
    """
    Valida o pagamento e calcula o troco ou saldo devedor.
    
    Args:
        valor_compra (float): Valor total da compra em reais
        valor_pago (float): Valor pago pelo cliente em reais
    
    Returns:
        dict: Dicionário com status, mensagem e valor (troco ou falta)
        
    Exemplo:
        >>> resultado = validar_pagamento(150.00, 200.00)
        >>> print(resultado)
        {'status': 'sucesso', 'troco': 50.0, 'mensagem': 'Pagamento efetuado!'}
    """
    if valor_pago >= valor_compra:
        troco = valor_pago - valor_compra
        return {
            'status': 'sucesso',
            'troco': round(troco, 2),
            'mensagem': 'Pagamento efetuado!'
        }
    else:
        falta = valor_compra - valor_pago
        return {
            'status': 'erro',
            'falta': round(falta, 2),
            'mensagem': 'Valor insuficiente!'
        }


def calcular_troco(valor_compra: float, valor_pago: float) -> float:
    """
    Calcula apenas o valor do troco.
    
    Args:
        valor_compra (float): Valor total da compra em reais
        valor_pago (float): Valor pago pelo cliente em reais
    
    Returns:
        float: Valor do troco (0 se valor_pago < valor_compra)
        
    Exemplo:
        >>> troco = calcular_troco(150.00, 200.00)
        >>> print(troco)
        50.0
    """
    if valor_pago >= valor_compra:
        return round(valor_pago - valor_compra, 2)
    return 0.0


def formatar_moeda(valor: float) -> str:
    """
    Formata um valor como moeda brasileira.
    
    Args:
        valor (float): Valor a formatar
    
    Returns:
        str: Valor formatado como R$ X.XXX,XX
        
    Exemplo:
        >>> moeda = formatar_moeda(150.50)
        >>> print(moeda)
        R$ 150,50
    """
    return f"R$ {valor:,.2f}".replace(",", "@").replace(".", ",").replace("@", ".")
