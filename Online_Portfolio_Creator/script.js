// script.js
document.addEventListener("DOMContentLoaded", () => {
  // Inputs
  const nameInput = document.getElementById("input-name");
  const roleInput = document.getElementById("input-role");
  const bioInput = document.getElementById("input-bio");
  const emailInput = document.getElementById("input-email");
  const linksInput = document.getElementById("input-links");
  const photoInput = document.getElementById("input-photo");

  // Preview targets
  const previewName = document.getElementById("preview-name");
  const previewRole = document.getElementById("preview-role");
  const previewBio = document.getElementById("preview-bio");
  const previewSkills = document.getElementById("preview-skills");
  const previewProjects = document.getElementById("preview-projects");
  const previewContact = document.getElementById("preview-contact");
  const previewPhoto = document.getElementById("preview-photo");
  const photoPlaceholder = document.getElementById("photo-preview");

  // Containers & buttons
  const addSkillBtn = document.getElementById("add-skill-btn");
  const skillsContainer = document.getElementById("skills-container");
  const addProjectBtn = document.getElementById("add-project-btn");
  const projectsContainer = document.getElementById("projects-container");
  const generateBtn = document.getElementById("generate-btn");
  const downloadHtmlBtn = document.getElementById("download-html-btn");
  const toggleTheme = document.getElementById("toggle-theme");
  const themeLabel = document.getElementById("theme-label");

  // Templates
  const skillTemplate = document.getElementById("skill-template");
  const projectTemplate = document.getElementById("project-template");

  // Load from localStorage if exists
  loadState();

  // Initial entries if empty
  if (!skillsContainer.children.length) addSkillEntry();
  if (!projectsContainer.children.length) addProjectEntry();

  // Event hooks
  [nameInput, roleInput, bioInput, emailInput, linksInput].forEach((el) =>
    el.addEventListener("input", () => {
      updatePreview();
      saveState();
    })
  );

  addSkillBtn.addEventListener("click", () => {
    addSkillEntry();
    saveState();
  });

  addProjectBtn.addEventListener("click", () => {
    addProjectEntry();
    saveState();
  });

  generateBtn.addEventListener("click", () => {
    updatePreview();
    saveState();
  });

  downloadHtmlBtn.addEventListener("click", downloadHTML);

  photoInput.addEventListener("change", handlePhoto);
  [nameInput, roleInput, bioInput, emailInput, linksInput].forEach((i) =>
    i.addEventListener("change", saveState)
  );

  toggleTheme.addEventListener("change", () => {
    document.body.classList.toggle("dark", toggleTheme.checked);
    themeLabel.textContent = toggleTheme.checked ? "Dark" : "Light";
    localStorage.setItem("portfolio_theme", toggleTheme.checked ? "dark" : "light");
  });

  // Drag & reorder for project entries
  let dragSrc = null;
  function addProjectEntry(data) {
    const clone = projectTemplate.content.cloneNode(true);
    const entry = clone.querySelector(".project-entry");
    if (data) {
      entry.querySelector(".proj-title").value = data.title || "";
      entry.querySelector(".proj-desc").value = data.description || "";
      entry.querySelector(".proj-link").value = data.link || "";
      entry.querySelector(".proj-tags").value = data.tags || "";
    }
    const removeBtn = entry.querySelector(".remove-project");
    removeBtn.addEventListener("click", () => {
      entry.remove();
      updatePreview();
      saveState();
    });

    entry.querySelectorAll("input, textarea").forEach((el) => {
      el.addEventListener("input", () => {
        updatePreview();
        saveState();
      });
    });

    // drag events
    entry.addEventListener("dragstart", (e) => {
      dragSrc = entry;
      entry.classList.add("dragging");
    });
    entry.addEventListener("dragend", () => {
      entry.classList.remove("dragging");
    });
    entry.addEventListener("dragover", (e) => {
      e.preventDefault();
      const after = getDragAfterElement(projectsContainer, e.clientY);
      if (after == null) {
        projectsContainer.appendChild(dragSrc);
      } else {
        projectsContainer.insertBefore(dragSrc, after);
      }
      updatePreview();
    });

    projectsContainer.appendChild(entry);
    updatePreview();
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".project-entry:not(.dragging)")];
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else return closest;
      },
      { offset: -Infinity }
    ).element;
  }

  function addSkillEntry(data) {
    const clone = skillTemplate.content.cloneNode(true);
    const entry = clone.querySelector(".skill-entry");
    const nameField = entry.querySelector(".skill-name");
    const levelSlider = entry.querySelector(".skill-level");
    const levelDisplay = entry.querySelector(".level-display");
    if (data) {
      nameField.value = data.name || "";
      levelSlider.value = data.level || 7;
      levelDisplay.textContent = data.level || 7;
    }
    levelSlider.addEventListener("input", () => {
      levelDisplay.textContent = levelSlider.value;
      updatePreview();
      saveState();
    });
    nameField.addEventListener("input", () => {
      updatePreview();
      saveState();
    });
    entry.querySelector(".remove-skill").addEventListener("click", () => {
      entry.remove();
      updatePreview();
      saveState();
    });
    skillsContainer.appendChild(entry);
    updatePreview();
  }

  function handlePhoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      previewPhoto.src = base64;
      photoPlaceholder.innerHTML = "";
      const img = document.createElement("img");
      img.src = base64;
      photoPlaceholder.innerHTML = "";
      photoPlaceholder.appendChild(img);
      updatePreview();
      saveState();
    };
    reader.readAsDataURL(file);
  }

  function updatePreview() {
    previewName.textContent = nameInput.value || "Your Name";
    previewRole.textContent = roleInput.value || "Your Role";
    previewBio.textContent = bioInput.value || "Short bio about yourself goes here. Show your passion, skills, and what you’re building.";

    // Skills
    previewSkills.innerHTML = "";
    [...skillsContainer.querySelectorAll(".skill-entry")].forEach((entry) => {
      const skillName = entry.querySelector(".skill-name").value.trim();
      const level = entry.querySelector(".skill-level").value;
      if (!skillName) return;
      const badge = document.createElement("div");
      badge.className = "skill-badge";
      const nameSpan = document.createElement("div");
      nameSpan.textContent = skillName;
      const bar = document.createElement("div");
      bar.className = "bar";
      const inner = document.createElement("div");
      inner.className = "bar-inner";
      inner.style.width = `${(level / 10) * 100}%`;
      bar.appendChild(inner);
      badge.appendChild(nameSpan);
      badge.appendChild(bar);
      previewSkills.appendChild(badge);
    });

    // Projects
    previewProjects.innerHTML = "";
    [...projectsContainer.querySelectorAll(".project-entry")].forEach((p) => {
      const title = p.querySelector(".proj-title").value.trim();
      const desc = p.querySelector(".proj-desc").value.trim();
      const link = p.querySelector(".proj-link").value.trim();
      const tagsRaw = p.querySelector(".proj-tags").value.trim();
      if (!title && !desc && !link) return;

      const card = document.createElement("div");
      card.className = "project-card";
      if (title) {
        const h3 = document.createElement("h3");
        h3.textContent = title;
        card.appendChild(h3);
      }
      if (tagsRaw) {
        const tagsDiv = document.createElement("div");
        tagsDiv.className = "tags";
        tagsRaw.split(",").map((t) => t.trim()).filter(Boolean).forEach((tg) => {
          const span = document.createElement("span");
          span.className = "tag";
          span.textContent = tg;
          tagsDiv.appendChild(span);
        });
        card.appendChild(tagsDiv);
      }
      if (desc) {
        const pdesc = document.createElement("p");
        pdesc.textContent = desc;
        card.appendChild(pdesc);
      }
      if (link) {
        const a = document.createElement("a");
        a.href = link.startsWith("http") ? link : "https://" + link;
        a.target = "_blank";
        a.textContent = link;
        card.appendChild(a);
      }
      previewProjects.appendChild(card);
    });

    // Contact
    const contacts = [];
    if (emailInput.value.trim()) contacts.push(`Email: ${emailInput.value.trim()}`);
    if (linksInput.value.trim()) contacts.push(`Links: ${linksInput.value.trim()}`);
    previewContact.textContent = contacts.join(" | ") || "You can reach me at ...";

    // Photo (if not already set from upload, leave placeholder)
    if (previewPhoto.src && previewPhoto.src !== window.location.href) {
      // okay
    } else {
      previewPhoto.src = "";
    }
  }

  function downloadHTML() {
    updatePreview();

    const safeName = (nameInput.value.trim() || "portfolio").replaceAll(" ", "_");
    const preview = document.getElementById("portfolio-preview");
    // Clone styles inline for standalone
    const docHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${safeName} - Portfolio</title>
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<style>
  ${getStandaloneCSS()}
</style>
</head>
<body>
  ${preview.outerHTML}
</body>
</html>`;

    const blob = new Blob([docHTML], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${safeName}.html`;
    a.click();
  }

  function getStandaloneCSS() {
    // Minimal necessary to keep look; you can expand by copying full CSS here if needed
    return `
    body {margin:0;font-family: Inter,-apple-system,sans-serif;background:#f0f4fa;color:#1f2d3a;}
    h1{margin:0;font-size:2.2rem;}
    .project-card{background:#fff;border-radius:12px;padding:18px;margin-bottom:18px;box-shadow:0 20px 40px rgba(0,0,0,0.05);}
    .skill-badge{display:inline-block;background:rgba(99,102,241,0.08);padding:8px 14px;border-radius:999px;margin-right:6px;margin-bottom:6px;}
    .tag{background:rgba(214,70,239,0.08);padding:4px 10px;border-radius:999px;margin-right:4px;font-size:.6rem;}
    `;
  }

  function saveState() {
    const state = {
      name: nameInput.value,
      role: roleInput.value,
      bio: bioInput.value,
      email: emailInput.value,
      links: linksInput.value,
      theme: toggleTheme.checked ? "dark" : "light",
      skills: [...skillsContainer.querySelectorAll(".skill-entry")].map((entry) => ({
        name: entry.querySelector(".skill-name").value,
        level: entry.querySelector(".skill-level").value,
      })),
      projects: [...projectsContainer.querySelectorAll(".project-entry")].map((p) => ({
        title: p.querySelector(".proj-title").value,
        description: p.querySelector(".proj-desc").value,
        link: p.querySelector(".proj-link").value,
        tags: p.querySelector(".proj-tags").value,
      })),
      photo: previewPhoto.src || "",
    };
    localStorage.setItem("portfolio_state", JSON.stringify(state));
  }

  function loadState() {
    const raw = localStorage.getItem("portfolio_state");
    if (!raw) return;
    try {
      const s = JSON.parse(raw);
      nameInput.value = s.name || "";
      roleInput.value = s.role || "";
      bioInput.value = s.bio || "";
      emailInput.value = s.email || "";
      linksInput.value = s.links || "";
      if (s.theme === "dark") {
        toggleTheme.checked = true;
        document.body.classList.add("dark");
        themeLabel.textContent = "Dark";
      }
      if (s.skills && Array.isArray(s.skills)) {
        s.skills.forEach((sk) => addSkillEntry(sk));
      }
      if (s.projects && Array.isArray(s.projects)) {
        s.projects.forEach((pr) => addProjectEntry(pr));
      }
      if (s.photo) {
        previewPhoto.src = s.photo;
        const img = document.createElement("img");
        img.src = s.photo;
        photoPlaceholder.innerHTML = "";
        photoPlaceholder.appendChild(img);
      }
      updatePreview();
    } catch (e) {
      console.warn("Failed to load saved state", e);
    }
  }

  // real-time syncing
  updatePreview();
});
