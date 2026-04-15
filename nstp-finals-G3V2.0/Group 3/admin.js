const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='280' viewBox='0 0 500 280'%3E%3Crect width='500' height='280' fill='%23546B41'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Segoe UI, sans-serif' font-size='24' fill='%23FFF8EC'%3EImage unavailable%3C/text%3E%3C/svg%3E";

const USERS_KEY = "itanimUsers";
const TASKS_KEY = "itanimTasks";
const CERTS_KEY = "itanimCerts";
const SKILLS_KEY = "itanimSkills";
const RESTRICTIONS_KEY = "itanimRestrictions";
const BADGES_KEY = "itanimBadges";
const NOTIFICATIONS_KEY = "itanimNotifications";
const PROGRAMS_KEY = "itanimLocalPrograms";
const CURRENT_EMAIL_KEY = "currentUserEmail";
const CURRENT_ROLE_KEY = "currentUserRole";

let users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
let tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || "[]");
let certifications = JSON.parse(localStorage.getItem(CERTS_KEY) || "[]");
let skills = JSON.parse(localStorage.getItem(SKILLS_KEY) || '["Teaching", "Cleaning", "Gardening", "Event Planning"]');
let restrictions = JSON.parse(localStorage.getItem(RESTRICTIONS_KEY) || '{"minAge":18,"validBarangays":"All"}');
let badgeThresholds = JSON.parse(localStorage.getItem(BADGES_KEY) || '{"bronze":10,"silver":25,"gold":50,"platinum":100}');
let notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");

if (users.length === 0) {
    users = [
        { id: "user1", name: "John Doe", email: "john@example.com", age: 20, barangay: "Sample", skills: ["Teaching"], status: "approved", hours: 15, badge: "Bronze", enrolledPrograms: [], badges: [], certifications: [] },
        { id: "user2", name: "Jane Smith", email: "jane@example.com", age: 19, barangay: "Sample", skills: ["Cleaning"], status: "pending", hours: 0, badge: "None", enrolledPrograms: [], badges: [], certifications: [] },
        { id: "user3", name: "Bob Johnson", email: "bob@example.com", age: 21, barangay: "Sample", skills: ["Gardening"], status: "rejected", hours: 5, badge: "None", enrolledPrograms: [], badges: [], certifications: [] }
    ];
    saveUsers();
}

if (tasks.length === 0) {
    tasks = [
        { id: "task1", name: "Tree Planting", desc: "Plant trees in the community", hours: 4, maxVolunteers: 10, assigned: ["user1"], status: "active", attachments: [] },
        { id: "task2", name: "Clean Up Drive", desc: "Clean local streets", hours: 2, maxVolunteers: 5, assigned: [], status: "active", attachments: [] },
        { id: "task3", name: "Teaching Workshop", desc: "Teach basic skills", hours: 3, maxVolunteers: 3, assigned: ["user1"], status: "completed", attachments: [] }
    ];
    saveTasks();
}

if (certifications.length === 0) {
    certifications = [
        { id: "cert1", userId: "user1", status: "pending", requestedAt: new Date().toISOString() }
    ];
    saveCerts();
}

function saveUsers() { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function saveTasks() { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); }
function saveCerts() { localStorage.setItem(CERTS_KEY, JSON.stringify(certifications)); }
function saveSkills() { localStorage.setItem(SKILLS_KEY, JSON.stringify(skills)); }
function saveRestrictions() { localStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(restrictions)); }
function saveBadges() { localStorage.setItem(BADGES_KEY, JSON.stringify(badgeThresholds)); }
function saveNotifications() { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications)); }

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
    });
}

function renderTaskAttachmentPreview(attachments) {
    const container = document.getElementById("taskAttachmentPreview");
    if (!container) return;

    if (!Array.isArray(attachments) || attachments.length === 0) {
        container.innerHTML = "";
        return;
    }

    container.innerHTML = attachments.map(att => `
        <div style="border:1px solid rgba(255,255,255,0.18); border-radius:12px; overflow:hidden; background:rgba(255,255,255,0.06);">
            <img src="${att.dataUrl}" alt="${att.name}" style="width:100%; height:86px; object-fit:cover; display:block;">
            <div style="padding:6px 8px; font-size:12px; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${att.name}</div>
        </div>
    `).join("");
}

