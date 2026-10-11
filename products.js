/*
  Product "database" for the Threadly demo store.
  Add, remove or edit products here and the website updates automatically.

  Fields:
    id        unique number
    name      product name
    category  Tops | Bottoms | Outerwear | Footwear | Accessories
    price     price in rupees (number)
    emoji     picture shown on the card
    colors    two colours for the card background gradient
    rating    0 to 5
    desc      short description
*/
window.PRODUCTS = [
  { id: 1,  name: 'Classic Cotton Tee',     category: 'Tops',        price: 1299, emoji: '👕', colors: ['#dbe4ff', '#b8c7ff'], rating: 4.6, desc: 'Soft 100% cotton t-shirt with a relaxed fit. Easy to wear every day.' },
  { id: 2,  name: 'Oversized Hoodie',       category: 'Tops',        price: 3499, emoji: '🧥', colors: ['#e9dcff', '#cdb4ff'], rating: 4.8, desc: 'Warm fleece-lined hoodie with a roomy hood and front pocket.' },
  { id: 3,  name: 'Slim Fit Jeans',         category: 'Bottoms',     price: 3999, emoji: '👖', colors: ['#cfe3ff', '#9fc4f5'], rating: 4.5, desc: 'Stretch denim jeans that keep their shape wash after wash.' },
  { id: 4,  name: 'Summer Floral Dress',    category: 'Tops',        price: 4599, emoji: '👗', colors: ['#ffe0ea', '#ffbdd1'], rating: 4.7, desc: 'Lightweight, breathable dress with a flattering floral print.' },
  { id: 5,  name: 'Denim Jacket',           category: 'Outerwear',   price: 5999, emoji: '🧥', colors: ['#d6e6ff', '#a9c8f7'], rating: 4.4, desc: 'A timeless layer for cool evenings, with sturdy metal buttons.' },
  { id: 6,  name: 'Winter Puffer Coat',     category: 'Outerwear',   price: 8999, emoji: '🧥', colors: ['#dff5ee', '#b4e6d4'], rating: 4.9, desc: 'Insulated, water-resistant coat that keeps you warm in cold weather.' },
  { id: 7,  name: 'Everyday Sneakers',      category: 'Footwear',    price: 5499, emoji: '👟', colors: ['#ffe9d2', '#ffd1a1'], rating: 4.6, desc: 'Cushioned, lightweight sneakers made for all-day comfort.' },
  { id: 8,  name: 'Leather Formal Shoes',   category: 'Footwear',    price: 6999, emoji: '👞', colors: ['#efe3d6', '#d9c2a8'], rating: 4.3, desc: 'Polished formal shoes with a comfortable padded sole.' },
  { id: 9,  name: 'Cotton Baseball Cap',    category: 'Accessories', price: 899,  emoji: '🧢', colors: ['#ffe3e3', '#ffbcbc'], rating: 4.2, desc: 'Adjustable cap with a curved brim and breathable cotton fabric.' },
  { id: 10, name: 'Woollen Winter Scarf',   category: 'Accessories', price: 1499, emoji: '🧣', colors: ['#ffe8cf', '#ffc995'], rating: 4.7, desc: 'Thick, cosy scarf in a soft wool blend.' },
  { id: 11, name: 'Canvas Tote Bag',        category: 'Accessories', price: 1199, emoji: '👜', colors: ['#e3f3d9', '#c2e3ac'], rating: 4.5, desc: 'Roomy, sturdy tote for books, laptops and groceries.' },
  { id: 12, name: 'Jogger Track Pants',     category: 'Bottoms',     price: 2299, emoji: '🩳', colors: ['#e0e0ff', '#c0c0f5'], rating: 4.4, desc: 'Comfortable joggers with an elastic waist and tapered legs.' }
];
