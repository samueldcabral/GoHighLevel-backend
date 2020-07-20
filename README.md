<h1 align="center">
  <br>
   <img src="https://i.imgur.com/e7MHKNR.jpg" alt="My logo"/>
  <br>
</h1>
<p align="center">   
 <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-%5E4.17.1-brightgreen?style=plastic&logo=appveyor"></a>
 <a href="https://firebase.google.com/"><img src="https://img.shields.io/badge/Firebase-%5E7.16.0-orange?style=plastic&logo=appveyor"></a>
 <a href="https://momentjs.com/"><img src="https://img.shields.io/badge/MomentJS-%5E2.27.0-ff69b4?style=plastic&logo=appveyor"></a>
 <a href="mailto:samueldcabral@gmail.com"><img src="https://img.shields.io/badge/Email-Me!-lightgrey?style=plastic&logo=appveyor"></a>
 <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue?style=plastic&logo=appveyor"></a> 
</p>

<p align="center">
  This is the backend assignment for HighLevel and It consisted in creating three endpoints to handle the Creation of events, Reading of events and events' slots.<br> Check out the Frontend for this project. 
   <a href="https://github.com/samueldcabral/GoHighLevel-frontend">Visit Frontend</a>
</p>

## Index

- [Get Started](#get-started)
- [Endpoints](#endpoints)
- [About Me](#about-me)

<h2 id="get-started">Get Started</h2>
Copy each command below and paste them in the Terminal to set it up. <br>
(For better experience, make sure you have use the frontend app - check it out <a href="https://github.com/samueldcabral/GoHighLevel-frontend">here</a> )

```bash
git clone https://github.com/samueldcabral/GoHighLevel-backend.git
cd GoHighLevel-backend/
npm install
npm start
```

<h2 id="endpoints">Endpoints</h2>

```js
GET http://localhost:3003/api/events
 - params  StartDate: string //'YYYY-MM-DD'
           EndDate: string // 'YYYY-MM-DD'

POST http://localhost:3003/api/events
 - body  DateTime: string //'YYYY-MM-DDTHH:mmZ'
         Duration: string //1 to 60

POST http://localhost:3003/api/events/slots
 - params  Date?: string //'YYYY-MM-DD' (if left blank, it will return all events and their slots)
           Timezone: string

```

<h2 id="about-me">About me</h2>
<strong>Samuel Deschamps Cabral</strong>
<br>
samueldcabral@gmail.com
