const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const notebookPages = [...document.querySelectorAll('.notebook-page')];
const notebookTabs = [...document.querySelectorAll('.notebook-tab')];
const pageCount = document.querySelector('.notebook-page-count');
const previousPageButton = document.querySelector('[data-page-step="-1"]');
const nextPageButton = document.querySelector('[data-page-step="1"]');
let currentNotebookPage = 0;

function showNotebookPage(pageIndex) {
  if (!notebookPages.length) return;

  currentNotebookPage = Math.max(0, Math.min(pageIndex, notebookPages.length - 1));

  notebookPages.forEach((page, index) => {
    page.hidden = index !== currentNotebookPage;
  });

  notebookTabs.forEach((tab) => {
    const isCurrentPage = Number(tab.dataset.notebookPage) === currentNotebookPage;
    tab.classList.toggle('active', isCurrentPage);

    if (isCurrentPage) {
      tab.setAttribute('aria-current', 'page');
    } else {
      tab.removeAttribute('aria-current');
    }
  });

  if (pageCount) {
    pageCount.textContent = `${currentNotebookPage + 1} / ${notebookPages.length}`;
  }

  if (previousPageButton) previousPageButton.disabled = currentNotebookPage === 0;
  if (nextPageButton) nextPageButton.disabled = currentNotebookPage === notebookPages.length - 1;
}

document.querySelectorAll('[data-notebook-page]').forEach((control) => {
  control.addEventListener('click', () => {
    showNotebookPage(Number(control.dataset.notebookPage));
  });
});

document.querySelectorAll('[data-page-step]').forEach((button) => {
  button.addEventListener('click', () => {
    showNotebookPage(currentNotebookPage + Number(button.dataset.pageStep));
  });
});

const pageHomeButton = document.querySelector('[data-page-home]');
if (pageHomeButton) {
  pageHomeButton.addEventListener('click', () => showNotebookPage(0));
}

showNotebookPage(0);

const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Dữ liệu mô tả các khu vực và ảnh tương ứng
const zoneData = {
  all: {
    title: "Bản đồ tổng thể khuôn viên trường",
    desc: "Xem vị trí các cổng ra vào, các dãy giảng đường chính và trạm giữ xe lớn.",
    img: "images + videos/473809083_122184466640123729_354960090892013734_n.jpg"
  },
  /*"khu-a": {
    title: "Khu A - Tòa Nhà Điều Hành",
    desc: "Vị trí: Cổng chính đi thẳng vào. Tập trung: Phòng Đào tạo (Tầng 1), Phòng CTSV (Tầng trệt), Phòng Kế hoạch - Tài chính.",
    img: "images + videos/536505394_1113983904166096_572346833513659683_n.jpg"
  },
  "khu-b": {
    title: "Khu Giảng Đường B (B1, B2)",
    desc: "Nơi học các môn đại cương (Toán, Triết học, Pháp luật, Ngoại ngữ). Gần bãi giữ xe số 2.",
    img: "images + videos/537417656_1113983917499428_4383064752979738337_n.jpg"
  },
  "khu-c": {
    title: "Khu Giảng Đường C (Công nghệ & Thực hành)",
    desc: "Khu phức hợp phòng máy tính, phòng lab thí nghiệm và xưởng thực hành chuyên ngành.",
    img: "images + videos/536760150_1113983897499430_1811123996418995984_n.jpg"
  },
  "tien-ich": {
    title: "Trung tâm Tiện ích: Thư viện & Hội trường",
    desc: "Thư viện mở cửa 7h00 - 21h00 các ngày trong tuần. Có phòng tự học máy lạnh và sảnh đọc sách nhóm.",
    img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
  } */
};

// 1. Logic chuyển tab khu vực
const zoneButtons = document.querySelectorAll(".zone-btn");
const mapImg = document.getElementById("campusMapImg");
const zoneCaption = document.getElementById("zoneCaption");

zoneButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    zoneButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const zoneKey = btn.dataset.zone;
    const currentZone = zoneData[zoneKey];

    if (currentZone) {
      mapImg.src = currentZone.img;
      zoneCaption.innerHTML = `📍 <strong>${currentZone.title}:</strong> ${currentZone.desc}`;
    }
  });
});

