import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const CONFIG = {
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAPiiVfmJdGHje0gittK-7yFTYNTQNY6Fk",
    authDomain: "basjfk-58536.firebaseapp.com",
    projectId: "basjfk-58536",
    storageBucket: "basjfk-58536.firebasestorage.app",
    messagingSenderId: "662162908373",
    appId: "1:662162908373:web:b5a789fd0b6ca6964e2e5c"
  }
};

const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

const categories = [];
const products = [];
let cart = [];
let favorites = [];
let currentCategoryFilter = null;

window.navigateTo = navigateTo;
window.filterProducts = filterProducts;
window.filterCategoryProducts = filterCategoryProducts;
window.openModal = openModal;
window.closeModal = closeModal;
window.clearCart = clearCart;
window.showCheckoutForm = showCheckoutForm;
window.checkPhoneLength = checkPhoneLength;
window.confirmOrder = confirmOrder;
window.updateItemQty = updateItemQty;
window.removeItem = removeItem;
window.addToCart = addToCart;
window.toggleFavorite = toggleFavorite;

window.loginWithGoogle = async () => {
    try { await signInWithPopup(auth, new GoogleAuthProvider()); } catch (error) { customAlert('خطأ: ' + error.message); }
};
window.loginAsGuest = async () => {
    try { await signInAnonymously(auth); } catch (error) { customAlert('خطأ: ' + error.message); }
};
window.logout = async () => {
    try { await signOut(auth); customAlert('تم تسجيل الخروج'); } catch (error) { customAlert('خطأ: ' + error.message); }
};

onAuthStateChanged(auth, (user) => {
    if (user) { navigateTo('home-page'); } else { navigateTo('login-page'); }
});

function customAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-notification';
    alertDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.classList.add('show'), 10);
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 600);
    }, 3000);
}

function toggleFavorite(id, event) {
    event.stopPropagation();
    const index = favorites.indexOf(id);
    if (index > -1) favorites.splice(index, 1); else favorites.push(id);
    renderProducts();
    if (currentCategoryFilter) renderCategoryProducts(currentCategoryFilter);
    renderFavoritesPage();
}

async function fetchCategoriesFromDB() {
    const snapshot = await getDocs(collection(db, "categories"));
    categories.length = 0;
    snapshot.forEach(docSnap => categories.push({ id: docSnap.id, ...docSnap.data() }));
    renderCategories();
}

async function fetchProductsFromDB() {
    const snapshot = await getDocs(collection(db, "products"));
    products.length = 0;
    snapshot.forEach(docSnap => products.push({ id: docSnap.id, ...docSnap.data() }));
    renderProducts();
}

