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

// 1. TỌA ĐỘ CHÍNH XÁC CỦA CÁC ĐỊA ĐIỂM TRÊN ẢNH SƠ ĐỒ KHU 2
const campusLocations = {
  // --- Khu vực Cổng A & Phía Đông (Bên phải bản đồ) ---
  "KT":   { name: "Trường Kinh Tế", x: 68.8, y: 64.0 },
  "MT":   { name: "Khoa Khoa học Chính trị", x: 67.5, y: 74.0 },
  "KH":   { name: "Khoa Khoa học Tự nhiên", x: 60.8, y: 65.5 },
  "XH":   { name: "Khoa Khoa học Xã hội và Nhân văn", x: 64.5, y: 83.8 },
  "A3":   { name: "Nhà học A3", x: 61.0, y: 84.0 },
  "TDTT": { name: "Khoa Giáo dục Thể chất / Nhà thi đấu mới", x: 62.0, y: 53.5 },

  // --- Khu vực Cổng B & Trục Giữa ---
  "D1":   { name: "Nhà học D1 (Nhà Điều hành)", x: 54, y: 84.0 },
  "D2":   { name: "Nhà học D2 (Nhà Điều hành)", x: 54, y: 78.5 },
  "TTHL": { name: "Trung tâm Học liệu", x: 57.0, y: 85.0 },
  "C1":   { name: "Nhà học C1", x: 55.0, y: 73.5 },
  "DI":   { name: "Trường Công nghệ Thông tin & Truyền thông", x: 54.0, y: 66.0 },
  "B1":   { name: "Nhà học B1", x: 51.0, y: 56.0 },
  "CN":   { name: "Trường Bách Khoa", x: 52.0, y: 46.5 },
  "NN":   { name: "Trường Nông nghiệp", x: 43.5, y: 63.5 },
  "HTR":  { name: "Hội trường Rùa", x: 46.0, y: 79.0 },

  // --- Khu vực Cổng C & Phía Tây (Bên trái bản đồ) ---
  "ATL":  { name: "Tòa nhà Công nghệ cao (ATL)", x: 48.0, y: 85.0 },
  "KL":   { name: "Khoa Luật", x: 44.5, y: 84.0 },
  "K1":   { name: "Trung tâm Ngoại ngữ", x: 44.5, y: 87.0 },
  "C2":   { name: "Nhà học C2", x: 41.0, y: 73.0 },
  "KSP":  { name: "Khoa Sư phạm", x: 38.8, y: 73.5 },
  "DB":   { name: "Khoa Dự bị Dân tộc", x: 35.5, y: 71.5 },
  "RLC":  { name: "Tòa nhà Khu phức hợp Phòng thí nghiệm (RLC)", x: 45.5, y: 49.5 },
  "CNSH": { name: "Viện CN Sinh học và Thực phẩm", x: 40.5, y: 49.8 },
  "TS":   { name: "Trường Thủy sản", x: 42.5, y: 39.0 },
  "MTN":  { name: "Khoa Môi trường & Tài nguyên Thiên nhiên", x: 25.8, y: 59.8 },

  // --- ĐỊA ĐIỂM NGOÀI KHU 2 (KHÔNG CÓ TỌA ĐỘ TRÊN BẢN ĐỒ NÀY) ---
  "TTGDQP": {
    name: "Trung tâm Giáo dục Quốc phòng và An ninh",
    isOffCampus: true,
    locationDesc: "Khu Hòa An (Huyện Phụng Hiệp, Hậu Giang) — Không nằm trong Khu II Cần Thơ."
  }
};

// 2. BỘ QUY TẮC NHẬN DIỆN CÁC PHÒNG ĐẶC BIỆT (KHÔNG DÙNG DẤU GẠCH CHÉO "/")
const specialRules = [
  // Thực tập Hóa, Lý, Sinh - Khoa KHTN
  { pattern: /^(H[23]-KH[12]|HPTICH|HOAPT[12]|HOATN1|PTN\/KH)$/i, targetKey: "KH", label: "Phòng Thực tập Hóa học" },
  { pattern: /^(L[12]-KH[12])$/i, targetKey: "KH", label: "Phòng Thực tập Vật lý" },
  { pattern: /^(SH[45]|TNSINH|TTSINH)$/i, targetKey: "KH", label: "Phòng Thực tập Sinh học" },

  // Tin học đại cương - Trường CNTT&TT
  { pattern: /^(DITHUD|TH\d+DI)$/i, targetKey: "DI", label: "Phòng Thực tập Tin học" },

  // Phòng thí nghiệm và thực hành chuyên ngành
  { pattern: /^PTN-?SH$/i, targetKey: "CNSH", label: "Phòng thí nghiệm Viện CNSH&TP" },
  { pattern: /^PMT-?XH$/i, targetKey: "XH", label: "Phòng máy tính Khoa KHXH&NV" },

  // Hội trường chuyên khoa
  { pattern: /^HTKHTN$/i, targetKey: "KH", label: "Hội trường Khoa KHTN" },
  { pattern: /^HTXHNV$/i, targetKey: "XH", label: "Hội trường Khoa KHXH&NV" },
  { pattern: /^HT\/?KSP$/i, targetKey: "KSP", label: "Hội trường Khoa Sư phạm" },
  { pattern: /^HTR$/i, targetKey: "HTR", label: "Hội trường Rùa" },

  // Quốc phòng an ninh
  { pattern: /^TTGDQP$/i, targetKey: "TTGDQP", label: "Trung tâm GDQP&AN" }
];