// ==========================================
// PHẦN 2: 👉 CHÈN ĐOẠN CODE RÚT GỌN VÀO ĐÂY 👈
// (Thay thế cho toàn bộ hàm decodeRoom cũ)
// ==========================================

// 1. Tọa độ (%) các khoa trên bản đồ
const campusZones = {
  "KT": { name: "Trường Kinh Tế", x: 68, y: 65 },       // Điều chỉnh x, y theo ảnh thực tế
  "CNTT": { name: "Trường CNTT & TT", x: 54, y: 66 },
  "NN": { name: "Trường Nông Nghiệp", x: 43, y: 64 },
  "KL": { name: "Khoa Luật", x: 45, y: 85 }
};

// 2. Khai báo phần tử DOM
const roomInput = document.getElementById("roomInput");
const lookupBtn = document.getElementById("lookupBtn");
const lookupResult = document.getElementById("lookupResult");
const mapMarker = document.getElementById("mapMarker");
const markerLabel = document.getElementById("markerLabel");

// 3. Hàm kiểm tra và phản hồi kết quả
function handleSearchRoom() {
  const value = roomInput.value.trim().toUpperCase();

  // Trường hợp 1: Để trống ô tìm kiếm
  if (!value) {
    if (mapMarker) mapMarker.classList.add("hidden");
    lookupResult.innerHTML = "⚠️ Vui lòng nhập mã phòng (Ví dụ mẫu: <strong>101/KT</strong>).";
    return;
  }

  // Trường hợp 2: Đúng cấu trúc có dấu gạch chéo "/"
  if (value.includes("/")) {
    const parts = value.split("/");
    const roomPart = parts[0].trim();
    const deptPart = parts[1].trim();

    // Kiểm tra xem mã khoa có trong dữ liệu không
    if (campusZones[deptPart]) {
      const zone = campusZones[deptPart];

      lookupResult.innerHTML = `✅ Tìm thấy: Phòng <strong>${roomPart}</strong> thuộc <strong>${zone.name}</strong>.`;
      
      // Hiển thị vòng tròn định vị
      if (mapMarker) {
        mapMarker.style.left = `${zone.x}%`;
        mapMarker.style.top = `${zone.y}%`;
        if (markerLabel) markerLabel.innerText = zone.name;
        mapMarker.classList.remove("hidden");
      }
      return;
    } else {
      // Đúng cấu trúc nhưng mã khoa không tồn tại
      if (mapMarker) mapMarker.classList.add("hidden");
      lookupResult.innerHTML = `❌ Không tìm thấy khoa/viện có mã <strong>"${deptPart}"</strong>. Vui lòng kiểm tra lại.`;
      return;
    }
  }

  // Trường hợp 3: Sai cấu trúc (không có dấu "/")
  if (mapMarker) mapMarker.classList.add("hidden");
  lookupResult.innerHTML = `⚠️ Sai định dạng tìm kiếm! Vui lòng nhập theo cú pháp: <strong>[Số phòng]/[Mã khoa]</strong> (Ví dụ: <strong>101/KT</strong>, <strong>203/CNTT</strong>).`;
}

// 4. Lắng nghe sự kiện Click nút và nhấn Enter
lookupBtn.addEventListener("click", handleSearchRoom);
roomInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSearchRoom();
});

// 3. Logic phóng to ảnh (Lightbox Modal) có hỗ trợ Zoom & Kéo bằng cả PC & Điện thoại
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const mapWrapper = document.getElementById("mapWrapper");

let scale = 1;
let transformX = 0;
let transformY = 0;

let isDragging = false;
let startX = 0;
let startY = 0;

let startTouchDistance = 0;
let startTouchScale = 1;

// 1. MỞ & ĐÓNG MODAL
function openModal() {
  modal.classList.add("show");
  modalImg.src = document.getElementById("campusMapImg").src;
  resetZoom();
}

function closeModal() {
  modal.classList.remove("show");
  resetZoom();
}

function resetZoom() {
  scale = 1;
  transformX = 0;
  transformY = 0;
  updateTransform();
}

function updateTransform() {
  modalImg.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;
}

mapWrapper.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeModal();
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});


