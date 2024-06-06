import express from 'express'
import axios, {}from 'axios'
import 'dotenv/config'
import cors from 'cors'
import session from 'express-session'

const app = express()
app.use(cors())
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/instagram-insight', (req, res) => {
  res.render('instagram-insight', req.session.facebookData ? req.session.facebookData : { facebookUserId: null, facebookName: null })
})

app.get('/facebook-login', (req, res) => {
    res.redirect(`https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/facebook-oauth-redirect')}&response_type=code&scope=pages_show_list,instagram_basic,business_management`)
  });

app.get('/facebook-oauth-redirect', async (req, res) => {
  try {
    const authCode = req.query.code;

    // Build up the URL for the API request. `client_id`, `client_secret`,
    // `code`, **and** `redirect_uri` are all required. And `redirect_uri`
    // must match the `redirect_uri` in the dialog URL from Route 1.
    const accessTokenUrl = 'https://graph.facebook.com/v20.0/oauth/access_token?' +
      `client_id=${FACEBOOK_CLIENT_ID}&` +
      `client_secret=${FACEBOOK_CLIENT_SECRET}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:3000/facebook-oauth-redirect')}&` +
      `code=${encodeURIComponent(authCode)}`;

    // Make an API request to exchange `authCode` for an access token
    const accessToken = await axios.get(accessTokenUrl).then(res => res.data['access_token']);

    const userProfileUrl = `https://graph.facebook.com/me?access_token=${encodeURIComponent(accessToken)}`
    const { id: facebookUserId, name: facebookName } = await axios.get(userProfileUrl).then(res => res.data );

    const facebookAccountUrl = `https://graph.facebook.com/v20.0/${facebookUserId}/accounts?access_token=${accessToken}`
    const facebookAccountData = await axios.get(facebookAccountUrl).then(res => res.data );
    const facebookBusinessAccountId = facebookAccountData.data[0].id // pegando a primeira account da lista
    

    const instagramAccountUrl = `https://graph.facebook.com/v20.0/${facebookBusinessAccountId}/?fields=instagram_business_account{id,name,username}&access_token=${accessToken}`
    const igBusinessAccounts = await axios.get(instagramAccountUrl).then(res => res.data );
    const { id: instagramBusinessAccountId, name: instagramPageName, username} = igBusinessAccounts.instagram_business_account;

    const instagramMediaUrl = `https://graph.facebook.com/v20.0/${instagramBusinessAccountId}/media?fields=id,caption,timestamp,comments,media_url&access_token=${accessToken}`
    const instagramMediaList = await axios.get(instagramMediaUrl).then(res => res.data );

    req.session.facebookData = {
      facebookUserId,
      facebookName,
      facebookBusinessAccountId,
      instagramBusinessAccountId,
      instagramPageName,
      instagramMediaList: instagramMediaList.data,
      accessToken
    }

    res.render('instagram-insight', { 
      facebookUserId, 
      facebookName, 
      instagramPageName,
      instagramMediaList: instagramMediaList.data });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.response.data || err.message });
  }
});

app.get('/me', async (req, res) => {
  try {
    const accessToken = req.query.accessToken;
    /* if (!accessTokens.has(accessToken)) {
      throw new Error(`Invalid access token "${accessToken}"`);
    } */

    // Get the name and user id of the Facebook user associated with the
    // access token.
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
});

export default app