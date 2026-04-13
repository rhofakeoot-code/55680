// ملف script.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signInAnonymously, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const CONFIG = {
  IMGBB_API_KEY: "7fa910ddeffb3ce5937e0b4ff50246c8",
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyAPiiVfmJdGHje0gittK-7yFTYNTQNY6Fk",
    authDomain: "basjfk-58536.firebaseapp.com",
    projectId: "basjfk-58536",
    storageBucket: "basjfk-58536.firebasestorage.app",
    messagingSenderId: "662162908373",
    appId: "1:662162908373:web:b5a789fd0b6ca6964e2e5c"
  },
  COLLECTION_NAME: "products"
};

// Initialize Firebase
const app = initializeApp(CONFIG.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);

const categories = [
    { name: 'الخضار و الفواكه', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200' },
    { name: 'لحوم، دجاج وأسماك', image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5e?auto=format&fit=crop&w=200' },
    { name: 'البقوليات', image: 'https://images.unsplash.com/photo-1515589654644-18dfb208942b?auto=format&fit=crop&w=200' }
];

const products = [
    { id: 1, name: 'موز درجة اولى', price: 2500, priceText: '2,500 د.ع', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=200', image2: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=200', desc: 'موز طازج ومغذي جداً، غني بالفيتامينات والمعادن.', inStock: true, category: 'الخضار و الفواكه' },
    { id: 2, name: 'سمك كارب', price: 5500, priceText: '5,500 د.ع', image: 'https://images.unsplash.com/photo-1511994714008-b6d68af09c28?auto=format&fit=crop&w=200', image2: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=200', desc: 'سمك كارب نهري طازج، مثالي للشوي والقلي.', inStock: false, category: 'لحوم، دجاج وأسماك' },
    { id: 3, name: 'طماطم طازجة', price: 3000, priceText: '3,000 د.ع', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=200', image2: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=200', desc: 'طماطم حمراء طازجة مقطوفة يومياً، ممتازة للسلطات.', inStock: true, category: 'الخضار و الفواكه' },
    { id: 4, name: 'لحم عجل', price: 8000, priceText: '8,000 د.ع', image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=200', image2: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=200', desc: 'لحم عجل بلدي ممتاز، خالي من الدهون الزائدة.', inStock: true, category: 'لحوم، دجاج وأسماك' }
];

let cart = [];
let favorites = [];
let currentCategoryFilter = null;

// إتاحة الدوال للعمل مع ملف HTML عند استخدام type="module"
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

// Authentication Functions
window.loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        customAlert('خطأ في تسجيل الدخول: ' + error.message);
    }
};

window.loginAsGuest = async () => {
    try {
        await signInAnonymously(auth);
    } catch (error) {
        customAlert('خطأ في دخول الزائر: ' + error.message);
    }
};

window.logout = async () => {
    try {
        await signOut(auth);
        customAlert('تم تسجيل الخروج');
    } catch (error) {
        customAlert('خطأ: ' + error.message);
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        navigateTo('home-page');
    } else {
        navigateTo('login-page');
    }
});

function customAlert(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'custom-notification';
    alertDiv.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.classList.add('show');
    }, 10);

    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 600);
    }, 3000);
}

function toggleFavorite(id, event) {
    event.stopPropagation();
    const index = favorites.indexOf(id);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(id);
    }
    renderProducts();
    if (currentCategoryFilter) renderCategoryProducts(currentCategoryFilter);
    renderFavoritesPage();
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    if(!container) return;
    container.innerHTML = '';
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-card glass-element';
        div.onclick = () => openCategoryPage(cat.name);
        div.innerHTML = `<img src="${cat.image}" alt="${cat.name}"><span>${cat.name}</span>`;
        container.appendChild(div);
    });
}

function openCategoryPage(catName) {
    currentCategoryFilter = catName;
    document.getElementById('cat-page-title').innerText = catName;
    document.getElementById('cat-search-input').value = '';
    renderCategoryProducts(catName);
    navigateTo('category-products-page');
}