// 2. ZOOM BẰNG CUỘN CHUỘT (PC)
modal.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = 0.1;
  if (e.deltaY < 0) {
    scale += zoomFactor; // Cuộn lên => Phóng to
  } else {
    scale -= zoomFactor; // Cuộn xuống => Thu nhỏ
  }
  scale = Math.min(Math.max(1, scale), 5); // Giới hạn zoom từ 1x đến 5x
  if (scale === 1) {
    transformX = 0;
    transformY = 0;
  }
  updateTransform();
}, { passive: false });


// 3. KÉO ĐỂ DI CHUYỂN (PC & Di động)
function startDrag(clientX, clientY) {
  if (scale > 1) {
    isDragging = true;
    startX = clientX - transformX;
    startY = clientY - transformY;
    modalImg.style.cursor = "grabbing";
  }
}

function drag(clientX, clientY) {
  if (!isDragging) return;
  transformX = clientX - startX;
  transformY = clientY - startY;
  updateTransform();
}

function endDrag() {
  isDragging = false;
  modalImg.style.cursor = scale > 1 ? "grab" : "default";
}

// Event chuột trên PC
modalImg.addEventListener("mousedown", (e) => {
  e.preventDefault();
  startDrag(e.clientX, e.clientY);
});
document.addEventListener("mousemove", (e) => {
  drag(e.clientX, e.clientY);
});
document.addEventListener("mouseup", () => {
  endDrag();
});


// 4. CHẠM ZOOM BẰNG 2 NGÓN TAY & VUỐT CHẠM (Di động)
modalImg.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    // Kéo bằng 1 ngón tay khi đã zoom
    startDrag(e.touches[0].clientX, e.touches[0].clientY);
  } else if (e.touches.length === 2) {
    // Thu phóng bằng 2 ngón tay (Pinch)
    isDragging = false; // Ngắt kéo khi zoom 2 ngón
    startTouchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    startTouchScale = scale;
  }
}, { passive: true });

modalImg.addEventListener("touchmove", (e) => {
  if (e.touches.length === 1 && isDragging) {
    drag(e.touches[0].clientX, e.touches[0].clientY);
  } else if (e.touches.length === 2 && startTouchDistance > 0) {
    const currentDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    const zoomFactor = currentDistance / startTouchDistance;
    scale = Math.min(Math.max(1, startTouchScale * zoomFactor), 5);
    updateTransform();
  }
}, { passive: false });

modalImg.addEventListener("touchend", (e) => {
  endDrag();
  if (e.touches.length < 2) {
    startTouchDistance = 0;
  }
});


// 5. CLICK ĐÚP CHUỘT/TAP ĐÚP ĐỂ RESET TRẠNG THÁI
let lastTap = 0;
modalImg.addEventListener("click", (e) => {
  const currentTime = new Date().getTime();
  const tapLength = currentTime - lastTap;
  if (tapLength < 300 && tapLength > 0) {
    // Nếu zoom rồi thì reset, chưa zoom thì phóng lên 2.5x
    if (scale > 1) {
      resetZoom();
    } else {
      scale = 2.5;
      updateTransform();
    }
  }
  lastTap = currentTime;
});

// Quản lý trạng thái lưu trữ của Checklist
document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".task-check");

  // 1. Tải trạng thái đã lưu từ LocalStorage lên giao diện
  checkboxes.forEach((box) => {
    const id = box.dataset.id;
    const isSaved = localStorage.getItem(`checklist_${id}`) === "true";
    box.checked = isSaved;
  });

  updateFolderProgress();

  // 2. Lưu lại mỗi khi người dùng tích/bỏ tích
  checkboxes.forEach((box) => {
    box.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      localStorage.setItem(`checklist_${id}`, e.target.checked);
      updateFolderProgress();
    });
  });

  // 3. Hàm tính toán và cập nhật số lượng đã xong trên từng thư mục
  function updateFolderProgress() {
    const folders = document.querySelectorAll(".folder-group");

    folders.forEach((folder) => {
      const total = folder.querySelectorAll(".task-check").length;
      const completed = folder.querySelectorAll(".task-check:checked").length;
      const badge = folder.querySelector(".badge-count");

      if (badge) {
        badge.innerText = `${completed}/${total}`;
        if (completed === total && total > 0) {
          badge.style.background = "#dcfce7";
          badge.style.color = "#15803d"; // Đổi màu xanh lá khi xong hết
        } else {
          badge.style.background = "#e2e8f0";
          badge.style.color = "#475569";
        }
      }
    });
  }
});