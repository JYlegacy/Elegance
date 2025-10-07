@echo off
setlocal

:: Define o nome do arquivo de saída
set "output=lista_de_arquivos.txt"

:: Apaga o arquivo anterior, se existir
if exist "%output%" del "%output%"

:: Lista todos os arquivos com caminho completo e salva no arquivo
for /r %%F in (*) do (
    echo %%F >> "%output%"
)

echo Lista criada com sucesso: %output%
pause