function renderCategoryProducts(catName, searchQuery = '') {
    const container = document.getElementById('category-products-container');
    if(!container) return;
    container.innerHTML = '';

    const filtered = products.filter(p => {
        const matchCat = p.category === catName;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
         container.innerHTML = '<p style="text-align:center; width: 100%; color:var(--text-dark); margin-top:20px;">لا توجد منتجات حالياً</p>';
         return;
    }

    filtered.forEach(prod => {
        const isFav = favorites.includes(prod.id);
        const heartClass = isFav ? 'fa-solid fa-heart favorite-active' : 'fa-regular fa-heart';
        
        const btnHtml = prod.inStock 
            ? `<button class="btn-add" onclick="event.stopPropagation(); addToCart(${prod.id})">أضف للسلة <i class="fa-solid fa-cart-plus"></i></button>` 
            : `<button class="btn-add disabled" onclick="event.stopPropagation()">نفذت الكمية <i class="fa-solid fa-cart-arrow-down"></i></button>`;

        const div = document.createElement('div');
        div.className = 'product-card glass-element';
        div.onclick = () => openModal(prod.id);
        div.innerHTML = `
            <div class="icons-top">
                <i class="${heartClass}" onclick="toggleFavorite(${prod.id}, event)"></i>
                <i class="fa-solid fa-percent" style="background:rgba(0,0,0,0.1); border-radius:50%; padding:3px;"></i>
            </div>
            <img src="${prod.image}" alt="${prod.name}">
            <span class="price">${prod.priceText}</span>
            <h4>${prod.name}</h4>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

function filterCategoryProducts() {
    const query = document.getElementById('cat-search-input').value;
    if (currentCategoryFilter) {
        renderCategoryProducts(currentCategoryFilter, query);
    }
}

function renderProducts(filteredProducts = products) {
    const container = document.getElementById('products-container');
    if(!container) return;
    container.innerHTML = '';

    filteredProducts.forEach(prod => {
        const isFav = favorites.includes(prod.id);
        const heartClass = isFav ? 'fa-solid fa-heart favorite-active' : 'fa-regular fa-heart';

        const btnHtml = prod.inStock 
            ? `<button class="btn-add" onclick="event.stopPropagation(); addToCart(${prod.id})">أضف للسلة <i class="fa-solid fa-cart-plus"></i></button>` 
            : `<button class="btn-add disabled" onclick="event.stopPropagation()">نفذت الكمية <i class="fa-solid fa-cart-arrow-down"></i></button>`;

        const div = document.createElement('div');
        div.className = 'product-card glass-element';
        div.onclick = () => openModal(prod.id);
        div.innerHTML = `
            <div class="icons-top">
                <i class="${heartClass}" onclick="toggleFavorite(${prod.id}, event)"></i>
                <i class="fa-solid fa-percent" style="background:rgba(0,0,0,0.1); border-radius:50%; padding:3px;"></i>
            </div>
            <img src="${prod.image}" alt="${prod.name}">
            <span class="price">${prod.priceText}</span>
            <h4>${prod.name}</h4>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

function filterProducts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query));
    renderProducts(filtered);
}

function renderFavoritesPage() {
    const container = document.querySelector('#favorite-page .main-content');
    if(!container) return;
    
    const favProducts = products.filter(p => favorites.includes(p.id));
    
    if(favProducts.length === 0) {
        container.innerHTML = '<h3 style="color:#333; margin-top:20px; text-align:center;">لا توجد منتجات في المفضلة</h3>';
        return;
    }

    let html = '<div class="products-grid">';
    favProducts.forEach(prod => {
        const isFav = favorites.includes(prod.id);
        const heartClass = isFav ? 'fa-solid fa-heart favorite-active' : 'fa-regular fa-heart';

        const btnHtml = prod.inStock 
            ? `<button class="btn-add" onclick="event.stopPropagation(); addToCart(${prod.id})">أضف للسلة <i class="fa-solid fa-cart-plus"></i></button>` 
            : `<button class="btn-add disabled" onclick="event.stopPropagation()">نفذت الكمية <i class="fa-solid fa-cart-arrow-down"></i></button>`;

        html += `
            <div class="product-card glass-element" onclick="openModal(${prod.id})">
                <div class="icons-top">
                    <i class="${heartClass}" onclick="toggleFavorite(${prod.id}, event)"></i>
                    <i class="fa-solid fa-percent" style="background:rgba(0,0,0,0.1); border-radius:50%; padding:3px;"></i>
                </div>
                <img src="${prod.image}" alt="${prod.name}">
                <span class="price">${prod.priceText}</span>
                <h4>${prod.name}</h4>
                ${btnHtml}
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    if(pageId === 'cart-page') {
        document.getElementById('cart-summary-section').style.display = 'block';
        document.getElementById('checkout-form-section').style.display = 'none';
        renderCart();
    }
    
    if(pageId === 'favorite-page') {
        renderFavoritesPage();
    }

    if(pageId === 'account-page') {
        loadAdminProducts();
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    updateCartBadge();
    customAlert('تمت إضافة ' + product.name + ' إلى السلة');
}

function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cart-badge-main');
    if(badge) badge.innerText = totalItems;
    const titleCount = document.getElementById('cart-count-title');
    if(titleCount) titleCount.innerText = `(${totalItems}) منتجات`;
    
    const catBadges = document.querySelectorAll('.cart-badge-cat');
    catBadges.forEach(b => b.innerText = totalItems);
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if(!container) return;
    container.innerHTML = '';
    
    if(cart.length === 0) {
        container.innerHTML = '<h3 style="text-align:center; color:#333;">السلة فارغة</h3>';
        updateCartTotals();
        return;
    }

    cart.forEach(item => {
        const itemTotalText = (item.price * item.qty).toLocaleString('en-US') + ' د.ع';
        const div = document.createElement('div');
        div.className = 'cart-item glass-element';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <div class="item-price-row">
                    <span class="price">${item.priceText}</span>
                    <div class="quantity-control">
                        <i class="fa-solid fa-minus qty-btn" onclick="updateItemQty(${item.id}, -1)"></i>
                        <span>${item.qty}</span>
                        <i class="fa-solid fa-plus qty-btn" onclick="updateItemQty(${item.id}, 1)"></i>
                    </div>
                </div>
                <div class="item-total">اجمالي المنتج: <span>${itemTotalText}</span></div>
            </div>
            <i class="fa-regular fa-trash-can delete-item" onclick="removeItem(${item.id})"></i>
        `;
        container.appendChild(div);
    });
    updateCartTotals();
}

function updateItemQty(productId, change) {
    const item = cart.find(i => i.id === productId);
    if(item) {
        item.qty += change;
        if(item.qty < 1) {
            removeItem(productId);
        } else {
            renderCart();
            updateCartBadge();
        }
    }
}

function removeItem(productId) {
    cart = cart.filter(i => i.id !== productId);
    renderCart();
    updateCartBadge();
}

function clearCart() {
    cart = [];
    renderCart();
    updateCartBadge();
}

function updateCartTotals() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const deliveryFee = cart.length > 0 ? 1000 : 0; // تعديل كلفة التوصيل 1000 دينار
    const finalTotal = total + deliveryFee;
    
    document.getElementById('summary-subtotal').innerText = total.toLocaleString('en-US') + ' د.ع';
    const finalTotalElement = document.getElementById('final-total');
    if(finalTotalElement) {
        finalTotalElement.innerText = finalTotal.toLocaleString('en-US') + ' د.ع';
    }
}

