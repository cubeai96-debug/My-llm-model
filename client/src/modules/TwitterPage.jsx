import { useEffect } from 'react'
import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  update,
  get,
  serverTimestamp,
  query,
  orderByChild,
} from 'firebase/database'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function TwitterPage() {
  useEffect(() => {
    // Initialize Firebase app once
    const firebaseConfig = {
      apiKey: 'AIzaSyDREserVMmKGzXJfZ2-AcmVeZRdO25TqYU',
      authDomain: 'gold-b0fe0.firebaseapp.com',
      databaseURL: 'https://gold-b0fe0-default-rtdb.firebaseio.com',
      projectId: 'gold-b0fe0',
      storageBucket: 'gold-b0fe0.firebasestorage.app',
      messagingSenderId: '862612901704',
      appId: '1:862612901704:web:f4d1436db8a0d2e097ad7d',
      measurementId: 'G-9SBHNV4FZM',
    }

    const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getDatabase(app)
    const storage = getStorage(app)
    const provider = new GoogleAuthProvider()

    // DOM elements
    const sections = {
      home: document.getElementById('timeline'),
      search: document.getElementById('search-section'),
      notifications: document.getElementById('notifications-section'),
      compose: document.getElementById('compose-section'),
      profile: document.getElementById('profile-section'),
      login: document.getElementById('login-section'),
      register: document.getElementById('register-section'),
    }

    const navLinks = {
      home: document.getElementById('nav-home'),
      search: document.getElementById('nav-search'),
      notifications: document.getElementById('nav-notifications'),
      profile: document.getElementById('nav-profile'),
    }

    const pageTitle = document.getElementById('page-title')
    const composeBtn = document.getElementById('compose-btn')
    const composeBackBtn = document.getElementById('compose-back-btn')
    const composeTextarea = document.getElementById('compose-textarea')
    const composeCharCount = document.getElementById('compose-char-count')
    const composeTweetBtn = document.getElementById('compose-tweet-btn')
    const composeMediaInput = document.getElementById('compose-media-input')
    const composeMediaPreview = document.getElementById('compose-media-preview')
    const searchInput = document.getElementById('search-input')
    const searchResults = document.getElementById('search-results')
    const notificationsList = document.getElementById('notifications-list')
    const notifBadge = document.getElementById('notif-badge')
    const profileName = document.getElementById('profile-name')
    const profileUsername = document.getElementById('profile-username')
    const profileAvatar = document.getElementById('profile-avatar')
    const profileTweetsSection = document.getElementById('profile-tweets')
    const logoutBtn = document.getElementById('logout-btn')
    const composeUserAvatar = document.getElementById('compose-user-avatar')
    const profileDescription = document.getElementById('profile-description')
    const saveProfileBtn = document.getElementById('save-profile-btn')
    const bottomNav = document.getElementById('bottom-nav')
    const navProfileIcon = document.getElementById('nav-profile-icon')
    const loginForm = document.getElementById('login-form')
    const registerForm = document.getElementById('register-form')
    const googleLoginBtn = document.getElementById('google-login-btn')
    const showRegisterBtn = document.getElementById('show-register-btn')
    const showLoginBtn = document.getElementById('show-login-btn')
    const mentionSuggestions = document.getElementById('mention-suggestions')

    // State (closure)
    let currentUser = null
    let unreadNotifications = 0
    let tweets = []
    let users = []
    let mentionActive = false
    let mentionQuery = ''
    let mentionStartPos = 0
    let mentionSelectedIndex = 0
    let pendingOpenTweetId = null
    let theme = localStorage.getItem('mt-theme') || 'light'
    let infiniteEnabled = JSON.parse(localStorage.getItem('mt-infinite') || 'true')
    let optimisticEnabled = JSON.parse(localStorage.getItem('mt-optimistic') || 'true')
    let infinitePage = 1
    let pageSize = 20
    let uploadingFile = null
    let tweetsLoaded = false
    let blockedUids = new Set()

    // Utility: time ago (tr)
    function timeAgo(date) {
      const seconds = Math.floor((new Date() - date) / 1000)
      if (seconds < 60) return `${seconds}sn`
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}dk`
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}sa`
      const days = Math.floor(hours / 24)
      return `${days}g`
    }

    function escapeHtml(text) {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    }

    function createTweetElement(tweet) {
      const likedClass = tweet.liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
      const contentHtml = escapeHtml(tweet.content)
        .replace(/@(\w+)/g, '<a href="#" data-mention="$1" class="text-blue-600 font-semibold hover:underline">@$1<\/a>')
        .replace(/#(\w+)/g, '<a href="#" data-hashtag="$1" class="text-blue-600 font-semibold hover:underline">#$1<\/a>')
      let mediaHtml = ''
      if (tweet.mediaUrl) {
        const isVideo = /\.(mp4|webm|ogg)$/i.test(tweet.mediaUrl)
        mediaHtml = isVideo
          ? `<video src="${tweet.mediaUrl}" class="mt-2 rounded max-h-96 w-full" controls></video>`
          : `<img src="${tweet.mediaUrl}" alt="tweet medya" class="mt-2 rounded max-h-96 w-full object-cover" />`
      }
      return `
        <article data-open-id="${tweet.id}" tabindex="0" aria-label="Tweet by ${tweet.user.name} (@${tweet.user.username})" class="p-4 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex flex-col border-b border-gray-200">
          <div class="flex space-x-3">
            <img src="${tweet.user.avatar}" alt="${tweet.user.name} profil fotoğrafı" class="w-12 h-12 rounded-full object-cover flex-shrink-0" width="48" height="48" />
            <div class="flex-grow">
              <header class="flex items-center space-x-2">
                <button data-profile-uid="${tweet.user.uid}" class="font-semibold text-gray-900 hover:underline">${tweet.user.name}</button>
                <span class="text-gray-500 text-sm">@${tweet.user.username}</span>
                <span aria-hidden="true" class="text-gray-500 text-sm">·</span>
                <time datetime="${tweet.date}" class="text-gray-500 text-sm">${timeAgo(new Date(tweet.date))}</time>
              </header>
              <p class="mt-1 text-gray-800 whitespace-pre-wrap">${contentHtml}</p>
              ${mediaHtml}
              <nav class="mt-3 flex justify-between max-w-xs text-gray-500 text-sm" aria-label="Tweet actions">
                <button data-id="${tweet.id}" data-action="reply" class="flex items-center space-x-1 hover:text-blue-600 focus:outline-none focus:text-blue-600" aria-label="Yanıtla">
                  <i class="far fa-comment"></i>
                  <span>${tweet.replies || 0}</span>
                </button>
                <button data-id="${tweet.id}" data-action="retweet" class="flex items-center space-x-1 hover:text-green-600 focus:outline-none focus:text-green-600" aria-label="Retweet">
                  <i class="fas fa-retweet"></i>
                  <span>${tweet.retweets || 0}</span>
                </button>
                <button data-id="${tweet.id}" data-action="like" class="flex items-center space-x-1 ${likedClass} focus:outline-none" aria-label="Beğen">
                  <i class="fas fa-heart"></i>
                  <span>${tweet.likes || 0}</span>
                </button>
                <button data-id="${tweet.id}" data-action="share" class="flex items-center space-x-1 hover:text-blue-600 focus:outline-none focus:text-blue-600" aria-label="Paylaş">
                  <i class="fas fa-share"></i>
                </button>
              </nav>
            </div>
          </div>
        </article>
      `
    }

    function renderTimeline() {
      if (!sections.home) return
      if (!tweetsLoaded) {
        sections.home.innerHTML = Array.from({ length: 6 }).map(() => `
          <div class="p-4 border-b border-gray-200 animate-pulse">
            <div class="flex space-x-3">
              <div class="w-12 h-12 rounded-full bg-gray-200"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 w-1/3 rounded"></div>
                <div class="h-3 bg-gray-200 w-2/3 rounded"></div>
                <div class="h-3 bg-gray-200 w-1/2 rounded"></div>
              </div>
            </div>
          </div>
        `).join('')
        return
      }
      if (!tweets.length) {
        sections.home.innerHTML = '<p class="text-center text-gray-500 py-6">Henüz tweet yok.</p>'
        return
      }
      const slice = tweets.filter(t => !blockedUids.has(t.user.uid)).slice(0, pageSize * infinitePage)
      sections.home.innerHTML = slice.map(t => createTweetElement(t)).join('')
      const sentinel = document.createElement('div')
      sentinel.id = 'infinite-sentinel'
      sentinel.className = 'py-6 text-center text-gray-400'
      sentinel.textContent = infiniteEnabled && slice.length < tweets.length ? 'Daha fazla yüklemek için aşağı kaydırın' : ''
      sections.home.appendChild(sentinel)
    }

    function renderProfileTweets() {
      if (!profileTweetsSection || !currentUser) return
      const userTweets = tweets.filter(t => t.user.uid === currentUser.uid)
      if (!userTweets.length) {
        profileTweetsSection.innerHTML = '<p class="text-center text-gray-500 py-6">Henüz tweet yok.</p>'
        return
      }
      profileTweetsSection.innerHTML = userTweets.map(t => createTweetElement(t)).join('')
    }

    function renderNotifications(notifications) {
      if (!notificationsList) return
      if (!notifications.length) {
        notificationsList.innerHTML = '<li class="text-gray-500 text-center py-6">Bildirim yok.</li>'
        return
      }
      notificationsList.innerHTML = notifications.map(notif => {
        const readClass = notif.read ? 'bg-white' : 'bg-blue-50'
        let text = 'Yeni bildirim'
        switch (notif.type) {
          case 'like': text = `${notif.userName} tweetinizi beğendi.`; break
          case 'retweet': text = `${notif.userName} tweetinizi retweetledi.`; break
          case 'reply': text = `${notif.userName} tweetinize yanıt verdi.`; break
          case 'mention': text = `${notif.userName} sizden bahsetti.`; break
          case 'follow': text = `${notif.userName} sizi takip etmeye başladı.`; break
        }
        return `
          <li tabindex="0" class="p-3 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 focus:outline-none ${readClass}" aria-label="${text}">
            <div class="flex items-center space-x-3">
              <img src="${notif.userAvatar}" alt="${notif.userName} profil fotoğrafı" class="w-10 h-10 rounded-full object-cover" width="40" height="40" />
              <div>
                <p class="text-gray-8