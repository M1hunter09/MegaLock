// Mobile nav toggle
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});

// Scroll-reveal
const sections = document.querySelectorAll('section, footer');
const obsOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, obsOptions);

// Join Discord
const joinBtn = document.getElementById('joinBtn');
if(joinBtn) joinBtn.onclick = () => window.location.href = 'https://discord.gg/RgAnVV7aKN';


// Accordion for rules
  // Toggle accordion visibility on header click
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.nextElementSibling.classList.toggle('display');
    });
  });

  // Open the first accordion body by default
  const firstBody = document.querySelector('.accordion-body');
  if (firstBody) {
    firstBody.classList.add('display');
  }



const teamTable = document.getElementById('teamStatusTable');
const searchInput = document.getElementById('searchInput');
const flagFilter = document.getElementById('flagFilter');
const platformFilter = document.getElementById('platformFilter');
const regionFilter = document.getElementById('regionFilter');
const toggleBtn = document.getElementById('toggleTableBtn');
const clearBtn = document.getElementById('clearFiltersBtn');

let originalData = [];

// Load from local JSON file
if (teamTable) {
  fetch('teams.json')
    .then(res => res.json())
    .then(data => {
      originalData = data;
      renderTable(data);
    })
    .catch(err => {
      console.error('Error loading teams.json:', err);
    });
}

// Render table rows
function renderTable(data) {
  const tbody = teamTable.querySelector('tbody');
  tbody.innerHTML = '';

  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No teams match your search/filter.</td></tr>';
    return;
  }

  data.forEach(t => {
    if (t.section) {
      const sectionRow = `
        <tr class="tableSection">
          <td colspan="4">🎮 ${t.section}</td>
        </tr>`;
      tbody.insertAdjacentHTML('beforeend', sectionRow);
      return;
    }

    const row = `
      <tr>
        <td>${t.name}</td>
        <td>${t.flagged}</td>
        <td>${t.manager}</td>
        <td>${t.platform} – ${t.region}</td>
      </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

// Apply filters
function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const flag = flagFilter.value;
  const platform = platformFilter.value;
  const region = regionFilter.value;

  const filtered = originalData.filter(team => {
    if (team.section) return true;

    const nameMatch = team.name.toLowerCase().includes(term);
    const managerMatch = team.manager.toLowerCase().includes(term);
    const flagMatch = flag === 'All' || team.flagged === flag;
    const platformMatch = platform === 'All' || team.platform === platform;
    const regionMatch = region === 'All' || team.region === region;

    return (nameMatch || managerMatch) && flagMatch && platformMatch && regionMatch;
  });

  renderTable(filtered);
}

// Clear filters
function clearFilters() {
  searchInput.value = '';
  flagFilter.value = 'All';
  platformFilter.value = 'All';
  regionFilter.value = 'All';
  renderTable(originalData);
}

// Expand/Collapse
toggleBtn?.addEventListener('click', () => {
  teamTable.classList.toggle('collapsed');
  toggleBtn.textContent = teamTable.classList.contains('collapsed') ? 'Expand Table' : 'Collapse Table';
});

// Listeners
searchInput?.addEventListener('input', applyFilters);
flagFilter?.addEventListener('change', applyFilters);
platformFilter?.addEventListener('change', applyFilters);
regionFilter?.addEventListener('change', applyFilters);
clearBtn?.addEventListener('click', clearFilters);
