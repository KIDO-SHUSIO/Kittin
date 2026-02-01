// --- 1. ตั้งค่า Firebase (ชุดเดิมของคุณ) ---
const firebaseConfig = {
    apiKey: "AIzaSyCmDBt1LJLWUEljGQVjYcaJ5FJRm9pcM_k",
    authDomain: "wedappis.firebaseapp.com",
    databaseURL: "https://wedappis-default-rtdb.firebaseio.com",
    projectId: "wedappis",
    storageBucket: "wedappis.firebasestorage.app",
    messagingSenderId: "838403173250",
    appId: "1:838403173250:web:1f5fc5786c6c1104c4bd9b",
    measurementId: "G-F73HSEZBBW"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// --- 2. ฟังก์ชันสลับหน้า Login/Register ---
function switchForm(formName) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const formTitle = document.getElementById('formTitle');

    if (formName === 'register') {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        formTitle.innerText = 'สมัครสมาชิก';
    } else {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        formTitle.innerText = 'เข้าสู่ระบบ';
    }
}

// --- 3. แปลงรหัสนักเรียนเป็น Email เทียม (เพื่อไม่ให้ต้องใช้ Gmail จริง) ---
const DOMAIN_SUFFIX = "@phrapathom.local"; 
function getEmailFromID(studentID) {
    return studentID + DOMAIN_SUFFIX;
}

// --- 4. ส่วนการทำงาน: สมัครสมาชิก (Register) ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // ดึงค่า
        const studentId = document.getElementById('student_id').value.trim();
        const firstname = document.getElementById('firstname').value.trim();
        const lastname = document.getElementById('lastname').value.trim();
        const level = document.getElementById('level').value;
        const room = document.getElementById('room').value;
        const no = document.getElementById('no').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;

        if (password !== confirmPassword) {
            Swal.fire({ icon: 'error', title: 'รหัสผ่านไม่ตรงกัน', confirmButtonColor: '#6d83f2' });
            return;
        }

        const email = getEmailFromID(studentId);

        // สร้าง User -> บันทึก Database -> เป็น role: student เสมอ
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                return db.ref('users/' + user.uid).set({
                    studentId: studentId,
                    firstname: firstname,
                    lastname: lastname,
                    level: level,
                    room: room,
                    no: no,
                    role: 'student' // *** ทุกคนที่สมัครเองจะเป็น student ***
                });
            })
            .then(() => {
                Swal.fire({
                    icon: 'success',
                    title: 'สมัครสมาชิกสำเร็จ!',
                    text: 'กรุณาเข้าสู่ระบบ',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    switchForm('login');
                    registerForm.reset();
                });
            })
            .catch((error) => {
                Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: error.message, confirmButtonColor: '#6d83f2' });
            });
    });
}

// --- 5. ส่วนการทำงาน: เข้าสู่ระบบ (Login & Check Role) ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const loginId = document.getElementById('login_id').value.trim();
        const password = document.getElementById('login_password').value;
        const email = getEmailFromID(loginId);

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // *** จุดสำคัญ: เช็ค Role ก่อนพาไปหน้าถัดไป ***
                return db.ref('users/' + userCredential.user.uid).once('value');
            })
            .then((snapshot) => {
                const userData = snapshot.val();
                
                Swal.fire({
                    icon: 'success',
                    title: 'เข้าสู่ระบบสำเร็จ',
                    timer: 1000,
                    showConfirmButton: false
                }).then(() => {
                    // แยกทางเดิน
                    if (userData && userData.role === 'admin') {
                        // ถ้าเป็น Admin -> ไปหน้า Admin
                        window.location.href = 'admin.html';
                    } else {
                        // ถ้าเป็น Student -> ไปหน้า Student Dashboard
                        window.location.href = 'student.html';
                    }
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'เข้าสู่ระบบไม่สำเร็จ',
                    text: 'รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง',
                    confirmButtonColor: '#6d83f2'
                });
            });
    });
}