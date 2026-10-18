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
  "KT":   { name: "Trường Kinh Tế", x: 81.0, y: 64.0 },
  "MT":   { name: "Khoa Khoa học Chính trị", x: 80.0, y: 72.0 },
  "KH":   { name: "Khoa Khoa học Tự nhiên", x: 69.0, y: 65.5 },
  "XH":   { name: "Khoa Khoa học Xã hội và Nhân văn", x: 74.0, y: 83.8 },
  "A3":   { name: "Nhà học A3", x: 69.0, y: 83.0 },
  "TDTT": { name: "Khoa Giáo dục Thể chất / Nhà thi đấu mới", x: 62.0, y: 53.5 },

  // --- Khu vực Cổng B & Trục Giữa ---
  "D1":   { name: "Nhà học D1 (Nhà Điều hành)", x: 56.5, y: 83.0 },
  "D2":   { name: "Nhà học D2 (Nhà Điều hành)", x: 56.5, y: 76.5 },
  "TTHL": { name: "Trung tâm Học liệu", x: 61.5, y: 83.5 },
  "C1":   { name: "Nhà học C1", x: 61.5, y: 72.5 },
  "DI":   { name: "Trường Công nghệ Thông tin & Truyền thông", x: 56.0, y: 63.0 },
  "B1":   { name: "Nhà học B1", x: 52.0, y: 54.0 },
  "CN":   { name: "Trường Bách Khoa", x: 53.0, y: 42.5 },
  "NN":   { name: "Trường Nông nghiệp", x: 38.5, y: 60.5 },
  "HTR":  { name: "Hội trường Rùa", x: 43.5, y: 77.0 },

  // --- Khu vực Cổng C & Phía Tây (Bên trái bản đồ) ---
  "ATL":  { name: "Tòa nhà Công nghệ cao (ATL)", x: 47.0, y: 84.0 },
  "KL":   { name: "Khoa Luật", x: 41.5, y: 84.0 },
  "K1":   { name: "Trung tâm Ngoại ngữ", x: 40.5, y: 86.0 },
  "C2":   { name: "Nhà học C2", x: 36.0, y: 71.0 },
  "TSP":  { name: "Trường Sư phạm", x: 31.8, y: 71.5 },
  "DB":   { name: "Khoa Dự bị Dân tộc", x: 26.5, y: 70.5 },
  "RLC":  { name: "Tòa nhà Khu phức hợp Phòng thí nghiệm (RLC)", x: 41.5, y: 46.5 },
  "CNSH": { name: "Viện CN Sinh học và Thực phẩm", x: 34.8, y: 47.0 },
  "TS":   { name: "Trường Thủy sản", x: 37.5, y: 35.0 },
  "MTN":  { name: "Khoa Môi trường & Tài nguyên Thiên nhiên", x: 9.5, y: 57.8 },

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

// Biến lưu khu vực hiện tại (mặc định Khu 2)
let currentCampus = "khu2";

