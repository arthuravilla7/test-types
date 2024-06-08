import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import session from 'express-session'
import instagramRouter from './routers/instagram-routes.js'

const app = express()
app.use(cors())
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.get('/', (req, res) => {
    res.render('home')
})

app.use(instagramRouter)

/* app.get('/me', async (req, res) => {
  try {
    const accessToken = req.query.accessToken;
    
    
    const data = await axios.get(`https://graph.facebook.com/me?access_token=${encodeURIComponent(accessToken)}`).
      then(res => res.data);

    console.log(data)

    return res.send(`
      <html>
        <body>Your name is ${data.name}</body>
      </html>
    `);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.response.data || err.message });
  }
}); */

export default app