function showCheckoutForm() {
    if(cart.length === 0) {
        customAlert("السلة فارغة!");
        return;
    }
    document.getElementById('cart-summary-section').style.display = 'none';
    document.getElementById('checkout-form-section').style.display = 'block';
    
    document.getElementById('checkout-name').value = '';
    document.getElementById('checkout-phone').value = '';
    document.getElementById('checkout-address').value = '';
    checkPhoneLength();
}

function checkPhoneLength() {
    const phone = document.getElementById('checkout-phone').value;
    const btn = document.getElementById('btn-confirm-order');
    if (phone && phone.length >= 10) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    }
}

function confirmOrder() {
    customAlert('تم تأكيد الطلب بنجاح! شكراً لاستخدامك ناين سات.');
    clearCart();
    navigateTo('home-page');
}

function openModal(productId) {
    const product = products.find(p => p.id === productId);
    if(!product) return;

    document.getElementById('modal-img-1').src = product.image;
    document.getElementById('modal-img-2').src = product.image2;
    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-price').innerText = product.priceText;
    document.getElementById('modal-desc').innerText = product.desc;
    
    const btn = document.getElementById('modal-add-btn');
    if(product.inStock) {
        btn.innerText = 'أضف للسلة ';
        btn.innerHTML += '<i class="fa-solid fa-cart-plus"></i>';
        btn.className = 'btn-primary';
        btn.onclick = () => { addToCart(product.id); closeModal(); };
    } else {
        btn.innerText = 'نفذت الكمية ';
        btn.innerHTML += '<i class="fa-solid fa-cart-arrow-down"></i>';
        btn.className = 'btn-primary';
        btn.style.background = '#999';
        btn.onclick = null;
    }

    document.getElementById('product-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
}


// نظام رفع الصور والمنتجات (الادمن)
const imgInput = document.getElementById('add-prod-image');
const imgPreview = document.getElementById('add-prod-preview');

if(imgInput) {
    imgInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgPreview.src = e.target.result;
                imgPreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            imgPreview.style.display = 'none';
        }
    });
}

async function compressImage(file, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                resolve(blob);
            }, 'image/jpeg', quality);
        };
        img.onerror = error => reject(error);
    });
}

async function uploadToImgBB(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'product.jpg');
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    const data = await response.json();
    if (data.success) {
        return {
            url: data.data.url,
            deleteUrl: data.data.delete_url
        };
    } else {
        throw new Error('فشل رفع الصورة');
    }
}

