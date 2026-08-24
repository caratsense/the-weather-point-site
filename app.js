/* -------------------------------------------------------------------------- */
/* THE WEATHER POINT - Phone UI & Interactive Slider Engine */
/* -------------------------------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
  initHeaderScroll();
  initCalculator();
  initWizard();
});

/* --- Header Scroll & Responsive Mobile Navigation --- */
function initHeaderScroll() {
  const header = document.getElementById('header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const toggleIcon = document.getElementById('toggle-icon');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 15) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      if (isVisible) {
        navMenu.style.display = 'none';
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '68px';
        navMenu.style.left = '0';
        navMenu.style.right = '0';
        navMenu.style.backgroundColor = '#FFFFFF';
        navMenu.style.padding = '1.25rem 1.5rem';
        navMenu.style.borderBottom = '1px solid #E2E8F0';
        navMenu.style.boxShadow = '0 12px 25px rgba(0,0,0,0.12)';
        if (toggleIcon) toggleIcon.className = 'fa-solid fa-xmark';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
          if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
        }
      });
    });
  }
}

/* --- AC Tonnage & Cooling Calculator --- */
let calcUsageFactor = 1.0;
let calcSunFactor = 1.0;

function initCalculator() {
  const inputArea = document.getElementById('input-area');
  const inputHeight = document.getElementById('input-height');
  const areaVal = document.getElementById('area-val');
  const heightVal = document.getElementById('height-val');

  if (!inputArea || !inputHeight) return;

  // Initialize track progress fill lines
  updateSliderFill(inputArea);
  updateSliderFill(inputHeight);

  inputArea.addEventListener('input', (e) => {
    areaVal.textContent = parseInt(e.target.value).toLocaleString() + ' sq.ft';
    updateSliderFill(e.target);
    calculateCoolingLoad();
  });

  inputHeight.addEventListener('input', (e) => {
    heightVal.textContent = e.target.value + ' ft';
    updateSliderFill(e.target);
    calculateCoolingLoad();
  });

  const usageButtons = document.querySelectorAll('#usage-options .option-btn');
  usageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      usageButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcUsageFactor = parseFloat(btn.getAttribute('data-factor'));
      calculateCoolingLoad();
    });
  });

  const sunButtons = document.querySelectorAll('#sun-options .option-btn');
  sunButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      sunButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      calcSunFactor = parseFloat(btn.getAttribute('data-factor'));
      calculateCoolingLoad();
    });
  });

  calculateCoolingLoad();
}

function updateSliderFill(slider) {
  const min = parseFloat(slider.min) || 0;
  const max = parseFloat(slider.max) || 100;
  const val = parseFloat(slider.value);
  const percent = ((val - min) / (max - min)) * 100;
  slider.style.setProperty('--percent', `${percent}%`);
}

function calculateCoolingLoad() {
  const area = parseFloat(document.getElementById('input-area').value);
  const height = parseFloat(document.getElementById('input-height').value);

  const heightFactor = height / 8.0;
  const rawBTU = area * 24 * heightFactor * calcUsageFactor * calcSunFactor;
  
  let tons = rawBTU / 12000;
  tons = Math.ceil(tons * 2) / 2;
  if (tons < 1.0) tons = 1.0;

  const totalBTU = Math.round(tons * 12000);
  const cfm = Math.round(tons * 400);

  document.getElementById('res-tonnage').textContent = tons.toFixed(1) + ' Tons';
  document.getElementById('res-btu').textContent = totalBTU.toLocaleString() + ' BTU / hr Cooling Load';
  document.getElementById('res-cfm').textContent = cfm.toLocaleString() + ' CFM';

  let systemType = '';
  if (tons >= 10 || area >= 3000) {
    systemType = 'Centralized VRF / VRV System';
  } else if (tons >= 4.5 || area >= 1200) {
    systemType = 'Multi-Split Inverter Setup';
  } else {
    systemType = 'High-Wall Inverter Split ACs';
  }

  document.getElementById('res-system-type').textContent = systemType;
}

