/* =========================================================
   جمعية بشراكم لتحفيظ القرآن
   نظام متابعة الطلاب والحلقات
   app.js
========================================================= */

const DB_KEY = "boshra_quran_system_v1";
const SESSION_KEY = "boshra_current_teacher";

/* =========================
   قاعدة البيانات المحلية
========================= */

let db = JSON.parse(localStorage.getItem(DB_KEY)) || {
  teachers: [],
  students: [],
  rings: [],
  attendance: [],
  tracking: [],
  tests: []
};

let currentTeacherId =
  localStorage.getItem(SESSION_KEY) || null;

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  updateStats();
}

function uid(prefix = "id") {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 8)
  );
}

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentTeacher() {
  return db.teachers.find(t => t.id === currentTeacherId) || null;
}

function teacherStudents() {
  if (!currentTeacherId) return [];
  return db.students.filter(s => s.teacherId === currentTeacherId);
}

function teacherRings() {
  if (!currentTeacherId) return [];
  return db.rings.filter(r => r.teacherId === currentTeacherId);
}

function studentName(id) {
  const s = db.students.find(x => x.id === id);
  return s ? s.name : "طالب";
}

function ringName(id) {
  const r = db.rings.find(x => x.id === id);
  return r ? r.name : "بدون حلقة";
}

/* =========================
   الإحصائيات
========================= */

function updateStats() {

  const studentsCount =
    document.getElementById("studentsCount");

  const ringsCount =
    document.getElementById("ringsCount");

  const teachersCount =
    document.getElementById("teachersCount");

  if (studentsCount)
    studentsCount.textContent =
      currentTeacherId
        ? teacherStudents().length
        : db.students.length;

  if (ringsCount)
    ringsCount.textContent =
      currentTeacherId
        ? teacherRings().length
        : db.rings.length;

  if (teachersCount)
    teachersCount.textContent =
      db.teachers.length;
}

/* =========================
   اللوحة الرئيسية
========================= */

function panel() {
  const p = document.getElementById("panel");
  p.classList.remove("hidden");
  return p;
}

function closePanel() {
  const p = document.getElementById("panel");
  p.innerHTML = "";
  p.classList.add("hidden");
}

function panelHeader(title, subtitle = "") {
  return `
    <div class="panel-head">
      <div>
        <h2>${title}</h2>
        ${subtitle ? `<p>${subtitle}</p>` : ""}
      </div>
      <button onclick="closePanel()">✕</button>
    </div>
  `;
}

/* =========================
   فتح الخدمات
========================= */

function openPanel(type) {

  switch (type) {

    case "students":
      showStudents();
      break;

    case "rings":
      showRings();
      break;

    case "teachers":
      showTeachers();
      break;

    case "attendance":
      showAttendance();
      break;

    case "tracking":
      showTracking();
      break;

    case "quran":
      showQuran();
      break;

    case "tests":
      showTests();
      break;

    case "reports":
      showReports();
      break;
  }
}

/* =========================================================
   حساب المعلم
========================================================= */

function showTeacher() {

  const t = currentTeacher();

  if (!t) {
    showTeacherLogin();
    return;
  }

  const p = panel();

  p.innerHTML =
    panelHeader(
      "حساب المعلم",
      "الملف الشخصي وإدارة الحساب"
    ) +
    `
    <div class="teacher-profile">

      <div class="teacher-avatar">👨‍🏫</div>

      <h3>${esc(t.name)}</h3>

      <p>
        ${esc(t.phone || "")}
      </p>

      <p>
        الحلقة:
        <strong>
          ${esc(ringName(t.ringId))}
        </strong>
      </p>

      <div class="actions">

        <button onclick="showQuran()">
          📖 مصحفي
        </button>

        <button onclick="logoutTeacher()">
          تسجيل الخروج
        </button>

      </div>

    </div>
    `;
}

/* =========================
   تسجيل دخول المعلم
========================= */

function showTeacherLogin() {

  const p = panel();

  p.innerHTML =
    panelHeader(
      "دخول المعلم",
      "اختر حسابك أو أنشئ حسابًا جديدًا"
    ) +
    `
    <div class="form-card">

      <label>
        اختر المعلم
      </label>

      <select id="loginTeacher">

        <option value="">
          اختر المعلم
        </option>

        ${db.teachers.map(t => `
          <option value="${t.id}">
            ${esc(t.name)}
          </option>
        `).join("")}

      </select>

      <button
        class="primary"
        onclick="loginTeacher()">
        دخول
      </button>

      <hr>

      <button
        onclick="showAddTeacher()">
        + إنشاء حساب معلم
      </button>

    </div>
    `;
}