document.addEventListener("DOMContentLoaded", () => {
  const campusBtns = document.querySelectorAll(".campus-btn");
  const allMapImgs = document.querySelectorAll(".campus-map-img");
  const mapMarker = document.getElementById("mapMarker");
  const lookupResult = document.getElementById("lookupResult");
  const roomInput = document.getElementById("roomInput");
  const lookupBtn = document.getElementById("lookupBtn");

  // 1. CHUYỂN ĐỔI BẢN ĐỒ GIỮA CÁC KHU
  campusBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Đổi class nút bấm
      campusBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      currentCampus = btn.dataset.campus;

      // Ẩn tất cả ảnh, chỉ bật đúng ảnh của khu được bấm
      allMapImgs.forEach((img) => img.classList.remove("active-map"));
      const selectedImg = document.getElementById(`map-${currentCampus}`);
      if (selectedImg) {
        selectedImg.classList.add("active-map");
      }

      // Luôn ẩn điểm ghim đỏ khi đổi khu
      if (mapMarker) mapMarker.classList.add("hidden");

      // Cập nhật thông báo trạng thái
      if (lookupResult) {
        if (currentCampus === "khu2") {
          lookupResult.innerHTML = "Đang ở <strong>Khu 2</strong>. Bạn có thể tra cứu mã phòng học bên trên.";
        } else {
          lookupResult.innerHTML = `Đang xem sơ đồ <strong>${btn.textContent.trim()}</strong>.`;
        }
      }
    });
  });

  // 2. HÀM TÌM KIẾM
  function executeSearch() {
    const rawVal = roomInput ? roomInput.value.trim().toUpperCase() : "";

    // A. Nếu không phải Khu 2: Báo chưa hỗ trợ và dừng lại ngay
    if (currentCampus !== "khu2") {
      if (mapMarker) mapMarker.classList.add("hidden");
      if (lookupResult) {
        lookupResult.innerHTML = "⚠️ <strong>Hiện tại phần tìm kiếm của Khu vực này chưa được cập nhật</strong>";
      }
      return;
    }

    // B. Ô nhập trống
    if (!rawVal) {
      if (mapMarker) mapMarker.classList.add("hidden");
      if (lookupResult) {
        lookupResult.innerHTML = "⚠️ Vui lòng nhập mã phòng học cần tìm.";
      }
      return;
    }

    // C. Xử lý riêng biệt TTGDQP
    if (rawVal === "TTGDQP" || rawVal === "GDQP") {
      if (mapMarker) mapMarker.classList.add("hidden");
      if (lookupResult) {
        lookupResult.innerHTML = "📢 <strong>Các phòng học thuộc Trung tâm Giáo dục Quốc phòng và An ninh ở Khu Hòa An (Hậu Giang cũ).</strong>";
      }
      return;
    }

    // D. Phân tích phòng học cho Khu 2
    const result = parseClassroom(rawVal);

    if (result.status === "ONLINE") {
      if (mapMarker) mapMarker.classList.add("hidden");
      if (lookupResult) lookupResult.innerHTML = result.msg;
      return;
    }

    if (result.status === "FOUND") {
      const loc = campusLocations[result.targetKey];
      if (loc && !loc.isOffCampus) {
        if (lookupResult) {
          lookupResult.innerHTML = `📍 <strong>${loc.name}</strong> ${result.roomText ? `(${result.roomText})` : ""}`;
        }
        if (mapMarker) {
          mapMarker.style.left = `${loc.x}%`;
          mapMarker.style.top = `${loc.y}%`;
          mapMarker.classList.remove("hidden");
        }
        return;
      }
    }

    // E. Không tìm thấy
    if (mapMarker) mapMarker.classList.add("hidden");
    if (lookupResult) {
      lookupResult.innerHTML = `❌ Không tìm thấy phòng hoặc dãy nhà: <strong>"${rawVal}"</strong>.`;
    }
  }

  // 3. GẮN SỰ KIỆN TÌM KIẾM
  if (lookupBtn) {
    lookupBtn.addEventListener("click", executeSearch);
  }
  if (roomInput) {
    roomInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") executeSearch();
    });
  }
});

