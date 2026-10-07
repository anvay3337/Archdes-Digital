# Archdes Digital

## Run
    npm install
    npm start        # http://localhost:3000

## Structure
    client/   index.html, css/styles.css, js/{landing3d,vortex,main}.js
    server/   index.js, routes/{projects,contact}.js, data/{projects,messages}.json

## Customise
- Edit your projects (title, type, url, hue) in `server/data/projects.json`. The URLs are placeholders.
- Contact messages are saved to `server/data/messages.json`. Swap in an email service (e.g. Nodemailer) in `routes/contact.js`.
