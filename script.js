// 1. قمنا بتعريف قائمة الأقسام وربطنا كل قسم باسم أيقونة من مكتبة FontAwesome
const appCategories = [
    { name: 'الخضار والفواكه', icon: 'fa-apple-whole' }, // أيقونة تفاحة
    { name: 'لحوم', icon: 'fa-drumstick-bite' },         // أيقونة قطعة لحم
    { name: 'معجنات', icon: 'fa-bread-slice' },          // أيقونة شريحة خبز
    { name: 'مشويات', icon: 'fa-fire-burner' },          // أيقونة شواية/نار
    { name: 'عروض', icon: 'fa-tags' },                   // أيقونة بطاقات خصم
    { name: 'البقوليات', icon: 'fa-seedling' }           // أيقونة نبتة/بذور (القسم الذي أضفته)
];

// 2. البحث عن الحاوية الفارغة في ملف HTML لنضع بداخلها الأقسام
const container = document.getElementById('categories-container');

// 3. نمر على كل قسم في القائمة ونقوم بإنشاء الحقل الخاص به
appCategories.forEach(category => {
    
    // إنشاء عنصر HTML جديد يمثل البطاقة/الحقل
    const card = document.createElement('div');
    card.className = 'category-card'; // إعطاؤه الكلاس الخاص بالتصميم ثلاثي الأبعاد والزجاجي

    // وضع الأيقونة واسم القسم بداخل البطاقة
    card.innerHTML = `
        <i class="fa-solid ${category.icon}"></i>
        <h3>${category.name}</h3>
    `;

    // إضافة تفاعل عند النقر على أي قسم
    card.addEventListener('click', () => {
        alert(`لقد قمت بالنقر على قسم: ${category.name}`);
        // لاحقاً سنقوم بتغيير هذا الكود ليفتح صفحة المنتجات الخاصة بهذا القسم
    });

    // أخيراً، إضافة البطاقة الجاهزة إلى الشاشة
    container.appendChild(card);
});