// ==========================================================
// ==========================================================
// HỆ THỐNG LIGHTBOX ZOOM DÙNG CHUNG CHO TẤT CẢ SƠ ĐỒ
// (Căn tin Khu 2, Sơ đồ Khu 1, Khu 2, Khu 3, Khu Hòa An)
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const closeModalBtn = document.getElementById("closeModalBtn");

  if (!modal || !modalImg) return;

  let scale = 1;
  let transformX = 0;
  let transformY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let hasDragged = false;
  let startTouchDistance = 0;
  let startTouchScale = 1;
  let lastTap = 0;

  function updateTransform() {
    modalImg.style.transform = `translate(${transformX}px, ${transformY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    transformX = 0;
    transformY = 0;
    updateTransform();
  }

  // Hàm mở Modal dùng chung: nhận vào thẻ ảnh hoặc đường link ảnh
  function openZoomModal(imgSrc) {
    if (!imgSrc) return;
    modalImg.src = imgSrc;
    resetZoom();
    modal.classList.add("show");
  }

  // Hàm đóng Modal
  function closeZoomModal() {
    modal.classList.remove("show");
    resetZoom();
  }

  // 1. GẮN SỰ KIỆN CLICK MỞ MODAL CHO TẤT CẢ ẢNH CẦN PHÓNG TO
  // Bao gồm: #canteenMapImg, #map-khu1, #map-khu2, #map-khu3, #map-hoaan
  const targetImageIds = ["canteenMapImg", "map-khu1", "map-khu2", "map-khu3", "map-hoaan"];
  
  targetImageIds.forEach((id) => {
    const imgEl = document.getElementById(id);
    if (imgEl) {
      imgEl.style.cursor = "zoom-in";
      imgEl.addEventListener("click", (e) => {
        e.stopPropagation();
        openZoomModal(imgEl.src);
      });
    }
  });

  // Hỗ trợ cả 2 nút bấm "Phóng to" (nút ở sơ đồ căn tin và nút ở sơ đồ trường)
  const openCanteenBtn = document.getElementById("openCanteenModalBtn");
  if (openCanteenBtn) {
    openCanteenBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const canteenImg = document.getElementById("canteenMapImg");
      if (canteenImg) openZoomModal(canteenImg.src);
    });
  }

  const openModalBtn = document.getElementById("openModalBtn");
  if (openModalBtn) {
    openModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // Lấy ảnh đang hiển thị (.active-map) trong trang Sơ đồ
      const activeMap = document.querySelector(".notebook-page .campus-map-img.active-map") ||
                        document.querySelector(".campus-map-img.active-map");
      if (activeMap) openZoomModal(activeMap.src);
    });
  }

  // 2. ĐÓNG MODAL KHI BẤM NÚT X
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeZoomModal();
    });
  }

  // 3. ĐÓNG MODAL KHI BẤM VÀO KHOẢNG TRỐNG BÊN NGOÀI
  modal.addEventListener("click", (e) => {
    // Chỉ đóng khi người dùng click trực tiếp vào vùng nền đen (không click vào ảnh)
    // và không phải đang thực hiện thao tác kéo rê chuột
    if (e.target === modal && !hasDragged) {
      closeZoomModal();
    }
  });

  // Đóng khi bấm phím ESC trên bàn phím
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
      closeZoomModal();
    }
  });

  // 4. ZOOM BẰNG CUỘN CHUỘT TRÊN MÁY TÍNH
  modal.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 0.18;
    if (e.deltaY < 0) {
      scale += zoomFactor;
    } else {
      scale -= zoomFactor;
    }
    scale = Math.min(Math.max(1, scale), 5); // Giới hạn từ 1x đến 5x
    if (scale === 1) {
      transformX = 0;
      transformY = 0;
    }
    updateTransform();
  }, { passive: false });

  // 5. KÉO DI CHUYỂN KHI ĐANG PHÓNG TO TRÊN PC
  modalImg.addEventListener("dragstart", (e) => e.preventDefault());
  modalImg.addEventListener("mousedown", (e) => {
    if (scale > 1) {
      isDragging = true;
      hasDragged = false;
      startX = e.clientX - transformX;
      startY = e.clientY - transformY;
      modalImg.style.cursor = "grabbing";
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const currentX = e.clientX - startX;
    const currentY = e.clientY - startY;
    if (Math.hypot(currentX - transformX, currentY - transformY) > 5) {
      hasDragged = true;
    }
    transformX = currentX;
    transformY = currentY;
    updateTransform();
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      modalImg.style.cursor = scale > 1 ? "grab" : "zoom-in";
      // Giữ hasDragged một khoảng thời gian ngắn để chặn sự kiện click nhầm
      setTimeout(() => { hasDragged = false; }, 80);
    }
  });

  // 6. ZOOM & VUỐT CHẠM CẢM ỨNG TRÊN ĐIỆN THOẠI
  modalImg.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && scale > 1) {
      isDragging = true;
      hasDragged = false;
      startX = e.touches[0].clientX - transformX;
      startY = e.touches[0].clientY - transformY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      startTouchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      startTouchScale = scale;
    }
  }, { passive: true });

  modalImg.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && isDragging) {
      hasDragged = true;
      transformX = e.touches[0].clientX - startX;
      transformY = e.touches[0].clientY - startY;
      updateTransform();
    } else if (e.touches.length === 2 && startTouchDistance > 0) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const zoomRatio = currentDistance / startTouchDistance;
      scale = Math.min(Math.max(1, startTouchScale * zoomRatio), 5);
      updateTransform();
    }
  }, { passive: false });

  modalImg.addEventListener("touchend", (e) => {
    isDragging = false;
    if (e.touches.length < 2) {
      startTouchDistance = 0;
    }
  });

  // 7. CLICK ĐÚP ĐỂ ZOOM NHANH 2.5X HOẶC TRỞ VỀ 1X
  modalImg.addEventListener("click", (e) => {
    e.stopPropagation(); // Không cho nổi bọt ra vùng ngoài
    if (hasDragged) return;
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0) {
      if (scale > 1) {
        resetZoom();
      } else {
        scale = 2.5;
        updateTransform();
      }
    }
    lastTap = currentTime;
  });
});

// ==========================================================
// KHẮC PHỤC CHUYỂN TAB CĂN TIN TRƯỜNG & GIỜ MỞ CỬA
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const canteenBtns = document.querySelectorAll(".canteen-tab-btn");
  const canteenPanes = document.querySelectorAll(".canteen-tab-pane");

  canteenBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      // 1. Cập nhật nút đang chọn (bôi xanh)
      canteenBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // 2. Ẩn tất cả các khung nội dung tab
      canteenPanes.forEach((pane) => {
        pane.style.display = "none";
        pane.classList.remove("active");
      });

      // 3. Hiển thị khung tương ứng theo data-canteen-tab ("map" hoặc "schedule")
      const tabTarget = btn.getAttribute("data-canteen-tab");
      const targetPane = document.getElementById(`canteen-pane-${tabTarget}`);
      if (targetPane) {
        targetPane.style.display = "block";
        targetPane.classList.add("active");
      }
    });
  });
});

// ==========================================================
// BỘ ĐẾM VÀ LƯU TRỮ CHECKLIST (DÁN VÀO CUỐI FILE script.js)
// ==========================================================
function updateFolderProgress() {
  const folders = document.querySelectorAll(".folder-group");
  folders.forEach((folder) => {
    const checkboxes = folder.querySelectorAll(".task-check");
    const total = checkboxes.length;
    if (total === 0) return;

    let completed = 0;
    checkboxes.forEach((box) => {
      if (box.checked) completed++;
    });

    const badge = folder.querySelector(".badge-count");
    if (badge) {
      badge.textContent = `${completed}/${total}`;
      if (completed === total) {
        badge.style.background = "#dcfce7";
        badge.style.color = "#15803d";
      } else {
        badge.style.background = "#e2e8f0";
        badge.style.color = "#475569";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Phục hồi các ô đã tích từ trước
  const allCheckboxes = document.querySelectorAll(".task-check");
  allCheckboxes.forEach((box) => {
    const id = box.dataset.id;
    if (id) {
      box.checked = localStorage.getItem(`checklist_${id}`) === "true";
    }
  });

  // Cập nhật số đếm ngay khi tải trang
  updateFolderProgress();

  // 2. Bắt sự kiện khi người dùng tích chọn
  document.addEventListener("change", (e) => {
    if (e.target && e.target.classList.contains("task-check")) {
      const id = e.target.dataset.id;
      if (id) {
        localStorage.setItem(`checklist_${id}`, e.target.checked);
      }
      updateFolderProgress();
    }
  });
});