const btnSaveProduct = document.getElementById('btn-save-product');
if(btnSaveProduct) {
    btnSaveProduct.addEventListener('click', async () => {
        const name = document.getElementById('add-prod-name').value;
        const price = document.getElementById('add-prod-price').value;
        const file = imgInput.files[0];

        if (!name || !price || !file) {
            customAlert('يرجى ملء جميع الحقول واختيار صورة');
            return;
        }

        btnSaveProduct.innerText = 'جاري الرفع...';
        btnSaveProduct.style.pointerEvents = 'none';

        try {
            const compressedBlob = await compressImage(file, 0.7);
            const imgData = await uploadToImgBB(compressedBlob);
            
            await addDoc(collection(db, CONFIG.COLLECTION_NAME), {
                name: name,
                price: Number(price),
                imageUrl: imgData.url,
                deleteUrl: imgData.deleteUrl,
                createdAt: serverTimestamp()
            });

            customAlert('تم إضافة المنتج بنجاح');
            document.getElementById('add-prod-name').value = '';
            document.getElementById('add-prod-price').value = '';
            imgInput.value = '';
            imgPreview.style.display = 'none';
            loadAdminProducts(); 
        } catch (error) {
            customAlert('خطأ: ' + error.message);
        } finally {
            btnSaveProduct.innerHTML = 'حفظ المنتج <i class="fa-solid fa-cloud-arrow-up"></i>';
            btnSaveProduct.style.pointerEvents = 'auto';
        }
    });
}

async function loadAdminProducts() {
    const container = document.getElementById('admin-products-list');
    if(!container) return;
    container.innerHTML = '<span style="color:#333;">جاري التحميل...</span>';
    try {
        const querySnapshot = await getDocs(collection(db, CONFIG.COLLECTION_NAME));
        container.innerHTML = '';
        querySnapshot.forEach((docSnap) => {
            const prod = docSnap.data();
            const id = docSnap.id;
            const div = document.createElement('div');
            div.className = 'glass-element';
            div.style.padding = '10px';
            div.style.display = 'flex';
            div.style.justifyContent = 'space-between';
            div.style.alignItems = 'center';
            div.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px; color:#333;">
                    <img src="${prod.imageUrl}" style="width:40px; height:40px; border-radius:5px; object-fit:cover;">
                    <span>${prod.name} - ${prod.price} د.ع</span>
                </div>
                <button class="btn-primary" style="width:auto; padding:5px 10px; background:#ff3b30;" onclick="deleteAdminProduct('${id}', '${prod.deleteUrl}')"><i class="fa-solid fa-trash"></i></button>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        container.innerHTML = '<span style="color:red;">خطأ في التحميل</span>';
    }
}

window.deleteAdminProduct = async (id, deleteUrl) => {
    if(!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
        if (deleteUrl) {
            try {
                await fetch(deleteUrl);
            } catch (e) {
                console.log('ImgBB Delete Issue:', e);
            }
        }
        await deleteDoc(doc(db, CONFIG.COLLECTION_NAME, id));
        customAlert('تم حذف المنتج بنجاح');
        loadAdminProducts();
    } catch (error) {
        customAlert('خطأ في الحذف: ' + error.message);
    }
};


const bannerImages = [
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&h=150',
    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&h=150',
    'https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&w=400&h=150'
];
let currentBannerIdx = 0;
setInterval(() => {
    currentBannerIdx = (currentBannerIdx + 1) % bannerImages.length;
    const imgElement = document.getElementById('banner-img');
    if(imgElement) {
        imgElement.style.opacity = 0;
        setTimeout(() => {
            imgElement.src = bannerImages[currentBannerIdx];
            imgElement.style.opacity = 1;
        }, 500);
    }
}, 5000);

const offerSets = [
    [
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&h=150',
        'https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=400&h=150'
    ],
    [
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&h=150',
        'https://images.unsplash.com/photo-1555529771-835f59bfc50c?auto=format&fit=crop&w=400&h=150'
    ]
];
let currentOfferSet = 0;
setInterval(() => {
    const img1 = document.getElementById('offer-img-1');
    const img2 = document.getElementById('offer-img-2');
    
    if(img1 && img2) {
        img1.classList.add('slide-right');
        img2.classList.add('slide-left');
        
        setTimeout(() => {
            currentOfferSet = (currentOfferSet + 1) % offerSets.length;
            img1.src = offerSets[currentOfferSet][0];
            img2.src = offerSets[currentOfferSet][1];
            
            setTimeout(() => {
                img1.classList.remove('slide-right');
                img2.classList.remove('slide-left');
            }, 500);
        }, 500);
    }
}, 4000);

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderProducts();
    updateCartBadge();
    renderFavoritesPage();
});
