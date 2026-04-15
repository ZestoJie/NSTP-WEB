import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA_WAoRxS0XtSBHO4GKOUPeo9IxSuo9m8E",
    authDomain: "i-tanim.firebaseapp.com",
    projectId: "i-tanim",
    storageBucket: "i-tanim.firebasestorage.app",
    messagingSenderId: "543718035125",
    appId: "1:543718035125:web:92261781c28eec00c738fc"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='280' viewBox='0 0 500 280'%3E%3Crect width='500' height='280' fill='%23546B41'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Segoe UI, sans-serif' font-size='24' fill='%23FFF8EC'%3EImage unavailable%3C/text%3E%3C/svg%3E";

const USERS_KEY = "itanimUsers";
const TASKS_KEY = "itanimTasks";
const PROGRAMS_KEY = "itanimLocalPrograms";
const NOTIFICATIONS_KEY = "itanimNotifications";
const CURRENT_EMAIL_KEY = "currentUserEmail";
const CURRENT_ROLE_KEY = "currentUserRole";

const programDocs = [];
let selectedProgramId = null;
let currentUser = {
    id: "visitor",
    role: "visitor",
    email: null
};

const roleSwitcher = document.getElementById("roleSwitcher");
const userLabel = document.getElementById("userLabel");
const addBtn = document.getElementById("addProgramBtn");
const modal = document.getElementById("programModal");
const publicList = document.getElementById("publicProgramList");
const detailModal = document.getElementById("programDetailModal");
const detailImage = document.getElementById("detailImage");
const detailTitle = document.getElementById("detailTitle");
const detailDesc = document.getElementById("detailDesc");
const detailHours = document.getElementById("detailHours");
const detailJoined = document.getElementById("detailJoined");
const adminLink = document.getElementById("adminLink");
const userDashboardLink = document.getElementById("userDashboardLink");
const adminControls = document.getElementById("adminControls");

const initialFallbackPrograms = [
    {
        id: "local-1",
        title: "Tree Planting Drive",
        hours: "4",
        desc: "Join our tree planting drive to help the community.",
        image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80",
        joined: [],
        skills: ["tree planting", "environment", "outdoor"]
    },
    {
        id: "local-2",
        title: "Community Clean-Up",
        hours: "2",
        desc: "Help clean local streets and parks.",
        image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
        joined: [],
        skills: ["cleanup", "teamwork", "environment"]
    },
    {
        id: "local-3",
        title: "Urban Gardening Workshop",
        hours: "3",
        desc: "Learn how to grow food in small spaces.",
        image: "https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=900&q=80",
        joined: [],
        skills: ["gardening", "sustainability", "horticulture"]
    }
];

function getStorageData(key, fallback = []) {
    try {
        return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
        return fallback;
    }
}

function setStorageData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function saveUsers(users) {
    setStorageData(USERS_KEY, users);
}

function saveTasks(tasks) {
    setStorageData(TASKS_KEY, tasks);
}

function savePrograms() {
    setStorageData(PROGRAMS_KEY, programDocs);
}

function getCurrentUserData() {
    const users = getStorageData(USERS_KEY);
    const currentEmail = localStorage.getItem(CURRENT_EMAIL_KEY);

    if (currentEmail) {
        const found = users.find(u => u.email === currentEmail);
        if (found) {
            return found;
        }
    }

    if (currentUser.role === "user") {
        return users[0] || {
            id: "user1",
            role: "user",
            name: "Demo User",
            email: "demo@example.com",
            skills: ["environment", "gardening"],
            enrolledPrograms: [],
            hours: 0,
            badges: [],
            certifications: []
        };
    }

    if (currentUser.role === "admin") {
        return {
            id: "admin1",
            role: "admin",
            name: "Admin",
            email: "admin@example.com",
            skills: []
        };
    }

    return { id: "visitor", role: "visitor", skills: [] };
}

const isFirebaseConfigured =
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("YOUR_API_KEY") &&
    !firebaseConfig.apiKey.includes("XXXX");

const useFirestore = isFirebaseConfigured;

