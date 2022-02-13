tsc
git add .
git add -f dist
git branch -M main
git commit -m update --allow-empty
git rm --cached **/*.ts
git push heroku main -f
git rm -rf dist
git add .