async function getAttachmentsFromInput() {
    const input = document.getElementById("taskAttachments");
    if (!input || !input.files || input.files.length === 0) return [];

    const files = Array.from(input.files);
    const results = [];

    for (const file of files) {
        const dataUrl = await readFileAsDataUrl(file);
        results.push({ name: file.name, type: file.type, size: file.size, dataUrl });
    }

    return results;
}

function clearAttachmentInput() {
    const input = document.getElementById("taskAttachments");
    if (input) input.value = "";
    renderTaskAttachmentPreview([]);
}

function syncProgramsFromTasks() {
    const programs = tasks.map(t => ({
        id: t.id,
        title: t.name,
        hours: String(t.hours ?? ""),
        desc: t.desc || "",
        image: (t.attachments && t.attachments[0] && t.attachments[0].dataUrl) ? t.attachments[0].dataUrl : defaultImage,
        joined: t.joined || [],
        skills: t.skills || [],
        _source: "task"
    }));
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
}

function showTab(tabName) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
    const activeBtn = document.querySelector(`button[onclick="showTab('${tabName}')"]`);
    if (activeBtn) activeBtn.classList.add("active");
    const activeTab = document.getElementById(tabName);
    if (activeTab) activeTab.classList.add("active");
    updateTab(tabName);
}

function updateTab(tabName) {
    switch (tabName) {
        case "dashboard": updateDashboard(); break;
        case "analytics": updateAnalytics(); break;
        case "volunteers": updateVolunteers(); break;
        case "restrictions": loadRestrictionsUI(); break;
        case "skills": updateSkills(); break;
        case "tasks": updateTasks(); break;
        case "validation": updateValidation(); break;
        case "badges": updateBadges(); break;
        case "certifications": updateCertifications(); break;
        case "notifications": updateNotifications(); break;
    }
}

function updateDashboard() {
    const totalVolunteers = users.filter(u => u.status === "approved").length;
    const pendingApps = users.filter(u => u.status === "pending").length;
    const approvedUsers = users.filter(u => u.status === "approved").length;
    const rejectedUsers = users.filter(u => u.status === "rejected").length;
    const activeTasks = tasks.filter(t => t.status === "active").length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;

    document.getElementById("totalVolunteers").textContent = totalVolunteers;
    document.getElementById("pendingApps").textContent = pendingApps;
    document.getElementById("approvedUsers").textContent = approvedUsers;
    document.getElementById("rejectedUsers").textContent = rejectedUsers;
    document.getElementById("activeTasks").textContent = activeTasks;
    document.getElementById("completedTasks").textContent = completedTasks;
}

function updateAnalytics() {
    const totalHours = users.reduce((sum, u) => sum + (u.hours || 0), 0);
    const activeVolunteers = users.filter(u => u.status === "approved" && u.hours > 0).length;
    const inactiveVolunteers = users.filter(u => u.status === "approved" && (u.hours || 0) === 0).length;
    const completedTasksCount = tasks.filter(t => t.status === "completed").length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

    document.getElementById("totalHours").textContent = `${totalHours} hours`;
    document.getElementById("activeInactive").textContent = `${activeVolunteers} active, ${inactiveVolunteers} inactive`;
    document.getElementById("completionRate").textContent = `${completionRate}%`;

    const taskCounts = {};
    tasks.forEach(t => {
        if (t.status === "completed") {
            taskCounts[t.name] = (taskCounts[t.name] || 0) + 1;
        }
    });

    const topTasks = Object.entries(taskCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    document.getElementById("topTasks").innerHTML = topTasks.map(([name, count]) => `<li>${name}: ${count} completions</li>`).join("");

    const badges = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0, None: 0 };
    users.forEach(u => {
        badges[u.badge || "None"]++;
    });
    document.getElementById("badgeChart").innerHTML = Object.entries(badges).map(([badge, count]) => `<div>${badge}: ${count}</div>`).join("");
}