function loginTeacher() {

  const select =
    document.getElementById("loginTeacher");

  if (!select || !select.value) {
    alert("اختر المعلم أولًا");
    return;
  }

  currentTeacherId = select.value;

  localStorage.setItem(
    SESSION_KEY,
    currentTeacherId
  );

  updateStats();
  showTeacher();
}

function logoutTeacher() {

  currentTeacherId = null;

  localStorage.removeItem(SESSION_KEY);

  updateStats();

  showTeacherLogin();
}

/* =========================================================
   المعلمون
========================================================= */

function showTeachers() {

  const p = panel();

  p.innerHTML =
    panelHeader(
      "المعلمون",
      "إدارة حسابات المعلمين"
    ) +
    `
    <button
      class="primary"
      onclick="showAddTeacher()">
      + إضافة معلم
    </button>

    <div class="list">

      ${
        db.teachers.length
        ? db.teachers.map(t => `

          <article class="list-item">

            <div>
              <h3>👨‍🏫 ${esc(t.name)}</h3>

              <p>
                ${esc(t.phone || "بدون رقم")}
              </p>

              <small>
                ${esc(ringName(t.ringId))}
              </small>
            </div>

            <button
              onclick="enterTeacher('${t.id}')">
              دخول
            </button>

          </article>

        `).join("")
        :
        `<p class="empty">لا يوجد معلمون بعد.</p>`
      }

    </div>
    `;
}

function showAddTeacher() {

  const p = panel();

  p.innerHTML =
    panelHeader(
      "إضافة معلم",
      "سيتم إنشاء مصحف مستقل لهذا المعلم"
    ) +
    `
    <div class="form-card">

      <label>اسم المعلم</label>
      <input
        id="teacherName"
        placeholder="اسم المعلم">

      <label>رقم الجوال</label>
      <input
        id="teacherPhone"
        placeholder="05xxxxxxxx">

      <label>الحلقة</label>

      <select id="teacherRing">

        <option value="">
          بدون حلقة حاليًا
        </option>

        ${db.rings.map(r => `
          <option value="${r.id}">
            ${esc(r.name)}
          </option>
        `).join("")}

      </select>

      <button
        class="primary"
        onclick="addTeacher()">
        حفظ المعلم
      </button>

    </div>
    `;
}

function addTeacher() {

  const name =
    document.getElementById("teacherName")
      .value.trim();

  const phone =
    document.getElementById("teacherPhone")
      .value.trim();

  const ringId =
    document.getElementById("teacherRing")
      .value;

  if (!name) {
    alert("اكتب اسم المعلم");
    return;
  }

  const id = uid("teacher");

  db.teachers.push({
    id,
    name,
    phone,
    ringId,
    quran: {
      lastSurah: "الفاتحة",
      lastAyah: 1,
      note: ""
    },
    createdAt: new Date().toISOString()
  });

  saveDB();

  currentTeacherId = id;

  localStorage.setItem(
    SESSION_KEY,
    id
  );

  alert("تم إنشاء حساب المعلم");

  showTeacher();
}

function enterTeacher(id) {

  currentTeacherId = id;

  localStorage.setItem(
    SESSION_KEY,
    id
  );

  updateStats();

  showTeacher();
}

/* =========================================================
   الحلقات
========================================================= */

function showRings() {

  const p = panel();

  const rings =
    currentTeacherId
      ? teacherRings()
      : db.rings;

  p.innerHTML =
    panelHeader(
      "الحلقات",
      "إدارة حلقات تحفيظ القرآن"
    ) +
    `
    <div class="form-card">

      <input
        id="ringName"
        placeholder="اسم الحلقة">

      <button
        class="primary"
        onclick="addRing()">
        + إضافة حلقة
      </button>

    </div>

    <div class="list">

      ${
        rings.length
        ? rings.map(r => `

          <article class="list-item">

            <div>
              <h3>🕌 ${esc(r.name)}</h3>

              <small>
                ${
                  db.students.filter(
                    s => s.ringId === r.id
                  ).length
                }
                طالب
              </small>
            </div>

          </article>

        `).join("")
        :
        `<p class="empty">
          لا توجد حلقات.
        </p>`
      }

    </div>
    `;
}

