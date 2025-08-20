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
        .replace(/@(\w+)/g, '<span class="text-blue-600 font-semibold">@$1<\/span>')
        .replace(/#(\w+)/g, '<span class="text-blue-600 font-semibold">#$1<\/span>')
      return `
        <article tabindex="0" aria-label="Tweet by ${tweet.user.name} (@${tweet.user.username})" class="p-4 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex flex-col border-b border-gray-200">
          <div class="flex space-x-3">
            <img src="${tweet.user.avatar}" alt="${tweet.user.name} profil fotoğrafı" class="w-12 h-12 rounded-full object-cover flex-shrink-0" width="48" height="48" />
            <div class="flex-grow">
              <header class="flex items-center space-x-2">
                <h2 class="font-semibold text-gray-900">${tweet.user.name}</h2>
                <span class="text-gray-500 text-sm">@${tweet.user.username}</span>
                <span aria-hidden="true" class="text-gray-500 text-sm">·</span>
                <time datetime="${tweet.date}" class="text-gray-500 text-sm">${timeAgo(new Date(tweet.date))}</time>
              </header>
              <p class="mt-1 text-gray-800 whitespace-pre-wrap">${contentHtml}</p>
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
      if (!tweets.length) {
        sections.home.innerHTML = '<p class="text-center text-gray-500 py-6">Henüz tweet yok.</p>'
        return
      }
      sections.home.innerHTML = tweets.map(t => createTweetElement(t)).join('')
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
          case 'follow': text = `${notif.userName} sizi takip etmeye başladı.`; break
        }
        return `
          <li tabindex="0" class="p-3 rounded border border-gray-200 cursor-pointer hover:bg-gray-100 focus:outline-none ${readClass}" aria-label="${text}">
            <div class="flex items-center space-x-3">
              <img src="${notif.userAvatar}" alt="${notif.userName} profil fotoğrafı" class="w-10 h-10 rounded-full object-cover" width="40" height="40" />
              <div>
                <p class="text-gray-800">${text}</p>
                <time class="text-gray-500 text-xs">${timeAgo(new Date(notif.date))}</time>
              </div>
            </div>
          </li>
        `
      }).join('')
    }

    function updateNotifBadge(count) {
      if (!notifBadge) return
      if (count > 0) {
        notifBadge.style.display = 'flex'
        notifBadge.textContent = count > 99 ? '99+' : String(count)
      } else {
        notifBadge.style.display = 'none'
      }
    }

    function hideAllSections() {
      Object.values(sections).forEach(sec => { if (sec) sec.classList.add('hidden') })
    }

    function setActiveNav(key) {
      Object.entries(navLinks).forEach(([k, el]) => {
        if (!el) return
        if (k === key) {
          el.classList.remove('text-gray-500')
          el.classList.add('text-blue-600')
          el.querySelector('i')?.classList.remove('text-gray-500')
          el.querySelector('i')?.classList.add('text-blue-600')
          el.querySelector('span')?.classList.remove('opacity-0')
          el.querySelector('span')?.classList.add('opacity-100')
          if (k === 'home') {
            el.querySelector('div')?.classList.add('bg-blue-100')
          } else {
            el.querySelector('div')?.classList.remove('bg-blue-100')
          }
        } else {
          el.classList.add('text-gray-500')
          el.classList.remove('text-blue-600')
          el.querySelector('i')?.classList.add('text-gray-500')
          el.querySelector('i')?.classList.remove('text-blue-600')
          el.querySelector('span')?.classList.add('opacity-0')
          el.querySelector('span')?.classList.remove('opacity-100')
          el.querySelector('div')?.classList.remove('bg-blue-100')
        }
      })
    }

    function navigateTo(page, extra = {}) {
      hideAllSections()
      switch (page) {
        case 'home':
          if (!currentUser) return showLogin()
          sections.home?.classList.remove('hidden')
          if (pageTitle) pageTitle.textContent = 'MiniTwitter'
          if (composeBtn) composeBtn.style.display = 'flex'
          if (bottomNav) bottomNav.style.display = 'flex'
          setActiveNav('home')
          break
        case 'search':
          if (!currentUser) return showLogin()
          sections.search?.classList.remove('hidden')
          if (pageTitle) pageTitle.textContent = 'Ara'
          if (composeBtn) composeBtn.style.display = 'none'
          if (bottomNav) bottomNav.style.display = 'flex'
          setActiveNav('search')
          renderSearchResults(searchInput?.value || '')
          break
        case 'notifications':
          if (!currentUser) return showLogin()
          sections.notifications?.classList.remove('hidden')
          if (pageTitle) pageTitle.textContent = 'Bildirimler'
          if (composeBtn) composeBtn.style.display = 'none'
          if (bottomNav) bottomNav.style.display = 'flex'
          setActiveNav('notifications')
          markNotificationsRead()
          break
        case 'compose':
          if (!currentUser) return showLogin()
          sections.compose?.classList.remove('hidden')
          if (pageTitle) pageTitle.textContent = 'Yeni Tweet'
          if (composeBtn) composeBtn.style.display = 'none'
          if (bottomNav) bottomNav.style.display = 'none'
          setActiveNav(null)
          composeTextarea?.focus()
          break
        case 'profile':
          if (!currentUser) return showLogin()
          if (extra.uid && extra.uid !== currentUser.uid) {
            showUserProfile(extra.uid)
            if (bottomNav) bottomNav.style.display = 'flex'
            if (composeBtn) composeBtn.style.display = 'none'
            setActiveNav(null)
            if (pageTitle) pageTitle.textContent = 'Profil'
            return
          }
          sections.profile?.classList.remove('hidden')
          if (pageTitle) pageTitle.textContent = 'Profil'
          if (composeBtn) composeBtn.style.display = 'none'
          if (bottomNav) bottomNav.style.display = 'flex'
          setActiveNav('profile')
          loadProfile()
          break
        case 'login':
          showLogin(); break
        case 'register':
          showRegister(); break
      }
    }

    function showLogin() {
      hideAllSections()
      sections.login?.classList.remove('hidden')
      if (pageTitle) pageTitle.textContent = 'Giriş Yap'
      if (composeBtn) composeBtn.style.display = 'none'
      if (bottomNav) bottomNav.style.display = 'none'
      setActiveNav(null)
    }

    function showRegister() {
      hideAllSections()
      sections.register?.classList.remove('hidden')
      if (pageTitle) pageTitle.textContent = 'Kayıt Ol'
      if (composeBtn) composeBtn.style.display = 'none'
      if (bottomNav) bottomNav.style.display = 'none'
      setActiveNav(null)
    }

    function clearComposeForm() {
      if (!composeTextarea || !composeCharCount || !composeTweetBtn) return
      composeTextarea.value = ''
      composeCharCount.textContent = '280'
      composeTweetBtn.disabled = true
      hideMentionSuggestions()
    }

    function loadProfile() {
      if (!currentUser) return
      if (profileName) profileName.textContent = currentUser.displayName || 'Kullanıcı'
      if (profileUsername) profileUsername.textContent = `@${currentUser.email.split('@')[0]}`
      const avatar = currentUser.photoURL || 'https://placehold.co/96x96/png?text=U&bg=3b82f6&fg=fff'
      if (profileAvatar) profileAvatar.src = avatar
      if (composeUserAvatar) composeUserAvatar.src = avatar
      const userRef = ref(db, `users/${currentUser.uid}`)
      get(userRef).then(snapshot => {
        const data = snapshot.val() || {}
        if (profileDescription) profileDescription.value = data.description || ''
        if (profileDescription) profileDescription.disabled = false
        if (saveProfileBtn) saveProfileBtn.style.display = 'inline-block'
        if (logoutBtn) logoutBtn.style.display = 'inline-block'
      })
      renderProfileTweets()
    }

    saveProfileBtn?.addEventListener('click', () => {
      if (!currentUser) return
      const desc = (profileDescription?.value || '').trim()
      const userRef = ref(db, `users/${currentUser.uid}`)
      update(userRef, { description: desc })
        .then(() => alert('Profil güncellendi.'))
        .catch(() => alert('Profil güncellenirken hata oluştu.'))
    })

    function fetchTweets() {
      const tweetsRef = ref(db, 'tweets')
      const tweetsQuery = query(tweetsRef, orderByChild('date'))
      const unsubscribe = onValue(tweetsQuery, snapshot => {
        const data = snapshot.val() || {}
        tweets = Object.values(data)
          .map(t => ({
            ...t,
            liked: t.likesBy ? !!t.likesBy[currentUser?.uid || ''] : false,
            retweeted: t.retweetsBy ? !!t.retweetsBy[currentUser?.uid || ''] : false,
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
        renderTimeline()
        renderProfileTweets()
      })
      unsubscribers.push(unsubscribe)
    }

    function fetchNotifications() {
      const notifRef = ref(db, `notifications/${currentUser.uid}`)
      const unsubscribe = onValue(notifRef, snapshot => {
        const data = snapshot.val() || {}
        const notifications = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date))
        unreadNotifications = notifications.filter(n => !n.read).length
        updateNotifBadge(unreadNotifications)
        renderNotifications(notifications)
      })
      unsubscribers.push(unsubscribe)
    }

    function markNotificationsRead() {
      const notifRef = ref(db, `notifications/${currentUser.uid}`)
      get(notifRef).then(snapshot => {
        const data = snapshot.val() || {}
        const updatesObj = {}
        Object.entries(data).forEach(([key, notif]) => {
          if (!notif.read) updatesObj[`${key}/read`] = true
        })
        if (Object.keys(updatesObj).length > 0) update(notifRef, updatesObj)
      })
      unreadNotifications = 0
      updateNotifBadge(0)
    }

    function addNotification(toUid, type, fromUser, tweetId = null) {
      if (toUid === fromUser.uid) return
      const notifRef = ref(db, `notifications/${toUid}`)
      const newNotifRef = push(notifRef)
      set(newNotifRef, {
        type,
        userName: fromUser.displayName || fromUser.email.split('@')[0],
        userAvatar: fromUser.photoURL || 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff',
        tweetId: tweetId || null,
        date: serverTimestamp(),
        read: false,
      })
    }

    composeTextarea?.addEventListener('input', e => {
      const length = (composeTextarea.value || '').trim().length
      if (composeCharCount) composeCharCount.textContent = String(280 - length)
      if (composeTweetBtn) composeTweetBtn.disabled = length === 0 || length > 280
      handleMentionSuggestions(e)
    })

    composeTweetBtn?.addEventListener('click', () => {
      const content = (composeTextarea?.value || '').trim()
      if (!content || !currentUser) return
      const tweetsRef = ref(db, 'tweets')
      const newTweetRef = push(tweetsRef)
      set(newTweetRef, {
        id: newTweetRef.key,
        user: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Kullanıcı',
          username: currentUser.email.split('@')[0],
          avatar: currentUser.photoURL || 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff',
        },
        content,
        date: new Date().toISOString(),
        likes: 0,
        retweets: 0,
        replies: 0,
        likesBy: {},
        retweetsBy: {},
        repliesBy: {},
      })
      clearComposeForm()
      navigateTo('home')
    })

    composeBackBtn?.addEventListener('click', () => { clearComposeForm(); navigateTo('home') })

    searchInput?.addEventListener('input', e => { renderSearchResults(e.target.value) })

    function renderSearchResults(queryStr = '') {
      if (!searchResults) return
      const q = (queryStr || '').toLowerCase()
      if (!q) {
        searchResults.innerHTML = '<li class="text-gray-500 text-center py-6">Arama için bir şeyler yazın.</li>'
        return
      }
      const filteredUsers = users.filter(u => (u.name && u.name.toLowerCase().includes(q)) || (u.username && u.username.toLowerCase().includes(q)))
      const filteredTweets = tweets.filter(t => t.content.toLowerCase().includes(q))
      let html = ''
      if (filteredUsers.length > 0) {
        html += '<li><h3 class="font-semibold text-gray-700 mb-2">Kullanıcılar</h3></li>'
        filteredUsers.forEach(user => {
          html += `
            <li class="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer" tabindex="0" role="button" aria-label="${user.name} profiline git" data-uid="${user.uid}">
              <img src="${user.avatar || 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff'}" alt="${user.name} profil fotoğrafı" class="w-10 h-10 rounded-full object-cover" width="40" height="40" />
              <div>
                <p class="font-semibold text-gray-900">${user.name}</p>
                <p class="text-gray-500 text-sm">@${user.username}</p>
              </div>
            </li>
          `
        })
      }
      if (filteredTweets.length > 0) {
        html += '<li><h3 class="font-semibold text-gray-700 mt-4 mb-2">Tweetler</h3></li>'
        filteredTweets.forEach(tweet => {
          html += `
            <li class="p-3 border border-gray-200 rounded mb-2 cursor-pointer hover:bg-gray-100" tabindex="0" role="button" aria-label="${tweet.user.name} tarafından yazılan tweet">
              <p class="text-gray-800">${escapeHtml(tweet.content)}</p>
              <p class="text-gray-500 text-xs mt-1">@${tweet.user.username} · ${timeAgo(new Date(tweet.date))}</p>
            </li>
          `
        })
      }
      if (html === '') html = '<li class="text-gray-500 text-center py-6">Sonuç bulunamadı.</li>'
      searchResults.innerHTML = html
    }

    searchResults?.addEventListener('click', e => {
      const li = e.target.closest('li[data-uid]')
      if (!li) return
      const uid = li.getAttribute('data-uid')
      if (!uid) return
      navigateTo('profile', { uid })
    })

    function showUserProfile(uid) {
      if (!uid) return
      const usersRef = ref(db, `users/${uid}`)
      get(usersRef).then(snapshot => {
        const user = snapshot.val()
        if (!user) return
        hideAllSections()
        sections.profile?.classList.remove('hidden')
        if (pageTitle) pageTitle.textContent = user.name
        if (composeBtn) composeBtn.style.display = 'none'
        if (bottomNav) bottomNav.style.display = 'flex'
        setActiveNav(null)
        if (profileName) profileName.textContent = user.name
        if (profileUsername) profileUsername.textContent = `@${user.username}`
        if (profileAvatar) profileAvatar.src = user.avatar || 'https://placehold.co/96x96/png?text=U&bg=3b82f6&fg=fff'
        if (profileDescription) profileDescription.value = user.description || ''
        if (profileDescription) profileDescription.disabled = true
        if (saveProfileBtn) saveProfileBtn.style.display = 'none'
        if (logoutBtn) logoutBtn.style.display = 'none'
        const userTweets = tweets.filter(t => t.user.uid === uid)
        if (!userTweets.length) {
          profileTweetsSection.innerHTML = '<p class="text-center text-gray-500 py-6">Henüz tweet yok.</p>'
          return
        }
        profileTweetsSection.innerHTML = userTweets.map(t => createTweetElement(t)).join('')
      })
    }

    logoutBtn?.addEventListener('click', () => { signOut(auth) })

    navLinks.home?.addEventListener('click', e => { e.preventDefault(); navigateTo('home') })
    navLinks.search?.addEventListener('click', e => { e.preventDefault(); navigateTo('search') })
    navLinks.notifications?.addEventListener('click', e => { e.preventDefault(); navigateTo('notifications') })
    navLinks.profile?.addEventListener('click', e => { e.preventDefault(); navigateTo('profile') })

    Object.values(navLinks).forEach(link => {
      link?.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); link.click() }
      })
    })

    composeBtn?.addEventListener('click', () => { navigateTo('compose') })

    loginForm?.addEventListener('submit', e => {
      e.preventDefault()
      const email = document.getElementById('login-email')?.value?.trim()
      const password = document.getElementById('login-password')?.value?.trim()
      if (!email || !password) return
      signInWithEmailAndPassword(auth, email, password)
        .then(() => { loginForm.reset() })
        .catch(error => { alert('Giriş başarısız: ' + error.message) })
    })

    registerForm?.addEventListener('submit', e => {
      e.preventDefault()
      const name = document.getElementById('register-name')?.value?.trim()
      const email = document.getElementById('register-email')?.value?.trim()
      const password = document.getElementById('register-password')?.value?.trim()
      if (!name || !email || !password) return
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          updateProfile(userCredential.user, {
            displayName: name,
            photoURL: 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff',
          })
          const userRef = ref(db, `users/${userCredential.user.uid}`)
          set(userRef, {
            uid: userCredential.user.uid,
            name,
            username: email.split('@')[0],
            email,
            avatar: 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff',
            description: '',
          })
          registerForm.reset()
        })
        .catch(error => { alert('Kayıt başarısız: ' + error.message) })
    })

    googleLoginBtn?.addEventListener('click', () => {
      signInWithPopup(auth, provider)
        .then(result => {
          const user = result.user
          const userRef = ref(db, `users/${user.uid}`)
          get(userRef).then(snapshot => {
            if (!snapshot.exists()) {
              set(userRef, {
                uid: user.uid,
                name: user.displayName || 'Kullanıcı',
                username: user.email.split('@')[0],
                email: user.email,
                avatar: user.photoURL || 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff',
                description: '',
              })
            }
          })
        })
        .catch(error => { alert('Google ile giriş başarısız: ' + error.message) })
    })

    showRegisterBtn?.addEventListener('click', () => { showRegister() })
    showLoginBtn?.addEventListener('click', () => { showLogin() })

    sections.home?.addEventListener('click', e => {
      const btn = e.target.closest('button[data-action]')
      if (!btn) return
      const id = btn.getAttribute('data-id')
      const action = btn.getAttribute('data-action')
      const tweet = tweets.find(t => t.id === id)
      if (!tweet) return
      const tweetRef = ref(db, `tweets/${id}`)
      switch (action) {
        case 'like': {
          const userLikesRef = ref(db, `tweets/${id}/likesBy/${currentUser.uid}`)
          if (tweet.liked) {
            set(userLikesRef, null)
            update(tweetRef, { likes: (tweet.likes || 1) - 1 })
          } else {
            set(userLikesRef, true)
            update(tweetRef, { likes: (tweet.likes || 0) + 1 })
            addNotification(tweet.user.uid, 'like', currentUser, id)
          }
          break
        }
        case 'retweet': {
          const userRetweetsRef = ref(db, `tweets/${id}/retweetsBy/${currentUser.uid}`)
          if (tweet.retweeted) {
            set(userRetweetsRef, null)
            update(tweetRef, { retweets: (tweet.retweets || 1) - 1 })
          } else {
            set(userRetweetsRef, true)
            update(tweetRef, { retweets: (tweet.retweets || 0) + 1 })
            addNotification(tweet.user.uid, 'retweet', currentUser, id)
          }
          break
        }
        case 'reply':
          alert('Yanıtla fonksiyonu henüz aktif değil.'); break
        case 'share':
          alert('Paylaş fonksiyonu henüz aktif değil.'); break
      }
    })

    notificationsList?.addEventListener('click', () => { if (currentUser) markNotificationsRead() })

    const unsubscribers = []
    const offAuth = onAuthStateChanged(getAuth(), user => {
      currentUser = user
      if (user) {
        navigateTo('home')
        const photoURL = user.photoURL || 'https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff'
        if (composeUserAvatar) composeUserAvatar.src = photoURL
        if (navProfileIcon) navProfileIcon.src = photoURL
        fetchUsers()
        fetchTweets()
        fetchNotifications()
        const userRef = ref(db, `users/${user.uid}`)
        get(userRef).then(snapshot => {
          if (!snapshot.exists()) {
            set(userRef, {
              uid: user.uid,
              name: user.displayName || 'Kullanıcı',
              username: user.email.split('@')[0],
              email: user.email,
              avatar: photoURL,
              description: '',
            })
          }
        })
      } else {
        navigateTo('login')
        if (navProfileIcon) navProfileIcon.src = 'https://placehold.co/24x24/png?text=U&bg=3b82f6&fg=fff'
      }
    })

    function fetchUsers() {
      const usersRef = ref(db, 'users')
      const unsubscribe = onValue(usersRef, snapshot => {
        const data = snapshot.val() || {}
        users = Object.values(data)
      })
      unsubscribers.push(unsubscribe)
    }

    function handleMentionSuggestions(e) {
      if (!composeTextarea) return
      const cursorPos = composeTextarea.selectionStart
      const text = composeTextarea.value
      const lastAt = text.lastIndexOf('@', cursorPos - 1)
      if (lastAt === -1 || (lastAt > 0 && /\S/.test(text[lastAt - 1]))) {
        hideMentionSuggestions()
        mentionActive = false
        return
      }
      const afterAt = text.slice(lastAt + 1, cursorPos)
      if (/\s/.test(afterAt)) {
        hideMentionSuggestions()
        mentionActive = false
        return
      }
      mentionActive = true
      mentionQuery = afterAt.toLowerCase()
      mentionStartPos = lastAt + 1
      const filtered = users.filter(u => u.username?.toLowerCase().startsWith(mentionQuery) || (u.name && u.name.toLowerCase().startsWith(mentionQuery))).slice(0, 5)
      if (filtered.length === 0) { hideMentionSuggestions(); return }
      showMentionSuggestions(filtered)
    }

    function showMentionSuggestions(list) {
      if (!mentionSuggestions) return
      mentionSuggestions.innerHTML = list.map((user, i) => `
        <li role="option" tabindex="0" data-username="${user.username}" class="${i === 0 ? 'active' : ''}">
          <img src="${user.avatar || 'https://placehold.co/24x24/png?text=U&bg=3b82f6&fg=fff'}" alt="${user.name} profil fotoğrafı" class="inline-block w-6 h-6 rounded-full object-cover mr-2" />
          <span>${user.name} (@${user.username})</span>
        </li>
      `).join('')
      mentionSuggestions.classList.remove('hidden')
      mentionSelectedIndex = 0
    }

    function hideMentionSuggestions() {
      if (!mentionSuggestions) return
      mentionSuggestions.classList.add('hidden')
      mentionSuggestions.innerHTML = ''
      mentionActive = false
      mentionSelectedIndex = 0
    }

    function insertMention(username) {
      if (!composeTextarea) return
      const text = composeTextarea.value
      const before = text.slice(0, mentionStartPos)
      const after = text.slice(composeTextarea.selectionStart)
      const newText = before + username + ' ' + after
      composeTextarea.value = newText
      composeTextarea.focus()
      const pos = before.length + username.length + 1
      composeTextarea.setSelectionRange(pos, pos)
      hideMentionSuggestions()
      composeTextarea.dispatchEvent(new Event('input'))
    }

    composeTextarea?.addEventListener('keydown', e => {
      if (!mentionActive || !mentionSuggestions) return
      const items = mentionSuggestions.querySelectorAll('li')
      if (items.length === 0) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        mentionSelectedIndex = (mentionSelectedIndex + 1) % items.length
        updateMentionActiveItem(items)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        mentionSelectedIndex = (mentionSelectedIndex - 1 + items.length) % items.length
        updateMentionActiveItem(items)
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        const selected = items[mentionSelectedIndex]
        if (selected) insertMention(selected.getAttribute('data-username'))
      } else if (e.key === 'Escape') {
        hideMentionSuggestions()
      }
    })

    function updateMentionActiveItem(items) {
      items.forEach((item, i) => {
        if (i === mentionSelectedIndex) {
          item.classList.add('active')
          item.scrollIntoView({ block: 'nearest' })
        } else {
          item.classList.remove('active')
        }
      })
    }

    mentionSuggestions?.addEventListener('click', e => {
      const li = e.target.closest('li')
      if (!li) return
      const username = li.getAttribute('data-username')
      if (username) insertMention(username)
    })

    mentionSuggestions?.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const li = e.target.closest('li')
        if (!li) return
        const username = li.getAttribute('data-username')
        if (username) insertMention(username)
      }
    })

    if (composeTweetBtn) composeTweetBtn.disabled = true

    return () => {
      // Cleanup subscriptions and listeners
      offAuth()
      unsubscribers.forEach(unsub => { try { unsub() } catch {} })
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <style>{`
        body { font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'; background-color: #e6ecf0; }
        #timeline, #search-results, #notifications-list { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        #timeline::-webkit-scrollbar, #search-results::-webkit-scrollbar, #notifications-list::-webkit-scrollbar { width: 8px; }
        #timeline::-webkit-scrollbar-track, #search-results::-webkit-scrollbar-track, #notifications-list::-webkit-scrollbar-track { background: transparent; }
        #timeline::-webkit-scrollbar-thumb, #search-results::-webkit-scrollbar-thumb, #notifications-list::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
        #mention-suggestions { position: absolute; background: white; border: 1px solid #cbd5e1; border-radius: 0.375rem; max-height: 200px; overflow-y: auto; width: 100%; z-index: 1000; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        #mention-suggestions li { padding: 0.5rem 1rem; cursor: pointer; }
        #mention-suggestions li:hover, #mention-suggestions li.active { background-color: #3b82f6; color: white; }
      `}</style>

      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 flex items-center justify-center h-14 shadow-sm">
        <h1 className="text-xl font-bold text-blue-600 select-none" id="page-title">MiniTwitter</h1>
      </header>

      <main className="flex-grow flex flex-col pt-14 pb-20 max-w-2xl mx-auto w-full relative" id="app">
        <section aria-live="polite" aria-relevant="additions" className="flex-grow overflow-y-auto bg-white divide-y divide-gray-200" id="timeline" tabIndex={0} />

        <section className="hidden flex flex-col h-full bg-white p-4" id="search-section" tabIndex={0}>
          <input aria-label="Arama kutusu" autoComplete="off" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" id="search-input" placeholder="Bir şeyler ara..." type="text" />
          <ul className="flex-grow overflow-y-auto space-y-3 text-gray-700" id="search-results" />
        </section>

        <section className="hidden flex flex-col h-full bg-white p-4 overflow-y-auto" id="notifications-section" tabIndex={0}>
          <ul className="space-y-4" id="notifications-list" />
        </section>

        <section className="hidden flex flex-col h-full bg-white p-4 relative" id="compose-section" tabIndex={0}>
          <button aria-label="Geri" className="mb-4 text-blue-600 hover:text-blue-800 focus:outline-none flex items-center space-x-2" id="compose-back-btn" type="button">
            <i className="fas fa-arrow-left" />
            <span>Geri</span>
          </button>
          <div className="flex space-x-3 relative w-full">
            <img alt="Kullanıcı profil fotoğrafı, yuvarlak, mavi arka plan üzerinde beyaz U harfi" className="w-12 h-12 rounded-full object-cover" height="48" id="compose-user-avatar" src="https://placehold.co/48x48/png?text=U&bg=3b82f6&fg=fff" width="48" />
            <div className="flex-grow flex flex-col relative">
              <textarea aria-label="Tweet yazma alanı" autoComplete="off" className="flex-grow resize-none border border-gray-300 rounded-lg p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" id="compose-textarea" maxLength={280} placeholder="Neler oluyor?" rows={5} spellCheck={false} />
              <ul className="hidden absolute top-full left-0 mt-1 max-w-full" id="mention-suggestions" />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500" id="compose-char-count">280</span>
              </div>
              <button aria-label="Tweet gönder" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition self-end" disabled id="compose-tweet-btn" type="button">Tweetle</button>
            </div>
          </div>
        </section>

        <section className="hidden flex flex-col h-full bg-white p-4 overflow-y-auto" id="profile-section" tabIndex={0}>
          <div className="flex flex-col items-center space-y-4">
            <img alt="Profil fotoğrafı, yuvarlak, mavi arka plan üzerinde beyaz U harfi" className="w-24 h-24 rounded-full object-cover" height="96" id="profile-avatar" src="https://placehold.co/96x96/png?text=U&bg=3b82f6&fg=fff" width="96" />
            <h2 className="text-2xl font-bold" id="profile-name">Kullanıcı Adı</h2>
            <p className="text-gray-600" id="profile-username">@kullanici</p>
            <textarea className="w-full max-w-md border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" id="profile-description" maxLength={160} placeholder="Profil açıklamanızı yazın..." rows={3} />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition" id="save-profile-btn" type="button">Profili Kaydet</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition" id="logout-btn" type="button">Çıkış Yap</button>
          </div>
          <hr className="my-4" />
          <h3 className="text-xl font-semibold mb-2">Tweetleriniz</h3>
          <section className="divide-y divide-gray-200" id="profile-tweets" />
        </section>

        <section className="flex flex-col h-full bg-white p-6 justify-center items-center space-y-6 max-w-md mx-auto" id="login-section" tabIndex={0}>
          <h2 className="text-3xl font-bold text-blue-600">MiniTwitter Giriş</h2>
          <form className="w-full space-y-4" id="login-form">
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="login-email" placeholder="E-posta" required type="email" />
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="login-password" placeholder="Şifre" required type="password" />
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition" type="submit">Giriş Yap</button>
          </form>
          <button className="w-full flex items-center justify-center space-x-3 border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition" id="google-login-btn" type="button">
            <img alt="Google logosu" className="w-6 h-6" height="24" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" width="24" />
            <span>Google ile Giriş Yap</span>
          </button>
          <p className="text-gray-600">
            Hesabınız yok mu?
            <button className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none" id="show-register-btn" type="button">Kayıt Ol</button>
          </p>
        </section>

        <section className="hidden flex flex-col h-full bg-white p-6 justify-center items-center space-y-6 max-w-md mx-auto" id="register-section" tabIndex={0}>
          <h2 className="text-3xl font-bold text-blue-600">MiniTwitter Kayıt</h2>
          <form className="w-full space-y-4" id="register-form">
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="register-name" placeholder="Adınız Soyadınız" required type="text" />
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="register-email" placeholder="E-posta" required type="email" />
            <input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" id="register-password" placeholder="Şifre" required type="password" />
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition" type="submit">Kayıt Ol</button>
          </form>
          <p className="text-gray-600">
            Zaten hesabınız var mı?
            <button className="text-blue-600 hover:text-blue-800 font-semibold focus:outline-none" id="show-login-btn" type="button">Giriş Yap</button>
          </p>
        </section>
      </main>

      <button aria-label="Yeni Tweet oluştur" className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500" id="compose-btn" type="button">
        <i className="fas fa-feather-alt fa-lg" />
      </button>

      <nav aria-label="Alt navigasyon menüsü" className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-[95vw] max-w-lg bg-white backdrop-blur-md bg-opacity-70 shadow-2xl rounded-3xl px-8 py-3 flex justify-between items-center z-50" id="bottom-nav" role="navigation">
        <a aria-label="Anasayfa" className="group flex flex-col items-center justify-center text-blue-600 transition-colors relative cursor-pointer" href="#home" id="nav-home" role="button" tabIndex={0}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 transition-colors">
            <i className="fas fa-home fa-lg text-blue-600" />
          </div>
          <span className="mt-1 text-xs font-semibold text-blue-600 transition-opacity opacity-100">Anasayfa</span>
        </a>
        <a aria-label="Ara" className="group flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors relative cursor-pointer" href="#search" id="nav-search" role="button" tabIndex={0}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <i className="fas fa-search fa-lg" />
          </div>
          <span className="mt-1 text-xs font-semibold opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">Ara</span>
        </a>
        <a aria-label="Bildirimler" className="group flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors relative cursor-pointer" href="#notifications" id="nav-notifications" role="button" tabIndex={0}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors relative">
            <i className="fas fa-bell fa-lg" />
            <span aria-label="Yeni bildirim sayısı" className="absolute top-1 right-1 text-[10px] bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold select-none" id="notif-badge" style={{ display: 'none' }}>0</span>
          </div>
          <span className="mt-1 text-xs font-semibold opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">Bildirimler</span>
        </a>
        <a aria-label="Profil" className="group flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 transition-colors relative cursor-pointer" href="#profile" id="nav-profile" role="button" tabIndex={0}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <img alt="Profil ikonu" className="w-6 h-6 rounded-full object-cover" height="24" id="nav-profile-icon" src="https://placehold.co/24x24/png?text=U&bg=3b82f6&fg=fff" width="24" />
          </div>
          <span className="mt-1 text-xs font-semibold opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity">Profil</span>
        </a>
      </nav>
    </div>
  )
}