async function fetchBannersFromDB() {
    const snapshot = await getDocs(collection(db, "banners"));
    const container = document.getElementById('banner-container');
    if(!container) return;
    
    let banners = [];
    snapshot.forEach(docSnap => banners.push(docSnap.data().image));
    
    if(banners.length === 0) return;

    let html = '';
    banners.forEach((img, index) => {
        html += `<img src="${img}" alt="Banner" class="banner-slide ${index === 0 ? 'active' : ''}">`;
    });
    container.innerHTML = html;

    if(banners.length > 1) {
        let currentIndex = 0;
        setInterval(() => {
            const slides = container.querySelectorAll('.banner-slide');
            slides[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }, 5000);
    }
}

async function fetchOffersFromDB() {
    const snapshot = await getDocs(collection(db, "offers"));
    const container = document.getElementById('offers-container');
    if(!container) return;
    
    let offers = [];
    snapshot.forEach(docSnap => offers.push(docSnap.data().image));
    
    if(offers.length === 0) return;

    container.innerHTML = `
        <div class="offer-slot offer-top">
            <img src="${offers[0]}" id="offer-img-top">
        </div>
        <div class="offer-slot offer-bottom">
            <img src="${offers[1] || offers[0]}" id="offer-img-bottom">
        </div>
    `;

    if(offers.length > 2) {
        let idxTop = 0;
        let idxBottom = 1;
        setInterval(() => {
            const imgTop = document.getElementById('offer-img-top');
            const imgBottom = document.getElementById('offer-img-bottom');
            
            imgTop.style.animation = 'slideOutRight 0.5s forwards';
            imgBottom.style.animation = 'slideOutLeft 0.5s forwards';
            
            setTimeout(() => {
                idxTop = (idxTop + 2) % offers.length;
                idxBottom = (idxBottom + 2) % offers.length;
                
                imgTop.src = offers[idxTop];
                imgBottom.src = offers[idxBottom] || offers[0];
                
                imgTop.style.animation = 'slideInLeft 0.5s forwards';
                imgBottom.style.animation = 'slideInRight 0.5s forwards';
            }, 500);
        }, 4000);
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    if(!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-card glass-element';
        div.onclick = () => openCategoryPage(cat.name);
        div.innerHTML = `<img src="${cat.image || ''}" alt="${cat.name}"><span>${cat.name}</span>`;
        container.appendChild(div);
    });
}

function openCategoryPage(catName) {
    currentCategoryFilter = catName;
    document.getElementById('cat-page-title').innerText = catName;
    renderCategoryProducts(catName);
    navigateTo('category-products-page');
}

function renderCategoryProducts(catName, searchQuery = '') {
    const container = document.getElementById('category-products-container');
    if(!container) return;
    container.innerHTML = '';
    const filtered = products.filter(p => p.category === catName && p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filtered.length === 0) { container.innerHTML = '<p style="text-align:center; width:100%;">لا توجد منتجات</p>'; return; }
    filtered.forEach(prod => {
        const isFav = favorites.includes(prod.id);
        const div = document.createElement('div');
        div.className = 'product-card glass-element';
        div.onclick = () => openModal(prod.id);
        div.innerHTML = `
            <div class="icons-top"><i class="${isFav ? 'fa-solid fa-heart favorite-active' : 'fa-regular fa-heart'}" onclick="toggleFavorite('${prod.id}', event)"></i></div>
            <img src="${prod.image || ''}">
            <span class="price">${prod.price} د.ع</span>
            <h4>${prod.name}</h4>
            <button class="btn-add" onclick="event.stopPropagation(); addToCart('${prod.id}')">أضف للسلة</button>
        `;
        container.appendChild(div);
    });
}

function filterCategoryProducts() {
    const query = document.getElementById('cat-search-input').value;
    if (currentCategoryFilter) renderCategoryProducts(currentCategoryFilter, query);
}

function renderProducts(filteredProducts = products) {
    const container = document.getElementById('products-container');
    if(!container) return;
    container.innerHTML = '';
    filteredProducts.forEach(prod => {
        const isFav = favorites.includes(prod.id);
        const div = document.createElement('div');
        div.className = 'product-card glass-element';
        div.onclick = () => openModal(prod.id);
        div.innerHTML = `
            <div class="icons-top"><i class="${isFav ? 'fa-solid fa-heart favorite-active' : 'fa-regular fa-heart'}" onclick="toggleFavorite('${prod.id}', event)"></i></div>
            <img src="${prod.image || ''}">
            <span class="price">${prod.price} د.ع</span>
            <h4>${prod.name}</h4>
            <button class="btn-add" onclick="event.stopPropagation(); addToCart('${prod.id}')">أضف للسلة</button>
        `;
        container.appendChild(div);
    });
}

function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    renderProducts(products.filter(p => p.name.toLowerCase().includes(query)));
}

function renderFavoritesPage() {
    const container = document.querySelector('#favorite-page .main-content');
    if(!container) return;
    const favProducts = products.filter(p => favorites.includes(p.id));
    if(favProducts.length === 0) { container.innerHTML = '<h3 style="margin-top:20px;">لا توجد مفضلة</h3>'; return; }
    let html = '<div class="products-grid">';
    favProducts.forEach(prod => {
        html += `<div class="product-card glass-element" onclick="openModal('${prod.id}')"><img src="${prod.image || ''}"><span class="price">${prod.price} د.ع</span><h4>${prod.name}</h4><button class="btn-add" onclick="event.stopPropagation(); addToCart('${prod.id}')">أضف للسلة</button></div>`;
    });
    container.innerHTML = html + '</div>';
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if(pageId === 'cart-page') renderCart();
    if(pageId === 'favorite-page') renderFavoritesPage();
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) existing.qty++; else cart.push({ ...product, qty: 1 });
    updateCartBadge();
    customAlert('تمت إضافة ' + product.name);
}