function updateVolunteers() {
    const list = document.getElementById("volunteerList");
    list.innerHTML = users.map(u => `
        <div class="volunteer-item">
            <div>
                <strong>${u.name}</strong><br>
                Email: ${u.email}<br>
                Age: ${u.age}, Barangay: ${u.barangay}<br>
                Skills: ${(u.skills || []).join(", ")}<br>
                Status: ${u.status}, Hours: ${u.hours || 0}, Badge: ${u.badge || "None"}
            </div>
            <div>
                ${u.status === "pending" ? `
                    <button class="approve-btn" onclick="approveUser('${u.id}')">Approve</button>
                    <button class="reject-btn" onclick="rejectUser('${u.id}')">Reject</button>
                ` : ""}
            </div>
        </div>
    `).join("");
}

function approveUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    user.status = "approved";
    saveUsers();
    updateVolunteers();
    updateDashboard();
    sendNotification(`Your application has been approved!`, "application", user.email);
}

function rejectUser(id) {
    const user = users.find(u => u.id === id);
    if (!user) return;

    user.status = "rejected";
    saveUsers();
    updateVolunteers();
    updateDashboard();
    sendNotification(`Your application has been rejected.`, "application", user.email);
}

function loadRestrictionsUI() {
    document.getElementById("minAge").value = restrictions.minAge;
    document.getElementById("validBarangays").value = restrictions.validBarangays;
}

function saveRestrictionsFromUI() {
    restrictions.minAge = parseInt(document.getElementById("minAge").value) || 18;
    restrictions.validBarangays = document.getElementById("validBarangays").value || "All";
    saveRestrictions();
    alert("Restrictions updated!");
}

function addSkill() {
    const newSkill = document.getElementById("newSkill").value.trim();
    if (newSkill && !skills.includes(newSkill)) {
        skills.push(newSkill);
        saveSkills();
        updateSkills();
        document.getElementById("newSkill").value = "";
    }
}

function updateSkills() {
    document.getElementById("skillList").innerHTML = skills.map(skill => `
        <li>${skill} <button class="delete-btn" onclick="deleteSkill('${skill}')">Delete</button></li>
    `).join("");
}

function deleteSkill(skill) {
    skills = skills.filter(s => s !== skill);
    saveSkills();
    updateSkills();
}

function updateTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = tasks.map(t => `
        <div class="task-item">
            <div>
                <strong>${t.name}</strong><br>
                ${t.desc}<br>
                Hours: ${t.hours}, Max Volunteers: ${t.maxVolunteers}<br>
                Assigned: ${(t.assigned || []).length}/${t.maxVolunteers}, Status: ${t.status}
            </div>
            <div>
                <button class="edit-btn" onclick="editTask('${t.id}')">Edit</button>
                ${t.status === "active" ? `<button class="archive-btn" onclick="archiveTask('${t.id}')">Archive</button>` : ""}
                <button class="delete-btn" onclick="deleteTask('${t.id}')">Delete</button>
            </div>
        </div>
    `).join("");
}

function showTaskModal(taskId = null) {
    const modal = document.getElementById("taskModal");
    const title = document.getElementById("taskModalTitle");
    const name = document.getElementById("taskName");
    const desc = document.getElementById("taskDesc");
    const hours = document.getElementById("taskHours");
    const maxVol = document.getElementById("taskMaxVolunteers");

    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        title.textContent = "Edit Task";
        name.value = task.name;
        desc.value = task.desc;
        hours.value = task.hours;
        maxVol.value = task.maxVolunteers;
        renderTaskAttachmentPreview(task.attachments || []);
        const input = document.getElementById("taskAttachments");
        if (input) input.value = "";
        modal.dataset.editId = taskId;
    } else {
        title.textContent = "Create Task";
        name.value = "";
        desc.value = "";
        hours.value = "";
        maxVol.value = "";
        clearAttachmentInput();
        delete modal.dataset.editId;
    }

    modal.style.display = "flex";
}

function closeTaskModal() {
    document.getElementById("taskModal").style.display = "none";
}

