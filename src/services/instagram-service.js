import axios from 'axios'

const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET
const BASE_URL = process.env.BASE_URL

export const buildAccessTokenUrl = (authCode) => {
    const accessTokenUrl = 'https://graph.facebook.com/v20.0/oauth/access_token?' +
        `client_id=${FACEBOOK_CLIENT_ID}&` +
        `client_secret=${FACEBOOK_CLIENT_SECRET}&` +
        `redirect_uri=${encodeURIComponent(`${BASE_URL}/facebook-oauth-redirect`)}&` +
        `code=${encodeURIComponent(authCode)}`
    return accessTokenUrl
}

export const fetchAccessToken = async (accessTokenUrl) => {
    const accessToken = await axios.get(accessTokenUrl).then(res => res.data['access_token'])
    return accessToken
}

export const buildFacebookUserProfileUrl = (accessToken) => {
    const userProfileUrl = `https://graph.facebook.com/me?access_token=${encodeURIComponent(accessToken)}`
    return userProfileUrl
}

export const fetchFacebookUserProfile = async (userProfileUrl) => {
    const userProfileData = await axios.get(userProfileUrl).then(res => res.data )
    return userProfileData
}

export const buildFacebookBusinessAccountUrl = (facebookUserId, accessToken) => {
    const facebookBusinessAccountUrl = `https://graph.facebook.com/v20.0/${facebookUserId}/accounts?access_token=${accessToken}`
    return facebookBusinessAccountUrl
}

export const fetchFacebookBusinessAccountData = async (facebookAccountUrl) => {
    const facebookBusinessAccountData = await axios.get(facebookAccountUrl).then(res => res.data )
    return facebookBusinessAccountData
}

export const buildInstagramBusinessAccountUrl = (facebookBusinessAccountId, accessToken) => {
    const instagramAccountUrl = `https://graph.facebook.com/v20.0/${facebookBusinessAccountId}/?fields=instagram_business_account{id,name,username}&access_token=${accessToken}`
    return instagramAccountUrl
}

export const fetchInstagramBusinessAccount = async (instagramAccountUrl) => {
    const igBusinessAccount = await axios.get(instagramAccountUrl).then(res => res.data )
    return igBusinessAccount
}

export const buildInstagramUserMediaUrl = (instagramBusinessAccountId, accessToken) => {
    const InstagramUserMediaUrl = `https://graph.facebook.com/v20.0/${instagramBusinessAccountId}/media?fields=id,caption,timestamp,comments,media_url&access_token=${accessToken}`
    return InstagramUserMediaUrl
}

export const fetchInstagramUserMedia = async (instagramUserMediaUrl) => {
    const instagramUserMedia = await axios.get(instagramUserMediaUrl).then(res => res.data )
    return instagramUserMedia
}