function addRing() {

  if (!currentTeacherId) {
    alert("سجّل دخول المعلم أولًا");
    showTeacherLogin();
    return;
  }

  const input =
    document.getElementById("ringName");

  const name =
    input.value.trim();

  if (!name) {
    alert("اكتب اسم الحلقة");
    return;
  }

  const id = uid("ring");

  db.rings.push({
    id,
    name,
    teacherId: currentTeacherId
  });

  const teacher = currentTeacher();

  if (teacher && !teacher.ringId)
    teacher.ringId = id;

  saveDB();

  showRings();
}

/* =========================================================
   الطلاب
========================================================= */

function showStudents() {

  if (!currentTeacherId) {
    alert("ادخل إلى حساب المعلم أولًا");
    showTeacherLogin();
    return;
  }

  const students = teacherStudents();

  const p = panel();

  p.innerHTML =
    panelHeader(
      "الطلاب",
      "طلاب المعلم الحالي"
    ) +
    `
    <button
      class="primary"
      onclick="showAddStudent()">
      + إضافة طالب
    </button>

    <div class="list">

      ${
        students.length
        ? students.map(s => `

          <article class="list-item">

            <div>
              <h3>👤 ${esc(s.name)}</h3>

              <p>
                ${esc(ringName(s.ringId))}
              </p>

              <small>
                ${esc(s.phone || "")}
              </small>
            </div>

            <button
              onclick="studentDetails('${s.id}')">
              متابعة
            </button>

          </article>

        `).join("")
        :
        `<p class="empty">
          لا يوجد طلاب في حساب هذا المعلم.
        </p>`
      }

    </div>
    `;
}

function showAddStudent() {

  const rings = teacherRings();

  const p = panel();

  p.innerHTML =
    panelHeader(
      "إضافة طالب",
      "إضافة طالب إلى حساب المعلم"
    ) +
    `
    <div class="form-card">

      <label>اسم الطالب</label>

      <input
        id="studentName"
        placeholder="اسم الطالب">

      <label>رقم ولي الأمر</label>

      <input
        id="studentPhone"
        placeholder="05xxxxxxxx">

      <label>الحلقة</label>

      <select id="studentRing">

        <option value="">
          اختر الحلقة
        </option>

        ${rings.map(r => `
          <option value="${r.id}">
            ${esc(r.name)}
          </option>
        `).join("")}

      </select>

      <button
        class="primary"
        onclick="addStudent()">
        حفظ الطالب
      </button>

    </div>
    `;
}

function addStudent() {

  const name =
    document.getElementById("studentName")
      .value.trim();

  const phone =
    document.getElementById("studentPhone")
      .value.trim();

  const ringId =
    document.getElementById("studentRing")
      .value;

  if (!name) {
    alert("اكتب اسم الطالب");
    return;
  }

  db.students.push({
    id: uid("student"),
    name,
    phone,
    ringId,
    teacherId: currentTeacherId,
    createdAt: new Date().toISOString()
  });

  saveDB();

  showStudents();
}

function studentDetails(id) {

  const s =
    db.students.find(x => x.id === id);

  if (!s) return;

  const records =
    db.tracking.filter(
      x => x.studentId === id
    );

  const p = panel();

  p.innerHTML =
    panelHeader(
      s.name,
      ringName(s.ringId)
    ) +
    `
    <div class="student-summary">

      <h3>📚 سجل الحفظ</h3>

      ${
        records.length
        ? records
          .slice()
          .reverse()
          .map(r => `

          <article class="record">

            <strong>
              ${esc(r.surah)}
            </strong>

            <p>
              من آية ${esc(r.from)}
              إلى ${esc(r.to)}
            </p>

            <small>
              ${esc(r.date)}
              •
              التقييم:
              ${esc(r.grade)}
            </small>

          </article>

        `).join("")
        :
        "<p>لا توجد متابعة مسجلة.</p>"
      }

    </div>
    `;
}

/* =========================================================
   الحضور
========================================================= */