/* --- Interactive System Selector Wizard --- */
let currentStep = 1;
const wizardAnswers = {
  buildingType: 'commercial',
  ceilingDuct: 'yes',
  priority: 'efficiency'
};

const wizardStepsData = [
  {
    step: 1,
    question: "Step 1: What type of property needs AC fitting?",
    options: [
      { id: 'commercial', icon: 'fa-building', title: 'Commercial Office / Multi-Floor Tower', desc: 'Space with multiple rooms or high occupancy.' },
      { id: 'retail', icon: 'fa-store', title: 'Retail Shop / Showroom', desc: 'Store requiring steady customer comfort and fresh air.' },
      { id: 'server', icon: 'fa-server', title: 'Server Room / Tech Facility', desc: 'Critical 24/7 equipment cooling.' },
      { id: 'residential', icon: 'fa-house-chimney', title: 'Luxury Villa / Penthouse', desc: 'Multi-room residence requiring silent zone control.' }
    ]
  },
  {
    step: 2,
    question: "Step 2: Is drop ceiling duct space available?",
    options: [
      { id: 'yes', icon: 'fa-layer-group', title: 'Yes, Drop Ceiling Available', desc: 'Space above ceiling tiles to run concealed insulated ducts.' },
      { id: 'no', icon: 'fa-border-all', title: 'No, Solid Concrete Ceiling', desc: 'Direct slab ceiling without duct plenum space.' },
      { id: 'exposed', icon: 'fa-industry', title: 'Exposed Industrial Ceiling', desc: 'Open spiral aesthetic ductwork or direct wall mounts.' }
    ]
  },
  {
    step: 3,
    question: "Step 3: What is your primary priority?",
    options: [
      { id: 'efficiency', icon: 'fa-leaf', title: 'Maximum Energy Efficiency & Aesthetics', desc: 'Subtle hidden linear slot diffusers.' },
      { id: 'budget', icon: 'fa-wallet', title: 'Fast Installation & Turnaround', desc: 'Rapid 1-2 day fitting with minimal disruption.' },
      { id: 'zone', icon: 'fa-temperature-low', title: 'Independent Precision Zone Control', desc: 'Adjust temperature by room.' }
    ]
  }
];

function initWizard() {
  renderWizardStep(1);
}

