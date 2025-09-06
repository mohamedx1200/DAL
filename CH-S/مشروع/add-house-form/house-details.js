import { auth } from '../../firebase.js';
import { map, houseMarkers } from '../map/map.js';
import { toggleHouseReaction } from '../download/reactions.js';
import { getMarkerIcon } from '../download/load-houses.js'; 

export function renderHouseOnMap(data, id = `popup-${Date.now()}`) {
    if (!data.lat || !data.lng) {
        console.log("بيت بدون إحداثيات:", data.houseName);
        return;
    }

    // تفاعلات المستخدم
    const { liked = [], viewed = [], later = [] } = window.userReactions || {};
    let currentReaction = null;
    if (liked.includes(data.houseName)) currentReaction = 'liked';
    else if (viewed.includes(data.houseName)) currentReaction = 'viewed';
    else if (later.includes(data.houseName)) currentReaction = 'later';

    const user = auth.currentUser;
    const isMine = user && data.addedBy === user.uid;

    // زر الذهاب للموقع
    const gpsBtn = `<a href="https://maps.google.com/?q=${data.lat},${data.lng}" target="_blank" class="map-btn">📍 الذهاب إلى الموقع</a>`;

    // زر الحذف (للمالك فقط)
    const deleteBtn = isMine 
        ? `<button onclick="deleteHouse('${data.houseName}')" class="delete-btn">🗑️ حذف العقار</button>`
        : '';
    // 
    // معرض الصور (إذا كانت موجودة)
const imageGallery = data.images && data.images.length > 0 ? `
    <div class="image-gallery-container">
        <button class="prev-btn" id="prev-${data.houseName}">⬅️</button>
        <img src="${data.images[0]}" class="gallery-img" id="gallery-${data.houseName}" />
        <button class="next-btn" id="next-${data.houseName}">➡️</button>
        <p style="text-align:center;">
            <small id="image-counter-${data.houseName}">1 / ${data.images.length}</small>
        </p>
    </div>
` : '';

    // قسم المعلومات الأساسية
    const basicInfo = `
        <div class="popup-section">
            <h3>${data.houseName}</h3>

            ${data.address ? `<p><strong>📍 العنوان:</strong> ${data.address}</p>` : ''}
            ${data.description ? `<p><strong>📝 الوصف:</strong> ${data.description}</p>` : ''}
            ${data.addedAt ? `<p><small>تم الإضافة في: ${new Date(data.addedAt).toLocaleDateString()}</small></p>` : ''}
        </div>
    `;

    // قسم التفاصيل الفنية
    const details = `
        <div class="popup-section">
            <h4>تفاصيل العقار</h4>
            ${data.propertyType ? `<p><strong>🏠 نوع العقار:</strong> ${data.propertyType}</p>` : ''}
            ${data.totalArea ? `<p><strong>📏 المساحة:</strong> ${data.totalArea} م²</p>` : ''}
            ${data.builtArea ? `<p><strong>🏗️ المساحة المبنية:</strong> ${data.builtArea} م²</p>` : ''}
            ${data.floors ? `<p><strong>🏢 الطوابق:</strong> ${data.floors}</p>` : ''}
            ${data.finishingLevel ? `<p><strong>🧱 التشطيب:</strong> ${data.finishingLevel}</p>` : ''}
        </div>
    `;

    // قسم الغرف وأحجامها (المضاف حديثاً)
    const roomsInfo = [];
    const roomTypes = {
        'rooms': 'غرف النوم',
        'livingRooms': 'غرف المعيشة',
        'kitchens': 'المطابخ',
        'bathrooms': 'الحمامات',
        'toilets': 'دورات المياه'
    };

    Object.keys(roomTypes).forEach(type => {
        if (data[`${type}Sizes`] && data[`${type}Sizes`].length > 0) {
            const sizes = data[`${type}Sizes`].join('م², ') + 'م²';
            roomsInfo.push(`
                <p><strong>${roomTypes[type]}:</strong> 
                ${data[`${type}Sizes`].length} غرف (${sizes})</p>
            `);
        }
    });

    const roomsSection = roomsInfo.length > 0 
        ? `
            <div class="popup-section">
                <h4>🛏️ تفاصيل الغرف</h4>
                ${roomsInfo.join('')}
            </div>
        `
        : '';

    // قسم الصفقة والسعر
    const dealInfo = `
        <div class="popup-section">
            <h4>معلومات الصفقة</h4>
            ${data.dealType ? `<p><strong>📑 نوع العرض:</strong> ${data.dealType}</p>` : ''}
            ${data.price ? `<p><strong>💰 السعر:</strong> ${data.price} ${data.currency || ''}</p>` : ''}
            ${data.paymentType ? `<p><strong>💳 طريقة الدفع:</strong> ${data.paymentType}</p>` : ''}
            ${data.rentDuration ? `<p><strong>⏳ مدة الإيجار:</strong> ${data.rentDuration}</p>` : ''}
            ${data.mortgageDuration ? `<p><strong>🏦 مدة الرهن:</strong> ${data.mortgageDuration}</p>` : ''}
        </div>
    `;

    // قسم المميزات
    const features = data.features && data.features.length > 0 
        ? `
            <div class="popup-section">
                <h4>🛠️ مميزات العقار</h4>
                <ul class="features-list">
                    ${data.features.map(feat => `<li>${feat}</li>`).join('')}
                </ul>
            </div>
        `
        : '';

    // قسم الاتصال
    const contactInfo = data.phone && !isMine
        ? `
            <div class="popup-section">
                <h4>📞 الاتصال</h4>
                <p>رقم الهاتف: ${data.phone}</p>
                ${gpsBtn}
            </div>
        `
        : gpsBtn;

    // تجميع كل الأقسام
    const popupContent = `
        <div class="house-popup">
            ${basicInfo}
            ${details}
            ${roomsSection}
            ${dealInfo}
            ${features}
            ${contactInfo}
            ${deleteBtn}
            ${imageGallery}
            ${!isMine ? `
                <hr/>
                <div class="reaction-group" id="reaction-${data.houseName}">
                    <button class="reaction-btn ${currentReaction === 'liked' ? 'active' : ''}" onclick="toggleHouseReaction('${data.houseName}', 'liked')">👍 أعجبني</button>
                    <button class="reaction-btn ${currentReaction === 'viewed' ? 'active' : ''}" onclick="toggleHouseReaction('${data.houseName}', 'viewed')">👁️ شاهدته</button>
                    <button class="reaction-btn ${currentReaction === 'later' ? 'active' : ''}" onclick="toggleHouseReaction('${data.houseName}', 'later')">⏳ لاحقًا</button>
                </div>
            ` : ''}
        </div>
    `;

    // إنشاء العلامة على الخريطة
    const marker = L.marker([data.lat, data.lng], {
        icon: getMarkerIcon(data.houseName, data)
    }).addTo(map);
    
    houseMarkers[data.houseName] = marker;

    // ربط المحتوى بالعلامة
    marker.bindPopup(popupContent, { 
        maxWidth: 300,
        minWidth: 250,
        className: 'custom-popup'
    });

    // عند فتح النافذة المنبثقة
marker.on('popupopen', () => {
    // معرف البيت
    const houseId = data.houseName;

    // تأكد أن العناصر موجودة
    const galleryImg = document.getElementById(`gallery-${houseId}`);
    const counter = document.getElementById(`image-counter-${houseId}`);
    const prevBtn = document.getElementById(`prev-${houseId}`);
    const nextBtn = document.getElementById(`next-${houseId}`);

    if (!galleryImg || !counter || !prevBtn || !nextBtn) return;

    let currentIndex = 0;

    const showImage = (index) => {
        galleryImg.src = data.images[index];
        counter.textContent = `${index + 1} / ${data.images.length}`;
    };

    showImage(currentIndex); // عرض أول صورة

    prevBtn.onclick = () => {
        currentIndex = (currentIndex - 1 + data.images.length) % data.images.length;
        showImage(currentIndex);
    };

    nextBtn.onclick = () => {
        currentIndex = (currentIndex + 1) % data.images.length;
        showImage(currentIndex);
    };
});


}