async function saveTask() {
    const name = document.getElementById("taskName").value.trim();
    const desc = document.getElementById("taskDesc").value.trim();
    const hours = parseInt(document.getElementById("taskHours").value);
    const maxVol = parseInt(document.getElementById("taskMaxVolunteers").value);

    if (!name || !desc || !hours || !maxVol) {
        alert("Please fill all fields");
        return;
    }

    const modal = document.getElementById("taskModal");
    const editId = modal.dataset.editId;
    const newAttachments = await getAttachmentsFromInput();

    if (editId) {
        const task = tasks.find(t => t.id === editId);
        if (!task) return;

        task.name = name;
        task.desc = desc;
        task.hours = hours;
        task.maxVolunteers = maxVol;

        if (newAttachments.length > 0) {
            task.attachments = newAttachments;
        } else {
            task.attachments = task.attachments || [];
        }
    } else {
        const newTask = {
            id: `task${Date.now()}`,
            name,
            desc,
            hours,
            maxVolunteers: maxVol,
            assigned: [],
            status: "active",
            attachments: newAttachments
        };
        tasks.push(newTask);
    }

    saveTasks();
    syncProgramsFromTasks();
    updateTasks();
    updateDashboard();
    closeTaskModal();
}

function editTask(id) {
    showTaskModal(id);
}

function archiveTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.status = "completed";
    saveTasks();
    syncProgramsFromTasks();
    updateTasks();
    updateDashboard();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    syncProgramsFromTasks();
    updateTasks();
    updateDashboard();
}

function updateValidation() {
    const submitted = tasks.filter(t => t.status === "completed" && !t.validated);
    document.getElementById("submittedTasks").innerHTML = submitted.map(t => `
        <div class="task-item">
            <div>
                <strong>${t.name}</strong><br>
                Completed by: ${(t.assigned || []).join(", ")}<br>
                Hours: ${t.hours}
            </div>
            <div>
                <button class="approve-btn" onclick="approveTask('${t.id}')">Approve</button>
                <button class="reject-btn" onclick="rejectTask('${t.id}')">Reject</button>
            </div>
        </div>
    `).join("");
}

function approveTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.validated = true;

    (task.assigned || []).forEach(userId => {
        const user = users.find(u => u.id === userId);
        if (user) {
            user.hours = (user.hours || 0) + task.hours;
            updateBadge(user);
        }
    });

    saveUsers();
    saveTasks();
    updateValidation();
    updateDashboard();

    const emails = (task.assigned || [])
        .map(id => users.find(u => u.id === id)?.email)
        .filter(Boolean);

    sendNotification(`Task "${task.name}" has been approved! You earned ${task.hours} hours.`, "task", emails);
}

function rejectTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.status = "active";
    task.validated = false;
    saveTasks();
    updateValidation();

    const emails = (task.assigned || [])
        .map(id => users.find(u => u.id === id)?.email)
        .filter(Boolean);

    sendNotification(`Task "${task.name}" has been rejected and returned to In Progress.`, "task", emails);
}

function updateBadge(user) {
    const hours = user.hours || 0;

    if (hours >= badgeThresholds.platinum) user.badge = "Platinum";
    else if (hours >= badgeThresholds.gold) user.badge = "Gold";
    else if (hours >= badgeThresholds.silver) user.badge = "Silver";
    else if (hours >= badgeThresholds.bronze) user.badge = "Bronze";
    else user.badge = "None";
}

function updateBadges() {
    document.getElementById("bronzeThreshold").value = badgeThresholds.bronze;
    document.getElementById("silverThreshold").value = badgeThresholds.silver;
    document.getElementById("goldThreshold").value = badgeThresholds.gold;
    document.getElementById("platinumThreshold").value = badgeThresholds.platinum;
}

function updateBadgeThresholds() {
    badgeThresholds.bronze = parseInt(document.getElementById("bronzeThreshold").value);
    badgeThresholds.silver = parseInt(document.getElementById("silverThreshold").value);
    badgeThresholds.gold = parseInt(document.getElementById("goldThreshold").value);
    badgeThresholds.platinum = parseInt(document.getElementById("platinumThreshold").value);

    saveBadges();

    users.forEach(updateBadge);
    saveUsers();

    alert("Badge thresholds updated!");
}

