const USERS_KEY = "itanimUsers";
const TASKS_KEY = "itanimTasks";
const PROGRAMS_KEY = "itanimLocalPrograms";
const NOTIFICATIONS_KEY = "itanimNotifications";
const CURRENT_EMAIL_KEY = "currentUserEmail";
const CURRENT_ROLE_KEY = "currentUserRole";

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

document.addEventListener("DOMContentLoaded", function () {
    const logoutLink = document.getElementById("logoutLink");
    if (logoutLink) {
        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            localStorage.removeItem(CURRENT_EMAIL_KEY);
            localStorage.removeItem(CURRENT_ROLE_KEY);
            window.location.href = "login.html";
        });
    }

    loadUserDashboard();
});

function getCurrentUser() {
    const users = getStorageData(USERS_KEY);
    const currentUserEmail = localStorage.getItem(CURRENT_EMAIL_KEY);

    if (currentUserEmail) {
        const found = users.find(user => user.email === currentUserEmail);
        if (found) return found;
    }

    return users[0] || {
        id: "user1",
        name: "Demo User",
        email: "demo@example.com",
        enrolledPrograms: [],
        hours: 0,
        badges: [],
        certifications: [],
        skills: []
    };
}

function loadUserDashboard() {
    const users = getStorageData(USERS_KEY);
    const tasks = getStorageData(TASKS_KEY);
    const badges = getStorageData("badges");
    const certifications = getStorageData("certifications");
    const notifications = getStorageData(NOTIFICATIONS_KEY);
    const programs = getStorageData(PROGRAMS_KEY);

    const currentUser = getCurrentUser();

    document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser.name}!`;
    document.getElementById("totalHours").textContent = currentUser.hours || 0;
    document.getElementById("enrolledPrograms").textContent = currentUser.enrolledPrograms?.length || 0;
    document.getElementById("badgesEarned").textContent = currentUser.badges?.length || 0;
    document.getElementById("certificationsCount").textContent = currentUser.certifications?.length || 0;

    loadEnrolledPrograms(currentUser, programs);
    loadAssignedTasks(currentUser, tasks);
    loadUserSkills(currentUser);
    attachSkillControls(currentUser);
    loadUserBadges(currentUser, badges);
    loadUserCertifications(currentUser, certifications);
    loadUserNotifications(currentUser, notifications);
}

function loadUserSkills(user) {
    const container = document.getElementById("userSkillsList");
    const skills = user.skills || [];

    if (skills.length === 0) {
        container.innerHTML = "<p>No skills added yet.</p>";
        return;
    }

    container.innerHTML = skills.map(skill => `
        <span class="skill-pill">${skill}</span>
    `).join("");
}

function attachSkillControls(user) {
    const addButton = document.getElementById("addSkillButton");
    if (!addButton) return;

    addButton.onclick = () => {
        const select = document.getElementById("skillSelect");
        if (!select) return;

        const skill = select.value;
        if (!skill) return;

        const users = getStorageData(USERS_KEY);
        const currentIndex = users.findIndex(u =>
            (user.email && u.email === user.email) ||
            (user.id && u.id === user.id)
        );

        if (currentIndex === -1) {
            alert("Current user not found.");
            return;
        }

        users[currentIndex].skills = users[currentIndex].skills || [];

        if (users[currentIndex].skills.includes(skill)) {
            alert(`Skill already added: ${skill}`);
            return;
        }

        users[currentIndex].skills.push(skill);
        setStorageData(USERS_KEY, users);
        loadUserDashboard();
    };
}

function loadEnrolledPrograms(user, programs) {
    const container = document.getElementById("enrolledProgramsList");
    const enrolledIds = user.enrolledPrograms || [];

    if (enrolledIds.length === 0) {
        container.innerHTML = "<p>No programs enrolled yet.</p>";
        return;
    }

    const enrolledPrograms = programs.filter(program => enrolledIds.includes(program.id));

    if (enrolledPrograms.length === 0) {
        container.innerHTML = "<p>Enrolled program records were found, but program details are missing.</p>";
        return;
    }

    container.innerHTML = enrolledPrograms.map(program => `
        <div class="program-card">
            <img src="${program.image || 'https://via.placeholder.com/300x200?text=Program+Image'}" alt="${program.title || 'Program image'}" onerror="this.src='https://via.placeholder.com/300x200?text=Program+Image'">
            <div class="program-info">
                <h3>${program.title || "Untitled Program"}</h3>
                <p>${program.desc || program.description || "No description available."}</p>
                <div class="program-meta">
                    <span>📅 ${program.date || "N/A"}</span>
                    <span>📍 ${program.location || "N/A"}</span>
                    <span>⏰ ${program.hours || program.duration || 0} hours</span>
                </div>
                <div class="program-status">
                    <span class="status enrolled">Enrolled</span>
                </div>
            </div>
        </div>
    `).join("");
}

function loadAssignedTasks(user, tasks) {
    const container = document.getElementById("assignedTasksList");
    const userId = user.id || user.email;
    const userEmail = user.email;

    const userTasks = tasks.filter(t => {
        if (t.assignedTo) return t.assignedTo === userEmail;
        if (Array.isArray(t.assigned)) return t.assigned.includes(userId);
        return false;
    });

    if (userTasks.length === 0) {
        container.innerHTML = "<p>No tasks assigned.</p>";
        return;
    }

    container.innerHTML = userTasks.map(task => `
        <div class="task-item">
            <h4>${task.title || task.name}</h4>
            <p>${task.description || task.desc}</p>
            <div class="task-meta">
                <span>Status: ${task.status || "active"}</span>
                <span>Hours: ${task.hours ?? ""}</span>
            </div>
            ${
                Array.isArray(task.attachments) && task.attachments.length > 0
                    ? `<div class="task-attachments">
                        ${task.attachments.map(att => `
                            <img src="${att.dataUrl}" alt="${att.name}" style="width:90px;height:70px;object-fit:cover;border-radius:8px;margin:4px;">
                        `).join("")}
                    </div>`
                    : ""
            }
            <div class="task-actions">
                <button onclick="updateTaskStatus('${task.id}', 'completed')" class="btn-primary">Mark Complete</button>
            </div>
        </div>
    `).join("");
}

function loadUserBadges(user, badges) {
    const container = document.getElementById("userBadgesList");
    const userBadges = badges.filter(b => user.badges?.includes(b.id));

    if (userBadges.length === 0) {
        container.innerHTML = "<p>No badges earned yet.</p>";
        return;
    }

    container.innerHTML = userBadges.map(badge => `
        <div class="badge-item">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-info">
                <h4>${badge.name}</h4>
                <p>${badge.description}</p>
                <small>Earned on: ${badge.earnedDate || "N/A"}</small>
            </div>
        </div>
    `).join("");
}

function loadUserCertifications(user, certifications) {
    const container = document.getElementById("userCertificationsList");
    const userCerts = certifications.filter(c => user.certifications?.includes(c.id));

    if (userCerts.length === 0) {
        container.innerHTML = "<p>No certifications completed.</p>";
        return;
    }

    container.innerHTML = userCerts.map(cert => `
        <div class="cert-item">
            <h4>${cert.name}</h4>
            <p>${cert.description}</p>
            <div class="cert-meta">
                <span>Issued: ${cert.issuedDate || "N/A"}</span>
                <span>Valid until: ${cert.validUntil || "N/A"}</span>
            </div>
        </div>
    `).join("");
}

function loadUserNotifications(user, notifications) {
    const container = document.getElementById("userNotificationsList");
    const userNotifications = notifications.filter(n => {
        if (!n.recipient || !user.email) return false;
        return String(n.recipient).includes(user.email);
    }).slice(-5);

    if (userNotifications.length === 0) {
        container.innerHTML = "<p>No recent notifications.</p>";
        return;
    }

    container.innerHTML = userNotifications.map(notification => `
        <div class="notification-item">
            <h4>${notification.title || notification.type || "Notification"}</h4>
            <p>${notification.message}</p>
            <small>${notification.timestamp || ""}</small>
        </div>
    `).join("");
}

function updateTaskStatus(taskId, status) {
    const tasks = getStorageData(TASKS_KEY);
    const taskIndex = tasks.findIndex(t => String(t.id) === String(taskId));

    if (taskIndex === -1) {
        alert("Task not found.");
        return;
    }

    tasks[taskIndex].status = status;
    setStorageData(TASKS_KEY, tasks);
    loadUserDashboard();
    alert("Task status updated!");
}

function debugAddSampleData() {
    const users = getStorageData(USERS_KEY);
    if (users.length === 0) {
        users.push({
            id: "user1",
            name: "John Doe",
            email: "john@example.com",
            enrolledPrograms: ["prog1"],
            hours: 25,
            skills: ["gardening", "teamwork", "community service"],
            badges: ["badge1"],
            certifications: ["cert1"]
        });
        setStorageData(USERS_KEY, users);
        localStorage.setItem(CURRENT_EMAIL_KEY, "john@example.com");
        localStorage.setItem(CURRENT_ROLE_KEY, "user");
    }

    const programs = getStorageData(PROGRAMS_KEY);
    if (programs.length === 0) {
        programs.push({
            id: "prog1",
            title: "Community Clean-up",
            desc: "Help clean local parks",
            date: "2024-05-15",
            location: "Central Park",
            hours: 4,
            image: "https://via.placeholder.com/300x200?text=Clean-up"
        });
        setStorageData(PROGRAMS_KEY, programs);
    }

    const tasks = getStorageData(TASKS_KEY);
    if (tasks.length === 0) {
        tasks.push({
            id: "task1",
            title: "Prepare materials",
            desc: "Gather cleaning supplies",
            assignedTo: "john@example.com",
            status: "pending",
            hours: 2,
            attachments: []
        });
        setStorageData(TASKS_KEY, tasks);
    }

    const badges = getStorageData("badges");
    if (badges.length === 0) {
        badges.push({
            id: "badge1",
            name: "First Steps",
            description: "Completed first program",
            icon: "🏆",
            earnedDate: "2024-05-15"
        });
        setStorageData("badges", badges);
    }

    const certifications = getStorageData("certifications");
    if (certifications.length === 0) {
        certifications.push({
            id: "cert1",
            name: "Community Service Certificate",
            description: "Recognized for community contributions",
            issuedDate: "2024-05-15",
            validUntil: "2025-05-15"
        });
        setStorageData("certifications", certifications);
    }

    const notifications = getStorageData(NOTIFICATIONS_KEY);
    if (notifications.length === 0) {
        notifications.push({
            id: "notif1",
            title: "Welcome!",
            message: "Welcome to I-Tanim! Start by enrolling in programs.",
            recipient: "john@example.com",
            timestamp: new Date().toLocaleString()
        });
        setStorageData(NOTIFICATIONS_KEY, notifications);
    }

    loadUserDashboard();
    alert("Sample data added!");
}

window.loadUserDashboard = loadUserDashboard;
window.updateTaskStatus = updateTaskStatus;
window.debugAddSampleData = debugAddSampleData;