function updateCartBadge() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.badge').forEach(badge => badge.innerText = count);
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if(!container) return;
    container.innerHTML = cart.length === 0 ? '<h3 style="text-align:center;">السلة فارغة</h3>' : '';
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item glass-element';
        div.innerHTML = `<img src="${item.image}"><div class="item-details"><h4>${item.name}</h4><div class="item-price-row"><span class="price">${item.price} د.ع</span><div class="quantity-control"><i class="fa-solid fa-minus qty-btn" onclick="updateItemQty('${item.id}', -1)"></i><span>${item.qty}</span><i class="fa-solid fa-plus qty-btn" onclick="updateItemQty('${item.id}', 1)"></i></div></div></div><i class="fa-regular fa-trash-can delete-item" onclick="removeItem('${item.id}')"></i>`;
        container.appendChild(div);
    });
    updateCartTotals();
}

function updateItemQty(id, change) {
    const item = cart.find(i => i.id === id);
    if(item) { item.qty += change; if(item.qty < 1) removeItem(id); else renderCart(); updateCartBadge(); }
}

function removeItem(id) { cart = cart.filter(i => i.id !== id); renderCart(); updateCartBadge(); }
function clearCart() { cart = []; renderCart(); updateCartBadge(); }

function updateCartTotals() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const final = total > 0 ? total + 1000 : 0;
    document.getElementById('summary-subtotal').innerText = total.toLocaleString() + ' د.ع';
    document.getElementById('final-total').innerText = final.toLocaleString() + ' د.ع';
}

function showCheckoutForm() {
    if(cart.length === 0) return customAlert("السلة فارغة!");
    document.getElementById('cart-summary-section').style.display = 'none';
    document.getElementById('checkout-form-section').style.display = 'block';
}

function checkPhoneLength() {
    const phone = document.getElementById('checkout-phone').value;
    const btn = document.getElementById('btn-confirm-order');
    btn.style.opacity = (phone.length >= 10) ? '1' : '0.5';
    btn.style.pointerEvents = (phone.length >= 10) ? 'auto' : 'none';
}

async function confirmOrder() { 
    const name = document.getElementById('checkout-name').value;
    const phone = document.getElementById('checkout-phone').value;
    const address = document.getElementById('checkout-address').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0) + 1000;

    if(!name || !phone || !address) return customAlert("يرجى إكمال البيانات");

    const btn = document.getElementById('btn-confirm-order');
    btn.innerText = 'جاري الإرسال...';
    try {
        await addDoc(collection(db, "orders"), {
            name, phone, address,
            items: cart.map(i => ({id: i.id, name: i.name, image: i.image, qty: i.qty, price: i.price})),
            total: total,
            status: 'pending',
            createdAt: serverTimestamp()
        });
        customAlert('تم تأكيد الطلب بنجاح!'); 
        clearCart(); 
        document.getElementById('checkout-name').value = '';
        document.getElementById('checkout-phone').value = '';
        document.getElementById('checkout-address').value = '';
        document.getElementById('cart-summary-section').style.display = 'block';
        document.getElementById('checkout-form-section').style.display = 'none';
        navigateTo('home-page');
    } catch(e) {
        customAlert('حدث خطأ: ' + e.message);
    }
    btn.innerHTML = 'تأكيد الطلب <i class="fa-solid fa-check"></i>';
}

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;
    document.getElementById('modal-img-1').src = product.image || '';
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-price').innerText = product.price + ' د.ع';
    document.getElementById('modal-desc').innerText = product.desc || '';
    document.getElementById('modal-add-btn').onclick = () => { addToCart(product.id); closeModal(); };
    document.getElementById('product-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('product-modal').style.display = 'none'; }

document.addEventListener('DOMContentLoaded', () => {
    fetchCategoriesFromDB();
    fetchProductsFromDB();
    fetchBannersFromDB();
    fetchOffersFromDB();
});
