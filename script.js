// ملف script.js

const categories = [
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=الخضار+و+الفواكه' },
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=قصابة+-+دجاج' },
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=اجبان' },
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=اسماك' },
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=لحوم+حمراء' },
    { image: 'https://dummyimage.com/200x150/e8f5e9/333.png&text=البقوليات' }
];

const products = [
    { price: '2,500 د.ع', image: 'https://dummyimage.com/200x200/fff/000.png&text=موز+درجة+اولى', inStock: true },
    { price: '5,500 د.ع', image: 'https://dummyimage.com/200x200/fff/000.png&text=سمك+كارب', inStock: false },
    { price: '3,000 د.ع', image: 'https://dummyimage.com/200x200/fff/000.png&text=طماطم+طازجة', inStock: true },
    { price: '8,000 د.ع', image: 'https://dummyimage.com/200x200/fff/000.png&text=لحم+عجل', inStock: true }
];

function renderCategories() {
    const container = document.getElementById('categories-container');
    if(!container) return;
    
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-card';
        div.innerHTML = `<img src="${cat.image}" alt="Category">`;
        container.appendChild(div);
    });
}

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
            <img src="${prod.image}" alt="Product">
            <span class="price">${prod.price}</span>
            ${btnHtml}
        `;
        container.appendChild(div);
    });
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    if(pageId === 'cart-page') {
        document.getElementById('cart-summary-section').style.display = 'block';
        document.getElementById('checkout-form-section').style.display = 'none';
    }
}

let currentQty = 1;
const pricePerItem = 9000;
let cartHasItems = true;

function updateQty(change) {
    if(!cartHasItems) return;
    const newQty = currentQty + change;
    if (newQty >= 1) {
        currentQty = newQty;
        document.getElementById('item-qty').innerText = currentQty;
        
        const total = currentQty * pricePerItem;
        const formattedTotal = total.toLocaleString('en-US') + ' د.ع';
        
        document.getElementById('item-total-price').innerText = formattedTotal;
        document.getElementById('final-total').innerText = formattedTotal;
        document.getElementById('summary-subtotal').innerText = formattedTotal;
    }
}

function removeSingleItem() {
    const item = document.getElementById('single-cart-item');
    if(item) {
        item.remove();
        emptyCartData();
    }
}

function clearCart() {
    const container = document.getElementById('cart-items-container');
    if(container) {
        container.innerHTML = '';
        emptyCartData();
    }
}

function emptyCartData() {
    cartHasItems = false;
    document.getElementById('final-total').innerText = '0 د.ع';
    document.getElementById('summary-subtotal').innerText = '0 د.ع';
    document.getElementById('cart-count-title').innerText = '(0) منتجات';
}

function showCheckoutForm() {
    if(!cartHasItems) {
        alert("السلة فارغة!");
        return;
    }
    document.getElementById('cart-summary-section').style.display = 'none';
    document.getElementById('checkout-form-section').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderProducts();
});