function loadRoleFromSession() {
    const savedRole = localStorage.getItem(CURRENT_ROLE_KEY);
    const savedEmail = localStorage.getItem(CURRENT_EMAIL_KEY);

    if (savedRole) {
        currentUser.role = savedRole;
    }

    if (savedEmail) {
        currentUser.email = savedEmail;
        const users = getStorageData(USERS_KEY);
        const matchedUser = users.find(u => u.email === savedEmail);
        if (matchedUser) {
            currentUser.id = matchedUser.id || matchedUser.email;
            if (matchedUser.role) {
                currentUser.role = matchedUser.role;
            } else if (currentUser.role === "visitor") {
                currentUser.role = "user";
            }
        }
    }

    if (roleSwitcher) {
        roleSwitcher.value = currentUser.role;
    }
}

function updateUserUI() {
    if (!userLabel) return;
    userLabel.innerText = `Role: ${currentUser.role}`;
    if (!useFirestore) {
        userLabel.innerText += " (offline demo)";
    }
}

function setRoleBasedUI() {
    const isAdmin = currentUser.role === "admin";
    const isUser = currentUser.role === "user";

    if (addBtn) addBtn.style.display = isAdmin ? "block" : "none";
    if (adminLink) adminLink.style.display = isAdmin ? "inline" : "none";
    if (userDashboardLink) userDashboardLink.style.display = isUser ? "inline" : "none";
}

if (roleSwitcher) {
    roleSwitcher.addEventListener("change", (e) => {
        currentUser.role = e.target.value;
        localStorage.setItem(CURRENT_ROLE_KEY, currentUser.role);

        if (currentUser.role === "visitor") {
            localStorage.removeItem(CURRENT_EMAIL_KEY);
            currentUser.email = null;
            currentUser.id = "visitor";
        }

        const currentData = getCurrentUserData();
        currentUser.id = currentData.id || currentData.email || currentUser.id;

        updateUserUI();
        setRoleBasedUI();
        renderPrograms(programDocs);
    });
}

if (addBtn) {
    addBtn.addEventListener("click", () => {
        if (currentUser.role !== "admin") {
            alert("Only admins can add programs.");
            return;
        }
        modal.style.display = "flex";
    });
}

window.closeModal = () => {
    if (modal) modal.style.display = "none";
    document.getElementById("programTitle").value = "";
    document.getElementById("programHours").value = "";
    document.getElementById("programDesc").value = "";
    document.getElementById("programImage").value = "";
    const preview = document.getElementById("programImagePreview");
    if (preview) {
        preview.src = "";
        preview.style.display = "none";
    }
    window.editingProgramId = undefined;
    const submitBtn = document.querySelector('button[onclick="submitProgram()"]');
    if (submitBtn) {
        submitBtn.textContent = "Add";
    }
};

window.closeDetailModal = () => {
    if (detailModal) detailModal.style.display = "none";
    selectedProgramId = null;
};

window.deleteSelectedProgram = async () => {
    if (!selectedProgramId) return;

    if (currentUser.role !== "admin") {
        alert("Only admins can delete programs.");
        return;
    }

    if (!confirm("Are you sure you want to delete this program?")) {
        return;
    }

    const index = programDocs.findIndex(p => p.id === selectedProgramId);
    if (index === -1) {
        alert("Program not found.");
        return;
    }

    programDocs.splice(index, 1);
    savePrograms();
    renderPrograms(programDocs);
    closeDetailModal();
    alert("Program deleted successfully!");
};

window.editSelectedProgram = () => {
    if (!selectedProgramId) return;

    if (currentUser.role !== "admin") {
        alert("Only admins can edit programs.");
        return;
    }

    const programToEdit = programDocs.find(p => p.id === selectedProgramId);
    if (!programToEdit) {
        alert("Program not found.");
        return;
    }

    document.getElementById("programTitle").value = programToEdit.title || "";
    document.getElementById("programHours").value = programToEdit.hours || "";
    document.getElementById("programDesc").value = programToEdit.desc || "";

    const preview = document.getElementById("programImagePreview");
    if (preview && programToEdit.image) {
        preview.src = programToEdit.image;
        preview.style.display = "block";
    }

    const submitBtn = document.querySelector('button[onclick="submitProgram()"]');
    if (submitBtn) {
        submitBtn.textContent = "Update Program";
    }

    window.editingProgramId = selectedProgramId;
    closeDetailModal();
    modal.style.display = "flex";
};