function showAttendance() {

  if (!currentTeacherId) {
    showTeacherLogin();
    return;
  }

  const students = teacherStudents();

  const p = panel();

  p.innerHTML =
    panelHeader(
      "الحضور والغياب",
      "تسجيل حضور اليوم"
    ) +
    `
    <div class="attendance-list">

      ${students.map(s => `

        <article class="attendance-row">

          <strong>
            ${esc(s.name)}
          </strong>

          <select
            id="att_${s.id}">

            <option value="حاضر">
              حاضر
            </option>

            <option value="غائب">
              غائب
            </option>

            <option value="متأخر">
              متأخر
            </option>

            <option value="معتذر">
              معتذر
            </option>

          </select>

        </article>

      `).join("")}

    </div>

    ${
      students.length
      ? `
      <button
        class="primary"
        onclick="saveAttendance()">
        حفظ الحضور
      </button>
      `
      :
      "<p>لا يوجد طلاب.</p>"
    }
    `;
}

function saveAttendance() {

  const date = today();

  teacherStudents().forEach(s => {

    const el =
      document.getElementById(
        "att_" + s.id
      );

    if (!el) return;

    db.attendance =
      db.attendance.filter(
        a =>
          !(
            a.studentId === s.id &&
            a.date === date
          )
      );

    db.attendance.push({
      id: uid("attendance"),
      teacherId: currentTeacherId,
      studentId: s.id,
      date,
      status: el.value
    });

  });

  saveDB();

  alert("تم حفظ الحضور");
}

/* =========================================================
   الحفظ والمراجعة
========================================================= */

function showTracking() {

  if (!currentTeacherId) {
    showTeacherLogin();
    return;
  }

  const students = teacherStudents();

  const p = panel();

  p.innerHTML =
    panelHeader(
      "الحفظ والمراجعة",
      "تسجيل الورد اليومي للطالب"
    ) +
    `
    <div class="form-card">

      <label>الطالب</label>

      <select id="trackStudent">

        ${students.map(s => `
          <option value="${s.id}">
            ${esc(s.name)}
          </option>
        `).join("")}

      </select>

      <label>نوع المتابعة</label>

      <select id="trackType">
        <option>حفظ جديد</option>
        <option>مراجعة</option>
        <option>تلاوة</option>
      </select>

      <label>السورة</label>

      <input
        id="trackSurah"
        placeholder="مثال: سورة البقرة">

      <label>من آية</label>

      <input
        id="trackFrom"
        type="number"
        min="1">

      <label>إلى آية</label>

      <input
        id="trackTo"
        type="number"
        min="1">

      <label>التقييم</label>

      <select id="trackGrade">
        <option>ممتاز</option>
        <option>جيد جدًا</option>
        <option>جيد</option>
        <option>يحتاج مراجعة</option>
      </select>

      <label>عدد الأخطاء</label>

      <input
        id="trackErrors"
        type="number"
        min="0"
        value="0">

      <label>ملاحظات</label>

      <textarea
        id="trackNotes"
        placeholder="ملاحظات المعلم"></textarea>

      <button
        class="primary"
        onclick="saveTracking()">
        حفظ المتابعة
      </button>

    </div>
    `;
}

function saveTracking() {

  const studentId =
    document.getElementById("trackStudent")
      .value;

  if (!studentId) {
    alert("أضف طالبًا أولًا");
    return;
  }

  const surah =
    document.getElementById("trackSurah")
      .value.trim();

  if (!surah) {
    alert("اكتب اسم السورة");
    return;
  }

  db.tracking.push({

    id: uid("tracking"),

    teacherId:
      currentTeacherId,

    studentId,

    type:
      document.getElementById(
        "trackType"
      ).value,

    surah,

    from:
      document.getElementById(
        "trackFrom"
      ).value,

    to:
      document.getElementById(
        "trackTo"
      ).value,

    grade:
      document.getElementById(
        "trackGrade"
      ).value,

    errors:
      Number(
        document.getElementById(
          "trackErrors"
        ).value || 0
      ),

    notes:
      document.getElementById(
        "trackNotes"
      ).value,

    date: today()

  });

  saveDB();

  alert("تم حفظ متابعة الطالب");

  showTracking();
}

/* =========================================================
   مصحف المعلم
========================================================= */

