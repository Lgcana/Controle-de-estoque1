Deploy bundle

Conteúdo:

- backend/
  - index.js (modificado para preparar/copy DB)
  - routes/
    - products.js
  - database/
    - estoque.db (placeholder — substitua pelo arquivo binário real antes de subir ao GitHub)
- frontend/
  - src/components/Products.js (apontando para Render backend)
  - src/components/Stock.js (apontando para Render backend)
  - public/_redirects

Instruções:

1. Substitua `deploy_bundle/backend/database/estoque.db` pelo arquivo real `estoque.db` do seu projeto (binário).
2. Crie um repositório no GitHub e envie o conteúdo de `deploy_bundle` como a raiz do repo (ou coloque tudo dentro de `backend`/`frontend` como desejar).

Exemplo de comandos git (execute na pasta `deploy_bundle`):

```powershell
cd "C:\Users\User\OneDrive\Área de Trabalho\site\deploy_bundle"
git init
git add -A
git commit -m "Deploy: preparar backend e frontend para Render/Netlify"
# Crie um repo no GitHub e conecte-o:
# git remote add origin https://github.com/seu-usuario/seu-repo.git
git branch -M main
git push -u origin main
```

3. No Render: crie um novo Web Service apontando para o repositório GitHub. Configure:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `node index.js`
   - Adicione variável de ambiente: `DATABASE_URL=/data/estoque.db`

4. No Netlify: crie site apontando para o repo GitHub. Configure:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

5. Verifique logs do Render depois do deploy. Deve ver mensagens de criação/cópia do DB e "Banco SQLite pronto!".

Se preferir, posso gerar o zip do `deploy_bundle` e você faz o upload manual pelo GitHub web UI. Me avise se quer que eu compacte o bundle agora.