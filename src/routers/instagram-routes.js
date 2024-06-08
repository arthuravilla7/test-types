import express from 'express'
import { 
  buildAccessTokenUrl,
  buildFacebookBusinessAccountUrl,
  buildFacebookUserProfileUrl,
  buildInstagramBusinessAccountUrl,
  buildInstagramUserMediaUrl,
  fetchAccessToken, 
  fetchFacebookBusinessAccountData, 
  fetchFacebookUserProfile, 
  fetchInstagramBusinessAccount,
  fetchInstagramUserMedia
} from '../services/instagram-service.js';

const router = express.Router()

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID

router.get('/instagram-insight', (req, res) => {
  res.render('instagram-insight', req.session.facebookData ? req.session.facebookData : { facebookUserId: null, facebookName: null })
})

router.get('/facebook-login', (req, res) => {
  res.redirect(`https://www.facebook.com/v20.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${encodeURIComponent('http://localhost:3000/facebook-oauth-redirect')}&response_type=code&scope=pages_show_list,instagram_basic,business_management`)
});

router.get('/facebook-oauth-redirect', async (req, res) => {
  try {
    const authCode = req.query.code;

    const accessTokenUrl = buildAccessTokenUrl(authCode)
    // Make an API request to exchange `authCode` for an access token
    const accessToken = await fetchAccessToken(accessTokenUrl)

    const userProfileUrl = buildFacebookUserProfileUrl(accessToken)
    const { id: facebookUserId, name: facebookName } = await fetchFacebookUserProfile(userProfileUrl)

    const facebookAccountUrl = buildFacebookBusinessAccountUrl(facebookUserId, accessToken)
    const facebookAccountData = await fetchFacebookBusinessAccountData(facebookAccountUrl)

    // pegando a primeira account da lista. Se for possivel retornar mais de um vamos ter q mudar a logica da tela
    const facebookBusinessAccountId = facebookAccountData.data[0].id 
    
    const instagramAccountUrl = buildInstagramBusinessAccountUrl(facebookBusinessAccountId, accessToken)
    const igBusinessAccounts = await fetchInstagramBusinessAccount(instagramAccountUrl);
    const { id: instagramBusinessAccountId, name: instagramPageName, username } = igBusinessAccounts.instagram_business_account;

    const instagramUserMediaUrl = buildInstagramUserMediaUrl(instagramBusinessAccountId, accessToken)
    const instagramMediaList = await fetchInstagramUserMedia(instagramUserMediaUrl)

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

export default router