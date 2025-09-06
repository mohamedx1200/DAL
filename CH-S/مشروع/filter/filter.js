
        // العناصر الرئيسية
        const filterBtn = document.getElementById("filterBtn");
        const filterDiv = document.getElementById("filterdiv");
        const overlay = document.getElementById("overlay");
        const closeFilter = document.getElementById("closeFilter");
        const selectedText = document.getElementById("selectedText");
        const applyBtn = document.getElementById("applyBtn");
        const resetBtn = document.getElementById("resetBtn");
        const propertyIcons = document.querySelectorAll(".property-icon");
        const selectionToggle = document.getElementById("selectionToggle");
        const propertyIconsContainer = document.getElementById("propertyIcons");
        
        // أنواع العقارات المختارة
        let selectedProperties = [];
        let iconsVisible = false;
        
        // فتح نافذة الفلترة
        filterBtn.addEventListener("click", () => {
            filterDiv.style.display = "block";
            overlay.style.display = "block";
            document.body.style.overflow = "hidden";
            // إخفاء الأيقونات عند فتح النافذة
            hidePropertyIcons();
        });
        
        // إغلاق نافذة الفلترة
        function closeFilterDiv() {
            filterDiv.style.display = "none";
            overlay.style.display = "none";
            document.body.style.overflow = "auto";
            // إخفاء الأيقونات عند الإغلاق
            hidePropertyIcons();
        }
        
        closeFilter.addEventListener("click", closeFilterDiv);
        overlay.addEventListener("click", closeFilterDiv);
        
        // إغلاق بالنقر على زر Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeFilterDiv();
        });
        
        // تبديل ظهور وإخفاء الأيقونات عند النقر على العنصر المدمج
        selectionToggle.addEventListener("click", () => {
            if (iconsVisible) {
                hidePropertyIcons();
            } else {
                showPropertyIcons();
            }
        });
        
        // إظهار الأيقونات
        function showPropertyIcons() {
            propertyIconsContainer.classList.add("active");
            selectionToggle.classList.add("active");
            iconsVisible = true;
        }
        
        // إخفاء الأيقونات
        function hidePropertyIcons() {
            propertyIconsContainer.classList.remove("active");
            selectionToggle.classList.remove("active");
            iconsVisible = false;
        }
        
        // تحديد نوع العقار بالنقر على الأيقونة
        propertyIcons.forEach(icon => {
            icon.addEventListener("click", (e) => {
                e.stopPropagation(); // منع إغلاق القائمة عند النقر على أيقونة
                
                const type = icon.getAttribute("data-type");
                
                if (selectedProperties.includes(type)) {
                    // إلغاء التحديد إذا كان مسبقًا
                    selectedProperties = selectedProperties.filter(item => item !== type);
                    icon.classList.remove("selected");
                } else {
                    // إضافة التحديد
                    selectedProperties.push(type);
                    icon.classList.add("selected");
                }
                
                updateSelectionDisplay();
            });
        });
        
        // تحديث عرض التحديدات
        function updateSelectionDisplay() {
            if (selectedProperties.length > 0) {
                selectedText.textContent = "نوع العقار: " + selectedProperties.join("، ");
            } else {
                selectedText.textContent = "اختر نوع العقار";
            }
        }
        
        // تطبيق الفلترة
        applyBtn.addEventListener("click", () => {
            if (selectedProperties.length > 0) {
                alert(`تم تطبيق الفلترة على: ${selectedProperties.join("، ")}`);
            } else {
                alert("لم تقم باختيار أي أنواع عقارات");
            }
            
            closeFilterDiv();
        });
        
        // إعادة التعيين
        resetBtn.addEventListener("click", () => {
            selectedProperties = [];
            propertyIcons.forEach(icon => {
                icon.classList.remove("selected");
            });
            updateSelectionDisplay();
            alert("تم إعادة تعيين الفلترة");
        });
        import { houseMarkers } from "../map/map.js";
import { getMarkerIcon } from "../download/load-houses.js";

export function addHouseToMap(houseId, houseData) {
  const marker = L.marker([houseData.lat, houseData.lng], {
    icon: getMarkerIcon(houseId),
  }).addTo(window.map);

  // تخزين المؤشر
  houseMarkers[houseId] = marker;

  // تخزين بيانات العقار للفلترة
  if (!window.housesMap) window.housesMap = {};
  window.housesMap[houseId] = houseData;

  // (مثال) عند الضغط على المؤشر
  marker.on("click", () => {
    console.log("عقار:", houseId, houseData.propertyType);
  });
}
