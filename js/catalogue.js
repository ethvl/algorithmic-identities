/* ==========================================================
   CATALOGUE — INTERACTIVE CIRCLES
   FINAL WORKING VERSION
========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  const circles = Array.from(document.querySelectorAll(".catalogue-circle"));
  const previewBox = document.getElementById("circlePreview");
  const filterButtons = Array.from(document.querySelectorAll(".catalogue-filter"));
  const circlesContainer = document.getElementById("catalogueCircles");

  if (!circles.length || !circlesContainer) return;


  /* ----------------------------------------------------------
     HELPERS
  ---------------------------------------------------------- */

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }


  /* ----------------------------------------------------------
     LAYOUT — RANDOM NON-OVERLAPPING POSITIONS
  ---------------------------------------------------------- */

  function layoutCirclesRandomly() {
    const containerWidth = circlesContainer.offsetWidth;
    const containerHeight = 600;

    const padding = 10;
    const placed = [];

    circles.forEach(circle => {

      const size = 70;  
      circle.style.width = size + "px";
      circle.style.height = size + "px";

      let left, top, tries = 0;
      let overlaps;

      do {
        left = randomInt(padding, containerWidth - size - padding);
        top = randomInt(padding, containerHeight - size - padding);

        overlaps = placed.some(prev => {
          const dist = Math.hypot(prev.left - left, prev.top - top);
          return dist < (prev.size / 2 + size / 2 + 8);
        });

        tries++;
        if (tries > 200) break;
      } while (overlaps);

      placed.push({ left, top, size });

      circle.style.left = left + "px";
      circle.style.top = top + "px";
    });
  }

  layoutCirclesRandomly();
  window.addEventListener("resize", layoutCirclesRandomly);



  /* ----------------------------------------------------------
     HOVER PREVIEW (CENTER PANEL)
  ---------------------------------------------------------- */

  circles.forEach(circle => {

    circle.addEventListener("mouseenter", () => {
      const img = circle.getAttribute("data-preview");

      if (img) {
        previewBox.style.backgroundImage = `url('${img}')`;
        previewBox.classList.add("show");
      }
    });

    circle.addEventListener("mouseleave", () => {
      previewBox.classList.remove("show");
    });

  });



  /* ----------------------------------------------------------
     FILTERS: EXPERIMENTS / PROTOTYPES
  ---------------------------------------------------------- */

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");

      filterButtons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      circles.forEach(circle => {
        const type = circle.dataset.type;

        if (filter === "experiments" && type === "prototype") {
          circle.classList.add("muted");
        } 
        else if (filter === "prototypes" && type === "experiment") {
          circle.classList.add("muted");
        }
        else {
          circle.classList.remove("muted");
        }
      });
    });
  });



  /* ----------------------------------------------------------
     CLICK — OPEN PAGE
  ---------------------------------------------------------- */

  circles.forEach(circle => {
    circle.addEventListener("click", () => {
      const target = circle.getAttribute("data-target");
      if (target) window.location.href = target;
    });
  });

});