if (detailModal) {
    detailModal.addEventListener("click", (e) => {
        if (e.target === detailModal) {
            closeDetailModal();
        }
    });
}

function loadLocalPrograms() {
    const saved = localStorage.getItem(PROGRAMS_KEY);
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [...initialFallbackPrograms];
        }
    }
    return [...initialFallbackPrograms];
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
    });
}

async function readImageAsCompressedDataUrl(file, { maxW = 1400, maxH = 900, quality = 0.82 } = {}) {
    try {
        if (!file || !file.type || !file.type.startsWith("image/")) {
            return await readFileAsDataUrl(file);
        }

        const bitmap = await createImageBitmap(file);
        const ratio = Math.min(1, maxW / bitmap.width, maxH / bitmap.height);
        const w = Math.max(1, Math.round(bitmap.width * ratio));
        const h = Math.max(1, Math.round(bitmap.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return await readFileAsDataUrl(file);

        ctx.drawImage(bitmap, 0, 0, w, h);

        const outType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const dataUrl = canvas.toDataURL(outType, outType === "image/jpeg" ? quality : undefined);
        if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
            return dataUrl;
        }

        return await readFileAsDataUrl(file);
    } catch {
        return await readFileAsDataUrl(file);
    }
}

function syncProgramsFromTasksIfNeeded() {
    try {
        const adminTasks = getStorageData(TASKS_KEY);
        if (!Array.isArray(adminTasks) || adminTasks.length === 0) return;

        const current = loadLocalPrograms();
        const wasSynced = Array.isArray(current) && current.length > 0 && current.every(p => p && p._source === "task");

        if (current.length > 0 && !wasSynced) return;

        programDocs.length = 0;
        programDocs.push(...adminTasks.map(t => ({
            id: t.id,
            title: t.name,
            hours: String(t.hours ?? ""),
            desc: t.desc || "",
            image: (t.attachments && t.attachments[0] && t.attachments[0].dataUrl) ? t.attachments[0].dataUrl : defaultImage,
            joined: t.joined || [],
            skills: t.skills || [],
            _source: "task"
        })));
        savePrograms();
    } catch {
        // ignore sync errors
    }
}

function renderPrograms(programs) {
    if (!publicList) return;

    publicList.innerHTML = "";

    if (!programs.length) {
        publicList.innerHTML = `
            <div style="padding: 18px; border-radius: 14px; background: rgba(255,255,255,0.08); opacity: 0.9;">
                No programs available yet.
            </div>
        `;
        return;
    }

    const currentUserData = getCurrentUserData();

    programs.forEach((program) => {
        const item = document.createElement("div");
        item.className = "program-item";
        item.style.position = "relative";
        item.addEventListener("click", () => showProgramDetail(program));

        const image = document.createElement("img");
        image.src = program.image || defaultImage;
        image.alt = program.title || "Program image";
        image.style.display = "block";
        image.style.width = "100%";
        image.style.height = "160px";
        image.style.objectFit = "cover";
        image.style.borderRadius = "12px";
        image.style.marginBottom = "8px";
        image.onerror = () => {
            image.src = defaultImage;
        };

        const hasSkillMatch =
            Array.isArray(currentUserData.skills) &&
            Array.isArray(program.skills) &&
            program.skills.some(skill => currentUserData.skills.includes(skill));

        if (hasSkillMatch && currentUser.role === "user") {
            const badge = document.createElement("div");
            badge.className = "recommended-badge";
            badge.textContent = "Recommended";
            item.appendChild(badge);
        }

        const title = document.createElement("b");
        title.textContent = program.title || "Untitled program";

        const hours = document.createElement("small");
        hours.textContent = `${program.hours || 0} hours`;

        const desc = document.createElement("p");
        desc.textContent = program.desc || "No description yet.";
        desc.style.margin = "0";
        desc.style.opacity = "0.8";
        desc.style.lineHeight = "1.4";

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.width = "100%";
        row.style.alignItems = "center";

        const joinedLabel = document.createElement("span");
        joinedLabel.style.opacity = "0.75";
        joinedLabel.textContent = `${(program.joined || []).length} joined`;

        const actionArea = document.createElement("div");

        if (currentUser.role === "user" || currentUser.role === "admin") {
            const joinButton = document.createElement("button");
            const currentId = currentUserData.id || currentUser.id;
            joinButton.textContent = (program.joined || []).includes(currentId) ? "Joined" : "Join";
            joinButton.style.padding = "8px 12px";
            joinButton.style.borderRadius = "12px";
            joinButton.style.border = "none";
            joinButton.style.background = "rgba(255,255,255,0.12)";
            joinButton.style.color = "white";
            joinButton.style.cursor = "pointer";
            joinButton.addEventListener("click", (event) => {
                event.stopPropagation();
                joinProgram(program.id, program.joined || []);
            });
            actionArea.appendChild(joinButton);
        } else {
            const loginHint = document.createElement("small");
            loginHint.textContent = "Login to join";
            loginHint.style.opacity = "0.7";
            actionArea.appendChild(loginHint);
        }

        row.appendChild(joinedLabel);
        row.appendChild(actionArea);

        item.appendChild(image);
        item.appendChild(title);
        item.appendChild(hours);
        item.appendChild(desc);
        item.appendChild(row);

        publicList.appendChild(item);
    });
}

function showProgramDetail(program) {
    selectedProgramId = program.id;
    detailImage.src = program.image || defaultImage;
    detailImage.onerror = () => {
        detailImage.src = defaultImage;
    };
    detailTitle.textContent = program.title || "Untitled program";
    detailDesc.textContent = program.desc || "No description provided.";
    detailHours.textContent = `${program.hours || 0}`;
    detailJoined.textContent = `${(program.joined || []).length}`;

    if (adminControls) {
        adminControls.style.display = currentUser.role === "admin" ? "flex" : "none";
    }

    detailModal.style.display = "flex";
}

window.joinProgram = async (id, joined) => {
    if (currentUser.role !== "user" && currentUser.role !== "admin") {
        alert("Only registered users can join programs.");
        return;
    }

    const currentUserData = getCurrentUserData();
    const currentId = currentUserData.id || currentUser.id;

    if ((joined || []).includes(currentId)) {
        alert("You already joined this program.");
        return;
    }

    if (!useFirestore) {
        const program = programDocs.find((item) => item.id === id);
        if (!program) {
            alert("Program not found.");
            return;
        }

        program.joined = [...new Set([...(program.joined || []), currentId])];

        const storedUsers = getStorageData(USERS_KEY);
        const currentIndex = storedUsers.findIndex(u =>
            (currentUserData.email && u.email === currentUserData.email) ||
            (currentUserData.id && u.id === currentUserData.id)
        );

        if (currentIndex !== -1) {
            storedUsers[currentIndex].enrolledPrograms = storedUsers[currentIndex].enrolledPrograms || [];
            if (!storedUsers[currentIndex].enrolledPrograms.includes(id)) {
                storedUsers[currentIndex].enrolledPrograms.push(id);
            }
            saveUsers(storedUsers);
        }

        savePrograms();
        renderPrograms(programDocs);
        alert("Joined program successfully.");
        return;
    }

    try {
        await updateDoc(doc(db, "programs", id), {
            joined: arrayUnion(currentId)
        });
    } catch (err) {
        console.error(err);
        alert("Could not join program. Please try again.");
    }
};

async function uploadProgramImage(file) {
    if (!file) return defaultImage;

    if (!useFirestore) {
        try {
            return await readImageAsCompressedDataUrl(file);
        } catch {
            return defaultImage;
        }
    }

    try {
        const imageRef = ref(storage, `programImages/${Date.now()}-${file.name}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
    } catch {
        try {
            return await readImageAsCompressedDataUrl(file);
        } catch {
            return defaultImage;
        }
    }
}

window.submitProgram = async () => {
    if (currentUser.role !== "admin") {
        alert("Only admins can add programs.");
        return;
    }

    try {
        const title = document.getElementById("programTitle").value.trim();
        const hours = document.getElementById("programHours").value.trim();
        const desc = document.getElementById("programDesc").value.trim();
        const file = document.getElementById("programImage").files[0];

        if (!title) {
            alert("Title required");
            return;
        }

        const isEditing = window.editingProgramId !== undefined;
        let imageURL;

        if (isEditing && !file) {
            const existingProgram = programDocs.find(p => p.id === window.editingProgramId);
            imageURL = existingProgram?.image || defaultImage;
        } else {
            imageURL = await uploadProgramImage(file);
        }

        if (isEditing) {
            const index = programDocs.findIndex(p => p.id === window.editingProgramId);
            if (index > -1) {
                programDocs[index].title = title;
                programDocs[index].hours = hours;
                programDocs[index].desc = desc;
                programDocs[index].image = imageURL;
            }
            window.editingProgramId = undefined;
            alert("Program updated!");
        } else {
            const newProgram = {
                id: `local-${Date.now()}`,
                title,
                hours,
                desc,
                image: imageURL,
                joined: []
            };

            if (useFirestore) {
                const docRef = await addDoc(collection(db, "programs"), {
                    title,
                    hours,
                    desc,
                    image: imageURL,
                    joined: []
                });
                newProgram.id = docRef.id;
            }

            programDocs.push(newProgram);
            alert("Program added!");
        }

        savePrograms();
        renderPrograms(programDocs);
        closeModal();
    } catch (err) {
        console.error(err);
        alert("ERROR: " + err.message);
    }
};

function listenPrograms() {
    if (!useFirestore) {
        programDocs.length = 0;
        programDocs.push(...loadLocalPrograms());
        renderPrograms(programDocs);
        return;
    }

    try {
        onSnapshot(collection(db, "programs"), (snap) => {
            programDocs.length = 0;
            snap.forEach((d) => {
                programDocs.push({ id: d.id, ...d.data() });
            });
            renderPrograms(programDocs);
        }, () => {
            programDocs.length = 0;
            programDocs.push(...loadLocalPrograms());
            renderPrograms(programDocs);
        });
    } catch {
        programDocs.length = 0;
        programDocs.push(...loadLocalPrograms());
        renderPrograms(programDocs);
    }
}

window.debugAddSampleProgram = () => {
    programDocs.push({
        id: `debug-${Date.now()}`,
        title: "Debug Sample Program",
        hours: "2",
        desc: "Check hover, popup, and card display.",
        image: defaultImage,
        joined: []
    });
    savePrograms();
    renderPrograms(programDocs);
    alert("Debug sample program added.");
};

window.debugShowPrograms = () => {
    console.log("Loaded programs:", programDocs);
    alert(`Programs loaded: ${programDocs.length}. Check console for details.`);
};

window.debugAddSampleUser = () => {
    const users = getStorageData(USERS_KEY);
    const newUser = {
        id: `user${Date.now()}`,
        name: "Debug User",
        email: `debug${Date.now()}@example.com`,
        age: 20,
        barangay: "Debug",
        skills: ["Debugging"],
        status: "pending",
        hours: 0,
        badge: "None",
        enrolledPrograms: [],
        badges: [],
        certifications: []
    };
    users.push(newUser);
    saveUsers(users);
    alert("Sample user added. Check admin panel for management.");
};

window.debugAddSampleTask = () => {
    const tasks = getStorageData(TASKS_KEY);
    const newTask = {
        id: `task${Date.now()}`,
        name: "Debug Task",
        desc: "A task for debugging purposes",
        hours: 1,
        maxVolunteers: 2,
        assigned: [],
        status: "active",
        attachments: []
    };
    tasks.push(newTask);
    saveTasks(tasks);
    alert("Sample task added. Check admin panel for management.");
};

window.debugSimulateJoin = () => {
    if (programDocs.length > 0) {
        const program = programDocs[0];
        if (currentUser.role === "user" || currentUser.role === "admin") {
            joinProgram(program.id, program.joined || []);
        } else {
            alert("Switch to user or admin role first.");
        }
    } else {
        alert("No programs available to join.");
    }
};

window.debugShowUsers = () => {
    const users = getStorageData(USERS_KEY);
    console.log("All users:", users);
    alert(`Users: ${users.length}. Check console for details.`);
};

window.debugCleanupEverything = () => {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(TASKS_KEY);
    localStorage.removeItem(PROGRAMS_KEY);
    localStorage.removeItem(NOTIFICATIONS_KEY);
    localStorage.removeItem(CURRENT_EMAIL_KEY);
    localStorage.removeItem(CURRENT_ROLE_KEY);

    programDocs.length = 0;
    programDocs.push(...initialFallbackPrograms);
    savePrograms();

    renderPrograms(programDocs);

    currentUser = {
        id: "visitor",
        role: "visitor",
        email: null
    };

    if (roleSwitcher) roleSwitcher.value = "visitor";
    updateUserUI();
    setRoleBasedUI();

    alert("Everything cleaned up! Reset to initial state.");
};

document.addEventListener("DOMContentLoaded", () => {
    loadRoleFromSession();
    const currentData = getCurrentUserData();
    currentUser.id = currentData.id || currentData.email || currentUser.id;

    updateUserUI();
    setRoleBasedUI();

    const fileInput = document.getElementById("programImage");
    const preview = document.getElementById("programImagePreview");
    if (fileInput && preview) {
        fileInput.addEventListener("change", async () => {
            const file = fileInput.files && fileInput.files[0];
            if (!file) {
                preview.style.display = "none";
                preview.src = "";
                return;
            }
            try {
                preview.src = await readImageAsCompressedDataUrl(file);
                preview.style.display = "block";
            } catch {
                preview.style.display = "none";
                preview.src = "";
            }
        });
    }

    syncProgramsFromTasksIfNeeded();
    listenPrograms();

    if (programDocs.length === 0) {
        listenPrograms();
    }
});

setTimeout(() => {
    if (publicList && publicList.children.length === 0) {
        renderPrograms(programDocs);
    }
}, 100);

const carousel = document.getElementById("carousel");
const slides = document.querySelectorAll(".slide");
const dotsContainer = document.getElementById("dots");
let index = 1;
const realSlides = slides.length - 2;

for (let i = 0; i < realSlides; i++) {
    const dot = document.createElement("span");
    dot.onclick = () => go(i + 1);
    dotsContainer.appendChild(dot);
}

function fix() {
    if (!slides.length) return;
    if (index === 0) index = realSlides;
    if (index === slides.length - 1) index = 1;
}

function update() {
    if (!carousel || !slides.length) return;

    fix();
    const w = slides[0].offsetWidth + 30;
    carousel.style.transform = `translateX(-${index * w}px)`;

    slides.forEach(s => s.classList.remove("active"));
    if (slides[index]) {
        slides[index].classList.add("active");
    }

    const dots = document.querySelectorAll(".dots span");
    dots.forEach((d, idx) => {
        d.classList.toggle("active", idx === index - 1);
    });
}

function prev() {
    index -= 1;
    update();
    resetAutoSlide();
}

function next() {
    index += 1;
    update();
    resetAutoSlide();
}

function go(n) {
    index = n;
    update();
    resetAutoSlide();
}

function resetAutoSlide() {
    clearInterval(autoSlide);
    autoSlide = setInterval(next, 5000);
}

update();
let autoSlide = setInterval(next, 5000);

window.prev = prev;
window.next = next;
window.go = go;
window.submitProgram = submitProgram;
window.closeModal = closeModal;
window.closeDetailModal = closeDetailModal;
window.editSelectedProgram = editSelectedProgram;
window.deleteSelectedProgram = deleteSelectedProgram;
window.joinProgram = joinProgram;