// 3. BỘ PHÂN TÍCH VÀ BÓC TÁCH MÃ PHÒNG (MULTI-PATTERN PARSER)
function parseClassroom(rawInput) {
  const input = rawInput.trim().toUpperCase();

  // A. Trường hợp: Lớp học trực tuyến / phòng ảo (TTxxKH, TTxxLK, TTQPxx)
  // DÒNG MỚI: Chỉ nhận diện phòng ảo khi có số lớp hoặc tiền tố xx thực sự, loại trừ hoàn toàn TTGDQP
    if (/^TT\d*(KH|LK|QP\d+)$/i.test(input)) {
    return {
      status: "ONLINE",
      msg: `💻 Mã phòng <strong>${input}</strong> là phòng học trực tuyến (Google Meet / E-Learning), không học trực tiếp tại giảng đường.`
    };
  }

  // B. Trường hợp: Các phòng thực tập, hội trường đặc biệt (H2-KH1, SH4, DITHUD, TTGDQP...)
  for (const rule of specialRules) {
    if (rule.pattern.test(input)) {
      return {
        status: "FOUND",
        targetKey: rule.targetKey,
        roomText: input,
        extraDesc: rule.label
      };
    }
  }

  // C. Trường hợp: Có dấu gạch chéo chuẩn (VD: 101/KT, 202/C1, 301/DI, 105/A3)
  if (input.includes("/")) {
    const [room, code] = input.split("/").map(s => s.trim());
    return {
      status: "FOUND",
      targetKey: code,
      roomText: `Phòng ${room}`,
      extraDesc: ""
    };
  }

  // D. Trường hợp: Viết liền không dấu "/" (VD: 101ATL, 203RLC, KT, C1)
  const directMatch = input.match(/^(\d{0,3})([A-Z0-9]+)$/);
  if (directMatch) {
    const roomPart = directMatch[1];
    const codePart = directMatch[2];

    if (campusLocations[codePart]) {
      return {
        status: "FOUND",
        targetKey: codePart,
        roomText: roomPart ? `Phòng ${roomPart}` : "",
        extraDesc: ""
      };
    }
  }

  return { status: "UNKNOWN" };
}

// 4. BỘ ĐIỀU KHIỂN SỰ KIỆN GIAO DIỆN
document.addEventListener("DOMContentLoaded", () => {
  const roomInput = document.getElementById("roomInput");
  const lookupBtn = document.getElementById("lookupBtn");
  const lookupResult = document.getElementById("lookupResult");
  const mapMarker = document.getElementById("mapMarker");
  const markerLabel = document.getElementById("markerLabel");

  if (!roomInput || !lookupBtn || !lookupResult) return;

  function executeSearch() {
    const rawVal = roomInput.value.trim();

    if (!rawVal) {
      if (mapMarker) mapMarker.classList.add("hidden");
      lookupResult.innerHTML = "⚠️ Vui lòng nhập mã phòng hoặc mã dãy nhà cần tìm.";
      return;
    }

    if (rawVal === "TTGDQP") {
    if (mapMarker) mapMarker.classList.add("hidden");
    lookupResult.innerHTML = "📢 <strong>Các phòng học thuộc Trung tâm Giáo dục Quốc phòng và An ninh ở Khu Hòa An (Hậu Giang cũ).</strong>";
    return;
  }

    const result = parseClassroom(rawVal);

    // Xử lý thông báo phòng học Online
    if (result.status === "ONLINE") {
      if (mapMarker) mapMarker.classList.add("hidden");
      lookupResult.innerHTML = result.msg;
      return;
    }

    // Xử lý khi nhận diện được địa điểm
    if (result.status === "FOUND") {
      const loc = campusLocations[result.targetKey];

      if (!loc) {
        if (mapMarker) mapMarker.classList.add("hidden");
        lookupResult.innerHTML = `⚠️ Nhận diện được mã <strong>${result.targetKey}</strong> nhưng chưa có thông tin vị trí.`;
        return;
      }

      // NẾU LÀ ĐỊA ĐIỂM NGOÀI KHU II (HIỂN THỊ CHỮ THÔNG BÁO, ẨN MARKER)
      if (loc.isOffCampus) {
        if (mapMarker) mapMarker.classList.add("hidden");
        lookupResult.innerHTML = `
          🏢 <strong>${loc.name}</strong><br>
          📢 <em>Thông báo: ${loc.locationDesc}</em>
        `;
        return;
      }

      // ĐỊA ĐIỂM NẰM TRONG KHU II (ĐỊNH VỊ CHÍNH XÁC TRÊN BẢN ĐỒ)
      const detailText = result.extraDesc ? `— ${result.extraDesc}` : "";
      lookupResult.innerHTML = `📍 <strong>${loc.name}</strong>${result.roomText ? `(${result.roomText})` : ""} ${detailText}`;

      if (mapMarker) {
        mapMarker.style.left = `${loc.x}%`;
        mapMarker.style.top = `${loc.y}%`;
        if (markerLabel) {
          markerLabel.innerText = `${loc.name}${result.roomText ? `[${result.roomText}]` : ""}`;
        }
        mapMarker.classList.remove("hidden");
      }
      return;
    }

    // Không tìm thấy kết quả phù hợp
    if (mapMarker) mapMarker.classList.add("hidden");
    lookupResult.innerHTML = `❌ Không tìm thấy thông tin cho mã: <strong>"${rawVal}"</strong>. Vui lòng kiểm tra lại thời khóa biểu.`;
  }

  lookupBtn.addEventListener("click", executeSearch);
  roomInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });
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