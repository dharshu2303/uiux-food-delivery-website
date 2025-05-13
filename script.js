let cart = [];
let orders = [];
const homeLink = document.getElementById('home-link');
const menuLink = document.getElementById('menu-link');
const cartLink = document.getElementById('cart-link');
const ordersLink = document.getElementById('orders-link');
const menuBtn = document.querySelector('.menu-btn');
const showMoreBtn = document.querySelector('.show-more-btn');
const checkoutBtn = document.querySelector('.checkout-btn');
const searchBox = document.getElementById('search-box');
const categoryFilter = document.getElementById('category-filter');
const priceFilter = document.getElementById('price-filter');

homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('home-page');
});

menuLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('menu-page');
});

cartLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('cart-page');
    updateCart();
});

ordersLink.addEventListener('click', (e) => {
    e.preventDefault();
    showPage('orders-page');
    updateOrders();
});

menuBtn.addEventListener('click', () => showPage('menu-page'));

showMoreBtn.addEventListener('click', function() {
    document.getElementById('more-items').style.display = 'grid';
    this.style.display = 'none';
});

searchBox.addEventListener('input', filterItems);
categoryFilter.addEventListener('change', filterItems);
priceFilter.addEventListener('change', filterItems);

function filterItems() {
    const searchTerm = searchBox.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    const selectedPrice = priceFilter.value;
    
    document.querySelectorAll('.food-item').forEach(item => {
        const name = item.getAttribute('data-name').toLowerCase();
        const category = item.getAttribute('data-category');
        const price = parseInt(item.getAttribute('data-price'));
        const matchesSearch = name.includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
   
        let matchesPrice = true;
        if (selectedPrice !== 'all') {
            const [min, max] = selectedPrice.split('-').map(Number);
            if (selectedPrice.endsWith('+')) {
                matchesPrice = price >= min;
            } else {
                matchesPrice = price >= min && (max ? price <= max : true);
            }
        }
  
        if (matchesSearch && matchesCategory && matchesPrice) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const foodItem = this.closest('.food-item');
        const itemId = foodItem.getAttribute('data-id');
        const itemName = foodItem.getAttribute('data-name');
        const itemPrice = parseInt(foodItem.getAttribute('data-price'));
        const itemImage = foodItem.querySelector('img').src;
        
        const existingItem = cart.find(item => item.id === itemId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: itemId,
                name: itemName,
                price: itemPrice,
                image: itemImage,
                quantity: 1
            });
        }
        
        updateCart();
        const notification = document.createElement('div');
        notification.textContent = `+1 ${itemName}`;
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = '#e17c12';
        notification.style.color = 'white';
        notification.style.padding = '10px 20px';
        notification.style.borderRadius = '20px';
        notification.style.zIndex = '1000';
        notification.style.animation = 'fadeIn 0.5s, fadeOut 0.5s 2s forwards';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2500);
    });
});

function updateCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.querySelector('.cart-count');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center;">Your cart is empty</p>';
        cartTotal.textContent = '0';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">Qty: ${item.quantity} × ₹${item.price} = ₹${itemTotal}</div>
                    </div>
                </div>
                <div>
                    <button class="remove-btn">Remove</button>
                </div>
            </div>
        `;
    });
    
    cartItemsContainer.innerHTML = itemsHTML;
    cartTotal.textContent = total;
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const cartItem = this.closest('.cart-item');
            const itemId = cartItem.getAttribute('data-id');
            cart = cart.filter(item => item.id !== itemId);
            updateCart();
        });
    });
}

checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const order = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending' 
    };
    
    orders.unshift(order); 
    cart = []; 
    updateCart();
    updateOrders();
    
    alert('Order placed successfully! Thank you for your purchase.');
    showPage('orders-page');
});

function updateOrders() {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<div class="no-orders">You haven\'t placed any orders yet</div>';
        return;
    }
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        let itemsHTML = '';
        order.items.forEach(item => {
            itemsHTML += `
                <div class="order-item">
                    <div class="order-item-info">
                        <img src="${item.image}" alt="${item.name}">
                        <div>
                            <div class="order-item-name">${item.name}</div>
                            <div class="order-item-price">Qty: ${item.quantity} × ₹${item.price}</div>
                        </div>
                    </div>
                </div>
            `;
        });

        let statusClass = '';
        let statusText = '';
        switch(order.status) {
            case 'delivered':
                statusClass = 'status-delivered';
                statusText = 'Delivered';
                break;
            case 'cancelled':
                statusClass = 'status-cancelled';
                statusText = 'Cancelled';
                break;
            default:
                statusClass = 'status-pending';
                statusText = 'Processing';
        }
        
        ordersHTML += `
            <div class="order-card" style="margin-bottom: 30px; background-color: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <div class="order-date">${order.date}</div>
                    </div>
                    <div class="order-status ${statusClass}">${statusText}</div>
                </div>
                ${itemsHTML}
                <div class="order-total" style="margin-top: 15px;">TOTAL: ₹${order.total}</div>
            </div>
        `;
    });
    
    ordersList.innerHTML = ordersHTML;
}

function showPage(pageId) {
    document.getElementById('home-page').style.display = 'none';
    document.getElementById('menu-page').style.display = 'none';
    document.getElementById('cart-page').style.display = 'none';
    document.getElementById('orders-page').style.display = 'none';
    document.getElementById(pageId).style.display = pageId === 'home-page' ? 'flex' : 'block';
    window.scrollTo(0, 0);
}

showPage('home-page');
