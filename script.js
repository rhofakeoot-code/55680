// ملف script.js

// بيانات الأقسام (صور تجريبية)
const categories = [
    { name: 'الخضار و الفواكه', image: 'https://dummyimage.com/150x150/fff/000.png&text=Fruits' },
    { name: 'قصابة - دجاج', image: 'https://dummyimage.com/150x150/fff/000.png&text=Chicken' },
    { name: 'اجبان', image: 'https://dummyimage.com/150x150/fff/000.png&text=Cheese' },
    { name: 'اسماك', image: 'https://dummyimage.com/150x150/fff/000.png&text=Fish' },
    { name: 'لحوم حمراء', image: 'https://dummyimage.com/150x150/fff/000.png&text=Meat' },
    { name: 'البقوليات', image: 'https://dummyimage.com/150x150/fff/000.png&text=Beans' }
];

// بيانات المنتجات (صور تجريبية)
const products = [
    { name: 'موز درجة اولى', price: '2,500 د.ع', image: 'https://dummyimage.com/150x150/fff/000.png&text=Banana', inStock: true },
    { name: 'سمك كارب', price: '5,500 د.ع', image: 'https://dummyimage.com/150x150/fff/000.png&text=Fish', inStock: false }
];

// دالة لتوليد الأقسام في الصفحة
function renderCategories() {
    const container = document.getElementById('categories-container');
    if(!container) return;
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-card';
        div.innerHTML = `
            <img src="${cat.image}" alt="${cat.name}">
            <span>${cat.name}</span>
        `;
        container.appendChild(div);
    });
}

// دالة لتوليد المنتجات في الصفحة
function renderProducts() {
    const container = document.getElementById('products-container');
    if(!container) return;

    products.forEach(prod => {
        const btnHtml = prod.inStock 
            ? `<button class="btn-add">أضف للسلة <i class="fa-solid fa-cart-plus"></i></button>` 
            : `<button class="btn-add disabled">نفذت الكمية <i class="fa-solid fa-cart-arrow-down"></i></button>`;

        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <div class="icons-top">
                <i class="fa-regular fa-heart"></i>
                <i class="fa-solid fa-percent" style="background:#eee; border-radius:50%; padding:3px;"></i>
            </div>
            <img src="${prod.image}" alt="${prod.name}">
            <h4>${prod.name}</h4>
            <span class="price">${prod.price}</span>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

// دالة للتنقل بين الصفحات
function navigateTo(pageId) {
    // إخفاء جميع الصفحات
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    // إظهار الصفحة المطلوبة
    document.getElementById(pageId).classList.add('active');
}

// دالة لتحديث كمية السلة
let currentQty = 1;
const pricePerItem = 9000;

function updateQty(change) {
    const newQty = currentQty + change;
    if (newQty >= 1) {
        currentQty = newQty;
        document.getElementById('item-qty').innerText = currentQty;
        
        // تحديث السعر
        const total = currentQty * pricePerItem;
        const formattedTotal = total.toLocaleString('en-US') + ' د.ع';
        
        document.getElementById('item-total-price').innerText = formattedTotal;
        document.getElementById('final-total').innerText = formattedTotal;
        
        // تحديث ملخص الطلبات
        document.querySelectorAll('.summary-row')[0].lastElementChild.innerText = formattedTotal;
    }
}

// تشغيل الدوال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderProducts();
});
