from setuptools import setup, find_packages

setup(
    name="validacao-vendas-troco",
    version="1.0.0",
    author="Fabio Mateus",
    author_email="fabiomateus069@example.com",
    description="Script em Python para automação comercial: validação de pagamentos em caixa, cálculo automático de troco e alertas de saldo devedor.",
    long_description=open("README.md", encoding="utf-8").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/fabiomateus069-design/validacao-vendas-troco-python",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Intended Audience :: Developers",
        "Topic :: Office/Business :: Financial :: Point-Of-Sale",
    ],
    python_requires=">=3.8",
    keywords="validação pagamento troco caixa comercial automação",
)