function renderWizardStep(stepNum) {
  const container = document.getElementById('wizard-step-container');
  const prevBtn = document.getElementById('wiz-prev-btn');
  const nextBtn = document.getElementById('wiz-next-btn');

  if (stepNum <= 3) {
    const stepData = wizardStepsData[stepNum - 1];
    let html = `<h4 class="wizard-question-title">${stepData.question}</h4>`;
    html += `<div class="wizard-options-grid">`;

    stepData.options.forEach(opt => {
      const isSelected = (stepNum === 1 && wizardAnswers.buildingType === opt.id) ||
                         (stepNum === 2 && wizardAnswers.ceilingDuct === opt.id) ||
                         (stepNum === 3 && wizardAnswers.priority === opt.id);

      html += `
        <div class="wizard-choice-card ${isSelected ? 'selected' : ''}" onclick="selectWizardOption(${stepNum}, '${opt.id}')">
          <i class="fa-solid ${opt.icon}"></i>
          <h5>${opt.title}</h5>
          <p>${opt.desc}</p>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;

    nextBtn.innerHTML = `Next Step <i class="fa-solid fa-arrow-right"></i>`;
  } else {
    renderWizardResult();
    nextBtn.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Book Site Inspection`;
  }

  for (let i = 1; i <= 3; i++) {
    const bubble = document.getElementById(`step-bubble-${i}`);
    if (bubble) {
      if (i === stepNum) {
        bubble.className = 'step-bubble active';
      } else if (i < stepNum) {
        bubble.className = 'step-bubble completed';
        bubble.innerHTML = '<i class="fa-solid fa-check"></i>';
      } else {
        bubble.className = 'step-bubble';
        bubble.textContent = i;
      }
    }
  }

  prevBtn.style.visibility = stepNum > 1 ? 'visible' : 'hidden';
}

function selectWizardOption(stepNum, val) {
  if (stepNum === 1) wizardAnswers.buildingType = val;
  if (stepNum === 2) wizardAnswers.ceilingDuct = val;
  if (stepNum === 3) wizardAnswers.priority = val;

  renderWizardStep(stepNum);
}

function wizNextStep() {
  if (currentStep < 4) {
    currentStep++;
    renderWizardStep(currentStep);
  } else {
    openModal(`Inspection for Wizard Spec (${wizardAnswers.buildingType.toUpperCase()})`);
  }
}

function wizPrevStep() {
  if (currentStep > 1) {
    currentStep--;
    renderWizardStep(currentStep);
  }
}

function renderWizardResult() {
  const container = document.getElementById('wizard-step-container');
  let recommendedSystem = '';
  let rationale = '';

  if (wizardAnswers.ceilingDuct === 'yes' && (wizardAnswers.buildingType === 'commercial' || wizardAnswers.priority === 'efficiency')) {
    recommendedSystem = 'Centralized VRF / VRV Multi-Zone System';
    rationale = 'Your property has ceiling plenum space and requires high efficiency integration. A centralized VRF system with concealed linear diffusers offers maximum energy savings.';
  } else if (wizardAnswers.priority === 'budget' || wizardAnswers.ceilingDuct === 'no') {
    recommendedSystem = 'Ductless Multi-Split Inverter ACs';
    rationale = 'A Multi-Split setup allows quick wall-mount or cassette unit installation without tearing down solid ceilings, keeping labor costs low while providing zone control.';
  } else {
    recommendedSystem = 'Packaged Ducted Unit with VAV Controls';
    rationale = 'Ideal for open-plan commercial spaces requiring continuous fresh air ventilation and 24/7 temperature stability.';
  }

  container.innerHTML = `
    <div class="text-center" style="padding: 0.5rem 0;">
      <div class="badge-tag" style="background-color: #E0F2FE; color: #0284C7; font-size: 0.85rem;">
        <i class="fa-solid fa-circle-check"></i> Analysis Complete
      </div>
      <h3 style="font-size: 1.4rem; margin: 0.75rem 0; color: #0F172A;">Recommended Solution: ${recommendedSystem}</h3>
      <p style="color: #475569; max-width: 620px; margin: 0 auto 1.25rem auto; font-size: 0.95rem; line-height: 1.6;">${rationale}</p>
    </div>
  `;
}

/* --- Modal & Inspection Form Logic --- */
function openModal(serviceTitle = 'General Inspection') {
  const modal = document.getElementById('quote-modal');
  const modalTitle = document.getElementById('modal-title');
  const specText = document.getElementById('spec-details');

  if (modalTitle) {
    modalTitle.textContent = `Schedule Inspection: ${serviceTitle}`;
  }

  const currentTons = document.getElementById('res-tonnage')?.textContent || '';
  const currentArea = document.getElementById('input-area')?.value || '';
  if (specText && currentTons) {
    specText.value = `Site Request: ${currentArea} sq.ft space, estimated ${currentTons} cooling load requirement.`;
  }

  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal() {
  const modal = document.getElementById('quote-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function bookCalculatedSpec() {
  const tons = document.getElementById('res-tonnage').textContent;
  const sys = document.getElementById('res-system-type').textContent;
  openModal(`Calculated Spec (${tons} - ${sys})`);
}

function handleFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('client-name').value;
  closeModal();

  showToast(`Thank you, ${name}! THE WEATHER POINT engineering team will contact you within 2 hours.`);
  document.getElementById('inspection-form').reset();
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');

  if (toast && toastMsg) {
    toastMsg.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 4500);
  }
}
