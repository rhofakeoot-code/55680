// ملف script.js

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
    const formattedTotal = total.toLocaleString('en-US') + ' د.ع';
    document.getElementById('summary-subtotal').innerText = formattedTotal;
    document.getElementById('final-total').innerText = formattedTotal;
}

function showCheckoutForm() {
    if(cart.length === 0) {
        customAlert("السلة فارغة!");
        return;
    }
    document.getElementById('cart-summary-section').style.display = 'none';
    document.getElementById('checkout-form-section').style.display = 'block';
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
