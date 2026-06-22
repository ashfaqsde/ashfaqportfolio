/* ============================================
   PARTICLE NETWORK — connected cloud nodes
============================================ */
(function () {
  const canvas = document.getElementById('net-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w, h;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function initParticles() {
    const count = Math.min(70, Math.floor((w * h) / 22000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 1
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);

    // update + draw nodes
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(41, 211, 255, 0.55)';
      ctx.fill();
    });

    // draw connections between nearby nodes
    const maxDist = 150;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0, 115, 187, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    if (!reduceMotion) requestAnimationFrame(step);
  }

  resize();
  initParticles();
  step();

  window.addEventListener('resize', () => {
    resize();
    initParticles();
  });
})();

/* ============================================
   TERMINAL TYPING LOOP
============================================ */
(function () {
  const el = document.getElementById('terminal-text');
  if (!el) return;

  const lines = [
    '$ kubectl get pods --all-namespaces',
    'STATUS: Running (12/12) ✓',
    '$ terraform apply -auto-approve',
    'Apply complete. 0 errors.',
    '$ aws ec2 describe-instances',
    'uptime: 99.98% · last 30d',
    '$ ansible-playbook deploy.yml',
    'PLAY RECAP — ok=14 failed=0'
  ];

  let lineIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const typeSpeed = 38;
  const deleteSpeed = 18;
  const holdTime = 1400;

  function tick() {
    const current = lines[lineIndex];

    if (!deleting) {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, holdTime);
        return;
      }
      setTimeout(tick, typeSpeed);
    } else {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteSpeed);
    }
  }

  tick();
})();

/* ============================================
   SCROLL REVEAL
============================================ */
(function () {
  const targets = document.querySelectorAll(
    '.about-grid, .stat-strip, .timeline-content, .project-card, .bento-card, .edu-card, .cert-card, .contact-grid'
  );
  targets.forEach(t => t.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(t => observer.observe(t));
})();

/* ============================================
   CONTACT FORM — Web3Forms submit handler
============================================ */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const accessKey = form.querySelector('[name="access_key"]').value;
    if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
      statusEl.textContent = 'Form not yet connected — add your Web3Forms access key in index.html.';
      statusEl.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    submitText.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });

      let result = {};
      try {
        result = await response.json();
      } catch (parseErr) {
        console.error('Web3Forms response was not valid JSON:', parseErr);
      }

      if (response.ok && result.success !== false) {
        statusEl.textContent = 'Message sent — thanks for reaching out. I\'ll reply soon.';
        statusEl.className = 'form-status success';
        form.reset();
      } else {
        console.error('Web3Forms error response:', result);
        statusEl.textContent = result.message || 'Something went wrong. Please try again.';
        statusEl.className = 'form-status error';
      }
    } catch (err) {
      console.error('Form submission network error:', err);
      statusEl.textContent = 'Network error — please try again or email me directly.';
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitText.textContent = 'Send Message';
    }
  });
})();