const quranSurahs = [
"الفاتحة","البقرة","آل عمران","النساء","المائدة",
"الأنعام","الأعراف","الأنفال","التوبة","يونس",
"هود","يوسف","الرعد","إبراهيم","الحجر","النحل",
"الإسراء","الكهف","مريم","طه","الأنبياء","الحج",
"المؤمنون","النور","الفرقان","الشعراء","النمل",
"القصص","العنكبوت","الروم","لقمان","السجدة",
"الأحزاب","سبأ","فاطر","يس","الصافات","ص",
"الزمر","غافر","فصلت","الشورى","الزخرف",
"الدخان","الجاثية","الأحقاف","محمد","الفتح",
"الحجرات","ق","الذاريات","الطور","النجم","القمر",
"الرحمن","الواقعة","الحديد","المجادلة","الحشر",
"الممتحنة","الصف","الجمعة","المنافقون","التغابن",
"الطلاق","التحريم","الملك","القلم","الحاقة",
"المعارج","نوح","الجن","المزمل","المدثر",
"القيامة","الإنسان","المرسلات","النبأ","النازعات",
"عبس","التكوير","الانفطار","المطففين","الانشقاق",
"البروج","الطارق","الأعلى","الغاشية","الفجر",
"البلد","الشمس","الليل","الضحى","الشرح","التين",
"العلق","القدر","البينة","الزلزلة","العاديات",
"القارعة","التكاثر","العصر","الهمزة","الفيل",
"قريش","الماعون","الكوثر","الكافرون","النصر",
"المسد","الإخلاص","الفلق","الناس"
];

function showQuran() {

  const t = currentTeacher();

  if (!t) {
    alert("ادخل إلى حساب المعلم أولًا");
    showTeacherLogin();
    return;
  }

  if (!t.quran) {
    t.quran = {
      lastSurah: "الفاتحة",
      lastAyah: 1,
      note: ""
    };
  }

  const p = panel();

  p.innerHTML =
    panelHeader(
      "📖 مصحف " + esc(t.name),
      "نسخة المصحف الخاصة بحساب المعلم"
    ) +
    `
    <div class="quran-reader">

      <div class="quran-cover">

        <div class="quran-symbol">
          ۞
        </div>

        <h2>
          القرآن الكريم
        </h2>

        <p>
          مصحف المعلم
        </p>

        <strong>
          ${esc(t.name)}
        </strong>

      </div>

      <div class="form-card">

        <label>
          الانتقال إلى سورة
        </label>

        <select id="quranSurah">

          ${quranSurahs.map(name => `
            <option
              value="${name}"
              ${
                name === t.quran.lastSurah
                  ? "selected"
                  : ""
              }>
              سورة ${name}
            </option>
          `).join("")}

        </select>

        <label>
          رقم الآية
        </label>

        <input
          id="quranAyah"
          type="number"
          min="1"
          value="${esc(t.quran.lastAyah || 1)}">

        <label>
          ملاحظات المعلم
        </label>

        <textarea
          id="quranNote"
          placeholder="ملاحظات خاصة بالمصحف">${esc(t.quran.note || "")}</textarea>

        <button
          class="primary"
          onclick="saveQuranPosition()">
          🔖 حفظ موضع القراءة
        </button>

      </div>

      <div class="quran-info">

        <h3>
          آخر موضع محفوظ
        </h3>

        <p>
          سورة
          <strong>
            ${esc(t.quran.lastSurah)}
          </strong>
          —
          الآية
          <strong>
            ${esc(t.quran.lastAyah)}
          </strong>
        </p>

      </div>

    </div>
    `;
}

function saveQuranPosition() {

  const t = currentTeacher();

  if (!t) return;

  t.quran = {

    lastSurah:
      document.getElementById(
        "quranSurah"
      ).value,

    lastAyah:
      Number(
        document.getElementById(
          "quranAyah"
        ).value || 1
      ),

    note:
      document.getElementById(
        "quranNote"
      ).value
  };

  saveDB();

  alert("تم حفظ موضع المصحف");

  showQuran();
}

/* =========================================================
   الاختبارات والتقييم
========================================================= */

function showTests() {

  if (!currentTeacherId) {
    showTeacherLogin();
    return;
  }

  const students = teacherStudents();

  const p = panel();

  p.innerHTML =
    panelHeader(
      "الاختبارات والتقييم",
      "تقييم الحفظ والتجويد"
    ) +
    `
    <div class="form-card">

      <label>الطالب</label>

      <select id="testStudent">

        ${students.map(s => `
          <option value="${s.id}">
            ${esc(s.name)}
          </option>
        `).join("")}

      </select>

      <label>اسم الاختبار</label>

      <input
        id="testName"
        placeholder="مثال: اختبار جزء عم">

      <label>الحفظ / 100</label>

      <input
        id="memorizationGrade"
        type="number"
        min="0"
        max="100">

      <label>التجويد / 100</label>

      <input
        id="tajweedGrade"
        type="number"
        min="0"
        max="100">

      <label>عدد الأخطاء</label>

      <input
        id="testErrors"
        type="number"
        min="0"
        value="0">

      <label>الملاحظات</label>

      <textarea id="testNotes"></textarea>

      <button
        class="primary"
        onclick="saveTest()">
        حفظ التقييم
      </button>

    </div>
    `;
}