function updateCertifications() {
    const list = document.getElementById("certRequests");
    list.innerHTML = certifications.map(c => {
        const user = users.find(u => u.id === c.userId);
        return `
            <div class="cert-item">
                <div>
                    <strong>${user?.name || "Unknown"}</strong><br>
                    Email: ${user?.email || "N/A"}<br>
                    Hours: ${user?.hours || 0}, Badge: ${user?.badge || "None"}<br>
                    Status: ${c.status}
                </div>
                <div>
                    ${c.status === "pending" ? `
                        <button class="approve-btn" onclick="approveCert('${c.id}')">Approve</button>
                        <button class="reject-btn" onclick="rejectCert('${c.id}')">Reject</button>
                    ` : ""}
                </div>
            </div>
        `;
    }).join("");
}

function approveCert(id) {
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;

    cert.status = "approved";
    saveCerts();
    updateCertifications();

    const user = users.find(u => u.id === cert.userId);
    sendNotification("Your certification request has been approved!", "certification", user?.email);
}

function rejectCert(id) {
    const cert = certifications.find(c => c.id === id);
    if (!cert) return;

    cert.status = "rejected";
    saveCerts();
    updateCertifications();

    const user = users.find(u => u.id === cert.userId);
    sendNotification("Your certification request has been rejected.", "certification", user?.email);
}

function updateNotifications() {
    document.getElementById("notificationHistory").innerHTML = notifications.slice(-10).reverse().map(n => `
        <div style="padding: 10px; margin: 5px 0; background: var(--glass); border-radius: 8px;">
            <strong>${n.type}</strong>: ${n.message}<br>
            <small>To: ${n.recipient}</small>
        </div>
    `).join("");
}

function sendNotification(message, type, recipient) {
    if (!message) return;

    const notification = {
        id: Date.now(),
        title: type,
        message,
        type,
        recipient: Array.isArray(recipient) ? recipient.join(", ") : recipient,
        timestamp: new Date().toISOString()
    };

    notifications.push(notification);
    saveNotifications();
    updateNotifications();

    console.log(`Notification sent: ${message} to ${notification.recipient}`);

    if (recipient) {
        alert(`Notification sent to ${notification.recipient}`);
    }
}

function sendNotificationFromUI() {
    const message = document.getElementById("notificationMessage").value.trim();
    const type = document.getElementById("notificationType").value;

    if (!message) {
        alert("Please type a notification message.");
        return;
    }

    sendNotification(message, type, "all-users");
    document.getElementById("notificationMessage").value = "";
}

function logoutAdmin() {
    localStorage.removeItem(CURRENT_EMAIL_KEY);
    localStorage.removeItem(CURRENT_ROLE_KEY);
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    updateDashboard();
    updateAnalytics();
    updateVolunteers();
    loadRestrictionsUI();
    updateSkills();
    updateTasks();
    updateValidation();
    updateBadges();
    updateCertifications();
    updateNotifications();

    const attachmentInput = document.getElementById("taskAttachments");
    if (attachmentInput) {
        attachmentInput.addEventListener("change", async () => {
            try {
                const atts = await getAttachmentsFromInput();
                renderTaskAttachmentPreview(atts);
            } catch {
                renderTaskAttachmentPreview([]);
            }
        });
    }

    syncProgramsFromTasks();
});

window.showTab = showTab;
window.approveUser = approveUser;
window.rejectUser = rejectUser;
window.saveRestrictionsFromUI = saveRestrictionsFromUI;
window.addSkill = addSkill;
window.deleteSkill = deleteSkill;
window.showTaskModal = showTaskModal;
window.closeTaskModal = closeTaskModal;
window.saveTask = saveTask;
window.editTask = editTask;
window.archiveTask = archiveTask;
window.deleteTask = deleteTask;
window.approveTask = approveTask;
window.rejectTask = rejectTask;
window.updateBadgeThresholds = updateBadgeThresholds;
window.approveCert = approveCert;
window.rejectCert = rejectCert;
window.sendNotificationFromUI = sendNotificationFromUI;
window.logoutAdmin = logoutAdmin;