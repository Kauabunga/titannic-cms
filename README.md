## Google-doc-json CMS ![Travis-ci build status](https://travis-ci.org/Kauabunga/titannic-cms.svg)


> A json based cms that uses google docs as a document store.


1. Clone the git repo

        git clone git@github.com:Kauabunga/titannic-cms.git
    
2. Install / config / start mongodb

        brew install mongodb
        sudo mkdir -p /data/db
        sudo chmod -R 777 /data/db
        mongod

3. Install node and npm
        
        brew install node
    
3. Install npm packages

        npm install
    
4. Install bower packages

        npm install -g bower
        bower install
    
5. Server config @ /server/config/local.env.js (there is a sample config example commited)
    - We need two properties: GOOGLE_ID & GOOGLE_SECRET
    - This should never be commited to the repository
    
6. Set development environment variable
            
        export NODE_ENV=development
    
7. Run dev environment using grunt

        grunt serve

