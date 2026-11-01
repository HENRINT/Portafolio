document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      navToggle.classList.toggle("open");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      });
    });
  }

  const featuredProjects = [
    {
      id: "aviestock",
      title: "Aviestock — Sistema POS",
      category: "backend",
      impact: "Control de inventario y cierres de turno con información financiera confiable.",
      description: "Sistema de punto de venta en línea que optimiza tiempos de producción, gestiona inventario y controla el estado financiero al cierre de cada turno.",
      technologies: ["Java", "Javalin", "MySQL", "HTML5", "CSS3", "JavaScript"],
      image: "Fotos/Avistock.jpg",
      repositoryNames: ["avistock-backend", "avistock-frontend"]
    },
    {
      id: "clean-world",
      title: "Clean World / Mundo Limpio",
      category: "web",
      impact: "Transformación de residuos PET en filamento para impresión 3D.",
      description: "Proyecto sustentable que transforma botellas de PET en filamento para impresoras 3D, con diseño de máquina y sitio web promocional.",
      technologies: ["Diseño técnico", "HTML5", "CSS3", "JavaScript"],
      image: "Fotos/Clean Word.webp",
      repositoryNames: []
    },
    {
      id: "mercup",
      title: "MercUp — Red Estudiantil",
      category: "multi",
      impact: "Arquitectura multiplataforma pensada para conectar a la comunidad estudiantil.",
      description: "Plataforma multiplataforma para la comunidad estudiantil, actualmente en etapa de diseño de arquitectura y prototipado.",
      technologies: ["Diseño de arquitectura", "Multiplataforma", "Frontend", "Backend"],
      image: "Fotos/mercUp.avif",
      repositoryNames: []
    }
  ];

  const projectsApiUrl = "https://api.github.com/users/HENRINT/repos?sort=updated&per_page=100";
  const projectsGrid = document.getElementById("projectsGrid");
  const projectCardTemplate = document.getElementById("projectCardTemplate");
  const projectsStatus = document.getElementById("projectsStatus");
  const projectsRetry = document.getElementById("projectsRetry");
  const projectCount = document.getElementById("projectCount");
  const filterButtons = document.querySelectorAll(".filter-btn");

  let activeFilter = "all";

  function applyProjectFilter() {
    projectsGrid.querySelectorAll(".project-card").forEach((card) => {
      card.hidden = activeFilter !== "all" && card.dataset.category !== activeFilter;
    });
  }

  function renderProjects(projects) {
    const cards = document.createDocumentFragment();

    projects.forEach((project) => {
      const card = projectCardTemplate.content.cloneNode(true);
      const article = card.querySelector(".project-card");
      const image = card.querySelector(".project-image");
      const repositoryLink = card.querySelector(".project-repo");

      article.dataset.projectId = project.id;
      article.dataset.category = project.category;
      article.dataset.title = project.title;
      article.dataset.description = project.description;
      article.dataset.technologies = project.technologies.join(", ");
      article.dataset.image = project.image;
      if (project.id === featuredProjects[0].id) {
        article.classList.add("project-card-featured");
        article.dataset.featured = "true";
      }

      image.src = project.image;
      image.alt = project.title;
      card.querySelector(".project-category").textContent = {
        backend: "Backend · Punto de venta",
        web: "Web · Sustentabilidad",
        multi: "Multiplataforma"
      }[project.category] || "Proyecto";
      card.querySelector(".project-title").textContent = project.title;
      card.querySelector(".project-impact").textContent = project.impact;
      card.querySelector(".project-description").textContent = project.description;
      const technologies = card.querySelector(".project-technologies");
      project.technologies.forEach((technology) => {
        const chip = document.createElement("li");
        chip.className = "technology-chip";
        chip.textContent = technology;
        technologies.appendChild(chip);
      });

      if (project.repositoryUrl) {
        repositoryLink.href = project.repositoryUrl;
        repositoryLink.hidden = false;
      }

      cards.appendChild(card);
    });

    projectsGrid.replaceChildren(cards);
    applyProjectFilter();
    projectCount.textContent = projects.length;
  }

  function setProjectStatus(message, isError = false) {
    projectsStatus.textContent = message;
    projectsRetry.hidden = !isError;
  }

  async function fetchProjects() {
    const response = await fetch(projectsApiUrl, {
      headers: { Accept: "application/vnd.github+json" }
    });

    if (!response.ok) {
      throw new Error(`La API de GitHub respondió con el estado ${response.status}.`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("La respuesta de GitHub no contiene una lista de repositorios.");
    }

    return repositories;
  }

  function attachRepositoryLinks(repositories) {
    const repositoriesByName = new Map(
      repositories
        .filter((repository) => repository && typeof repository.name === "string")
        .map((repository) => [repository.name.toLowerCase(), repository])
    );

    return featuredProjects.map((project) => {
      const repository = project.repositoryNames
        .map((name) => repositoriesByName.get(name))
        .find((match) => match && typeof match.html_url === "string");

      return {
        ...project,
        repositoryUrl: repository ? repository.html_url : ""
      };
    });
  }

  async function loadProjects() {
    setProjectStatus("Cargando proyectos...");
    projectsGrid.setAttribute("aria-busy", "true");
    projectsRetry.disabled = true;

    try {
      const repositories = await fetchProjects();
      renderProjects(attachRepositoryLinks(repositories));
      setProjectStatus("");
    } catch (error) {
      console.error("No se pudieron actualizar los enlaces de proyectos desde GitHub.", error);
      renderProjects(featuredProjects);
      setProjectStatus("Se muestran los proyectos principales; no fue posible actualizar los enlaces de GitHub.", true);
    } finally {
      projectsGrid.setAttribute("aria-busy", "false");
      projectsRetry.disabled = false;
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((filterButton) => filterButton.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter;
      applyProjectFilter();
    });
  });

  const modal = document.getElementById("projectModal");
  const closeModal = document.querySelector(".close-modal");
  const modalImg = document.getElementById("modalImg");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalTech = document.getElementById("modalTech");

  function openProjectModal(card) {
    modalImg.src = card.dataset.image;
    modalImg.alt = card.dataset.title;
    modalTitle.textContent = card.dataset.title;
    modalDesc.textContent = card.dataset.description;
    modalTech.textContent = card.dataset.technologies;
    modal.style.display = "flex";
  }

  projectsGrid.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".project-details");
    if (detailsButton) openProjectModal(detailsButton.closest(".project-card"));
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });
  window.addEventListener("click", (event) => {
    if (event.target === modal) modal.style.display = "none";
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "flex") {
      modal.style.display = "none";
    }
  });

  projectsRetry.addEventListener("click", loadProjects);
  loadProjects();
});
