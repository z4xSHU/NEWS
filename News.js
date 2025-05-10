const firebaseConfig = {
    apiKey: "Secret API Key",
    authDomain: "App Domain ID",
    projectId: "Project ID",
    appId: "Secret App ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const NEWS_API_KEY = 'Secret API key';
const NEWS_API_URL = 'Secret NEWS URL';

const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const articleModal = document.getElementById('article-modal');
const accountModal = document.getElementById('account-modal');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const accountSectionBtn = document.getElementById('account-section-btn');
const exploreBtn = document.getElementById('explore-btn');
const showSignup = document.getElementById('show-signup');
const showLogin = document.getElementById('show-login');
const googleLogin = document.getElementById('google-login');
const googleSignup = document.getElementById('google-signup');
const newsContainer = document.getElementById('news-container');
const newsGrid = document.getElementById('news-grid');
const newsCategory = document.getElementById('news-category');
const navbar = document.getElementById('navbar');
const usernameSpan = document.getElementById('username');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const emailForm = document.getElementById('email-form');
const signupForm = document.getElementById('signup-form');
const forgotPassword = document.querySelector('.forgot-password');
const accountName = document.getElementById('account-name');
const accountEmail = document.getElementById('account-email');
const changePasswordBtn = document.getElementById('change-password-btn');
const passwordChangeForm = document.getElementById('password-change-form');
const updatePasswordForm = document.getElementById('update-password-form');
const navLinks = document.querySelectorAll('.nav-link');

let lastScrollPosition = 0;
let currentCategory = 'general';

// Initialize Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    darkModeToggle.checked = savedTheme === 'dark';
}

// Theme Toggle
darkModeToggle.addEventListener('change', function() {
    const theme = this.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
});

// Modal Functions
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}
// Authentication Functions
function handleAuthState(user) {
    if (user) {
        usernameSpan.textContent = user.displayName || user.email.split('@')[0];
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        accountSectionBtn.style.display = 'block';
        
// Update account modal with user info
        accountName.textContent = user.displayName || 'Not provided';
        accountEmail.textContent = user.email || 'Not provided';
    } else {
        usernameSpan.textContent = 'Account';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        accountSectionBtn.style.display = 'none';
    }
}

function googleAuth() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(() => {
            closeModal(loginModal);
            closeModal(signupModal);
        })
        .catch(error => showAuthError(error));
}

function emailLogin(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then(() => closeModal(loginModal))
        .catch(error => showAuthError(error));
}

function emailSignup(name, email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => closeModal(signupModal))
        .catch(error => showAuthError(error));
}

function logout() {
    auth.signOut().catch(error => console.error("Logout error:", error));
}

function sendPasswordReset(email) {
    auth.sendPasswordResetEmail(email)
        .then(() => alert('Password reset email sent. Please check your inbox.'))
        .catch(error => showAuthError(error));
}

function updatePassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
    );
    
    user.reauthenticateWithCredential(credential)
        .then(() => {
            return user.updatePassword(newPassword);
        })
        .then(() => {
            alert('Password updated successfully!');
            passwordChangeForm.style.display = 'none';
        })
        .catch(error => showAuthError(error));
}

function showAuthError(error) {
    const errorMessages = {
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/operation-not-allowed': 'Email/password accounts are not enabled.',
        'auth/requires-recent-login': 'Please log in again to change your password.'
    };
    
    alert(errorMessages[error.code] || 'Authentication failed. Please try again.');
}

// Password Strength Checker
document.getElementById('signup-password')?.addEventListener('input', function(e) {
    const password = e.target.value;
    const isStrong = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    e.target.dataset.strong = isStrong;
});

// News Functions
async function fetchNews(category = 'general') {
    try {
        newsCategory.textContent = category === 'general' ? "Today's Headlines" : `${category.charAt(0).toUpperCase() + category.slice(1)} News`;
        currentCategory = category;
        
        const response = await fetch(`${NEWS_API_URL}&category=${category}&apiKey=${NEWS_API_KEY}`);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        if (data.status === 'ok') {
            displayNews(data.articles);
        } else {
            throw new Error(data.message || 'Failed to fetch news');
        }
    } catch (error) {
        console.error("News fetch error:", error);
        newsGrid.innerHTML = `<p class="error">Failed to load ${category} news. Please try again later.</p>`;
    }
}

function displayNews(articles) {
    newsGrid.innerHTML = articles.slice(0, 12).map(article => `
        <div class="news-card">
            <img src="${article.urlToImage || 'https://via.placeholder.com/300x180?text=No+Image'}" 
                 alt="${article.title}" class="news-image">
            <div class="news-content">
                <h3 class="news-title">${article.title || 'No title available'}</h3>
                <p class="news-source">${article.source?.name || 'Unknown source'}</p>
                <p class="news-date">${new Date(article.publishedAt).toLocaleDateString()}</p>
            </div>
            <div class="news-description">
                <p>${article.description || 'No description available.'}</p>
                <button class="btn read-more" data-article='${JSON.stringify(article)}'>Read More</button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', () => {
            const article = JSON.parse(btn.dataset.article);
            showArticle(article);
        });
    });
}

function showArticle(article) {
    document.getElementById('article-title').textContent = article.title;
    document.getElementById('article-source').textContent = article.source?.name || 'Unknown source';
    document.getElementById('article-date').textContent = new Date(article.publishedAt).toLocaleDateString();
    document.getElementById('article-image').src = article.urlToImage || 'https://via.placeholder.com/800x400?text=No+Image';
    document.getElementById('article-text').textContent = article.content?.replace(/\[\+\d+ chars\]/, '') || 'No content available.';
    document.getElementById('article-url').href = article.url;
    openModal(articleModal);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    fetchNews(); 
    auth.onAuthStateChanged(handleAuthState);
    
// Navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            fetchNews(category);
            
            newsContainer.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
// Modal controls
    loginBtn.addEventListener('click', () => openModal(loginModal));
    accountSectionBtn.addEventListener('click', () => openModal(accountModal));
    exploreBtn.addEventListener('click', () => {
        newsContainer.scrollIntoView({ behavior: 'smooth' });
    });
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(signupModal);
    });
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(loginModal);
    });
    
// Auth buttons
    googleLogin.addEventListener('click', googleAuth);
    googleSignup.addEventListener('click', googleAuth);
    logoutBtn.addEventListener('click', logout);
    
// Form submissions
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;
        const password = e.target.elements[1].value;
        emailLogin(email, password);
    });
    
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.elements[0].value;
        const email = e.target.elements[1].value;
        const password = e.target.elements[2].value;
        emailSignup(name, email, password);
    });
    
// Password change
    changePasswordBtn.addEventListener('click', () => {
        passwordChangeForm.style.display = passwordChangeForm.style.display === 'none' ? 'block' : 'none';
    });
    
    updatePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = e.target.elements[0].value;
        const newPassword = e.target.elements[1].value;
        updatePassword(currentPassword, newPassword);
    });
    
// Forgot password
    forgotPassword?.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Please enter your email address:');
        if (email) sendPasswordReset(email);
    });
    
// Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.closest('.modal')));
    });
    
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
// Navbar scroll effect
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        navbar.classList.toggle('hidden', currentScroll > 100 && currentScroll > lastScrollPosition);
        lastScrollPosition = currentScroll;
    });
});
