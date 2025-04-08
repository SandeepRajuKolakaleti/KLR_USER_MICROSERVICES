# General Information
This Repository is about implementing Jwt Authorization with NestJs.  
The Youtube Playlist for this repository can be found here: https://www.youtube.com/playlist?list=PLVfq1luIZbSmjsLsM04De_eltKTX0lz7f  

This Repository is a clone of the Project "nestjs-dockerized" (see more under Concept of the series).

In the folder 'postman-collection' you find a collection of postman requests that you can import into postman and execute against the api.

## Start Commands for docker-compose file and information
Builds, (re)creates, starts, and attaches to containers for a service.  
`docker-compose up`  
Information:   
- Database can be accessed with PG-Admin via `localhost:5050` and then connect your database (see youtube playlist)
- NestJS Api can be accessed on `localhost:8080/api` (see youtube playlist)
  
# Concept of the series:

With every series we clone/fork the last project, so that the code is always up to date with the according project.

List in Order with all Youtube Playlists and Repository Links:

01. NestJS Dockerized  
Clone/Fork of: None  
Repo-Link: https://github.com/ThomasOliver545/nestjs-dockerized  
Youtube-Playlist: https://www.youtube.com/playlist?list=PLVfq1luIZbSlIzPhcm6bBV2h82nSYS6gK  

02. NestJS Auth Jwt  
Clone/Fork of: 1. NestJS Dockerized  
Repo-Link: https://github.com/ThomasOliver545/nestjs-auth-jwt  
Youtube-Playlist: https://www.youtube.com/playlist?list=PLVfq1luIZbSmjsLsM04De_eltKTX0lz7f  

# You need the installed tools
- NPM
- Node.js
- NestJS
- Docker

# Basic Commands for Docker
Basic Docker Commands:  
List your docker images: `docker images`  
List your running containers: `docker ps`  
List also stopped containers: `docker ps -a`
Kill a running container: `docker kill <id of container from docker ps (first 3 letters)>`, eg `docker kill fea`  

#DB configuration:
    mysql: 
	   	app.module.ts
		host: 'localhost',
		port: 3306,
		username: 'root',
		password: 'root123',
		database: 'userdb'

#Installation:
npm install

#Run server:
npm start

#JWT secreat key:
jwt.strategy.ts, auth.module.ts
key: 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTY0MDcxNjYwMiwiaWF0IjoxNjQwNzE2NjAyfQ.U8Lkffcq6qlerRlslNU1OUGmihqBanS5_-1iyKXZFSk'


#Redis usage: on any module as like below set, get
await this.redisCacheService.set(reportDate, dailyReport);
const dailyReport = await this.redisCacheService.getMany(datesList);

# deployment
docker network create user-service-net
docker-compose up --build

# run nodemon server
npm run start:dev
if any Mysql error connection then uninstall mysql and install mysql2

# debug
goto Run and debug (ctrl+shft+d) and select
Run Script:debug
click on play button