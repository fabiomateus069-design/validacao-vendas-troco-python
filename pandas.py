# =========================================================
# Sistema de Validação de Vendas e Cálculo de Troco
# Desenvolvido em Python para automação comercial
# =========================================================

print("--- FAMÍLIA SANTOS COMERCIAL ---")

# 1. Entrada de dados com conversão para decimal (float)
valor_compra = float(input("Digite o valor da compra (R$): "))
valor_pago = float(input("Digite o valor pago pelo cliente (R$): "))

# 2. Processamento da venda e validação de pagamento
if valor_pago >= valor_compra:
    troco = valor_pago - valor_compra
    print(f"\n[SUCESSO] Pagamento efetuado!")
    print(f"Troco a devolver: R$ {troco:.2f}")
else:
    falta = valor_compra - valor_pago
    print(f"\n[ALERTA] Valor insuficiente!")
    print(f"Falta para completar o pagamento: R$ {falta:.2f}")