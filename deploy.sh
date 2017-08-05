
#!/bin/bash

git clone "https://${GH_TOKEN}@github.com/ToutyRater/toutyrater.github.io" 

mv toutyrater.github.io _book

npm install gitbook-cli -g
gitbook init
gitbook install
gitbook build

cd _book
rm .travis.yml deploy.sh .gitignore
#git init
git config user.name "Rater"
git config user.email "ToutyRater@users.noreply.github.com"
#git remote add upstream "https://${GH_TOKEN}@github.com/ToutyRater/toutyrater.github.io"

#git checkout -b master
git add -A
git commit -m 'update'
git push origin master -f