function saveTest() {

  const studentId =
    document.getElementById(
      "testStudent"
    ).value;

  if (!studentId) {
    alert("اختر الطالب");
    return;
  }

  db.tests.push({

    id: uid("test"),

    teacherId:
      currentTeacherId,

    studentId,

    name:
      document.getElementById(
        "testName"
      ).value,

    memorization:
      Number(
        document.getElementById(
          "memorizationGrade"
        ).value || 0
      ),

    tajweed:
      Number(
        document.getElementById(
          "tajweedGrade"
        ).value || 0
      ),

    errors:
      Number(
        document.getElementById(
          "testErrors"
        ).value || 0
      ),

    notes:
      document.getElementById(
        "testNotes"
      ).value,

    date: today()

  });

  saveDB();

  alert("تم حفظ التقييم");
}

/* =========================================================
   التقارير
========================================================= */

function showReports() {

  if (!currentTeacherId) {
    showTeacherLogin();
    return;
  }

  const students =
    teacherStudents();

  const attendance =
    db.attendance.filter(
      a =>
        a.teacherId ===
        currentTeacherId
    );

  const tracking =
    db.tracking.filter(
      r =>
        r.teacherId ===
        currentTeacherId
    );

  const tests =
    db.tests.filter(
      r =>
        r.teacherId ===
        currentTeacherId
    );

  const present =
    attendance.filter(
      a => a.status === "حاضر"
    ).length;

  const absent =
    attendance.filter(
      a => a.status === "غائب"
    ).length;

  const errors =
    tracking.reduce(
      (sum, r) =>
        sum +
        Number(r.errors || 0),
      0
    );

  const p = panel();

  p.innerHTML =
    panelHeader(
      "التقارير",
      "ملخص أداء الحلقة"
    ) +
    `
    <section class="report-grid">

      <article>
        <strong>
          ${students.length}
        </strong>
        <span>الطلاب</span>
      </article>

      <article>
        <strong>
          ${tracking.length}
        </strong>
        <span>سجلات الحفظ</span>
      </article>

      <article>
        <strong>
          ${present}
        </strong>
        <span>مرات الحضور</span>
      </article>

      <article>
        <strong>
          ${absent}
        </strong>
        <span>مرات الغياب</span>
      </article>

      <article>
        <strong>
          ${tests.length}
        </strong>
        <span>الاختبارات</span>
      </article>

      <article>
        <strong>
          ${errors}
        </strong>
        <span>أخطاء التلاوة</span>
      </article>

    </section>

    <h3>
      تقرير الطلاب
    </h3>

    <div class="list">

      ${students.map(s => {

        const studentTracking =
          tracking.filter(
            x => x.studentId === s.id
          );

        const studentAttendance =
          attendance.filter(
            x => x.studentId === s.id
          );

        const studentTests =
          tests.filter(
            x => x.studentId === s.id
          );

        return `

          <article class="list-item">

            <div>

              <h3>
                ${esc(s.name)}
              </h3>

              <p>
                📚 متابعة:
                ${studentTracking.length}
              </p>

              <p>
                ✅ حضور:
                ${
                  studentAttendance.filter(
                    a =>
                      a.status === "حاضر"
                  ).length
                }
              </p>

              <p>
                ⭐ اختبارات:
                ${studentTests.length}
              </p>

            </div>

          </article>

        `;

      }).join("")}

    </div>
    `;
}

/* =========================================================
   بدء التطبيق
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /* التأكد من أن المعلم المحفوظ
       لا يزال موجودًا */

    if (
      currentTeacherId &&
      !db.teachers.some(
        t => t.id === currentTeacherId
      )
    ) {
      currentTeacherId = null;
      localStorage.removeItem(
        SESSION_KEY
      );
    }

    updateStats();
  }
);
