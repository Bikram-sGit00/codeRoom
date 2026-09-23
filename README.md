# codeRoom🚀✨

Sharing code in our college lab was slower than it needed to be, so I built a small app for it. Anyone can create a room, put their code in it and hand the room over to others. A teacher can post an example for the whole class, a student can share a solution, and nobody has to pass files around or retype anything.

Live site: [coderoom123.vercel.app](https://coderoom123.vercel.app)

## Used technologies

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

The front end is React with Vite and React Router, and code is displayed with Prism syntax highlighting. The back end is an Express server that stores rooms in MongoDB through Mongoose.

## How it works

```mermaid
sequenceDiagram
    actor T as Teacher
    actor S as Student
    participant A as React app
    participant B as Express server
    participant D as MongoDB

    T->>A: Create a room and add code
    A->>B: Send the room data
    B->>D: Save it
    T->>S: Share the room
    S->>A: Open the room
    A->>B: Ask for the room
    B->>D: Look it up
    D-->>B: Room and code
    B-->>A: Room and code
    A-->>S: Code shown with highlighting
```

## Project structure

```
codeRoom/
├── public/     # static assets
├── server/     # Express backend and MongoDB models
├── src/        # React app
├── index.html
└── vite.config.js
```
