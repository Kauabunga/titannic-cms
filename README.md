titannic-cms
============

Google-doc-json CMS


Some nice and mankey temporary setup instructions :)



1. Pull the git repo
      COMMANDS      
        git clone git@github.com:Kauabunga/titannic-cms.git
    
2. Install / config / start mongodb
      COMMANDS
        brew install mongodb
        sudo mkdir -p /data/db
        sudo chmod -R 777 /data/db
        mongod

3. Install node and npm
      COMMANDS
        brew install node
    
3. Install npm packages
      COMMANDS
        npm install
    
4. Install bower packages
      COMMANDS
        npm install -g bower
        bower install
    
5. Server config @ /server/config/local.env.js (there is a sample config example commited)
    - we need two properties: GOOGLE_ID & GOOGLE_SECRET
    - this should never be commited to the repository
    
6. Run using grunt
      COMMANDS
        grunt serve


