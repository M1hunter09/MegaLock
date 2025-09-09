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
if(joinBtn) joinBtn.onclick = () => window.location.href = 'https://discord.gg/7SBuJNFMVx';


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


// bracket script
async function loadBrackets() {
  try {
    const res = await fetch('brackets.json');
    const data = await res.json();
    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';

    data.brackets.forEach(bracket => {
      // Panel for each bracket
      const panel = document.createElement('div');
      panel.classList.add('bracket-panel');

      const title = document.createElement('h4');
      title.innerText = bracket.name;
      panel.appendChild(title);

      const teams = bracket.teams;
      const results = bracket.results || {};
      let currentMatches = teams.map(t => [t]);
      const roundsCount = Math.ceil(Math.log2(teams.length));
      const roundDivs = [];

      for (let round = 0; round < roundsCount; round++) {
        const roundDiv = document.createElement('div');
        roundDiv.classList.add('round');
        const roundTitle = document.createElement('h4');
        roundTitle.innerText = `Round ${round + 1}`;
        roundDiv.appendChild(roundTitle);

        const nextMatches = [];
        currentMatches.forEach((match, i) => {
          if (i % 2 === 0) {
            const team1 = match[0] || 'TBD';
            const team2 = (i + 1 < currentMatches.length) ? currentMatches[i + 1][0] : 'BYE';

            const matchDiv = document.createElement('div');
            matchDiv.classList.add('match');
            matchDiv.innerHTML = `
              <span class="team">${team1}</span>
              <span class="vs">vs</span>
              <span class="team">${team2}</span>
              <span class="winner">${results[`${team1}-${team2}`] || ''}</span>
            `;
            roundDiv.appendChild(matchDiv);

            const winner = results[`${team1}-${team2}`] || 'TBD';
            nextMatches.push([winner]);
          }
        });

        roundDivs.push(roundDiv);
        panel.appendChild(roundDiv);
        currentMatches = nextMatches;
      }

      for (let r = 0; r < roundDivs.length - 1; r++) {
        const thisRound = roundDivs[r].querySelectorAll('.match');
        const nextRound = roundDivs[r + 1].querySelectorAll('.match');

        for (let i = 0; i < nextRound.length; i++) {
          const topMatch = thisRound[i * 2];
          const bottomMatch = thisRound[i * 2 + 1];
          const nextMatch = nextRound[i];

          if (!topMatch) continue;
          const hLine = document.createElement('div');
          hLine.classList.add('connector-line');
          hLine.style.height = '2px';
          hLine.style.width = '40px';
          hLine.style.top = `${topMatch.offsetTop + topMatch.offsetHeight / 2}px`;
          hLine.style.left = `${topMatch.offsetLeft + topMatch.offsetWidth}px`;
          panel.appendChild(hLine);

          const vLine = document.createElement('div');
          vLine.classList.add('connector-line');
          vLine.style.width = '2px';
          const topY = topMatch.offsetTop + topMatch.offsetHeight / 2;
          const bottomY = (bottomMatch) ? bottomMatch.offsetTop + bottomMatch.offsetHeight / 2 : topY;
          vLine.style.height = `${bottomY - topY}px`;
          vLine.style.top = `${topY}px`;
          vLine.style.left = `${nextMatch.offsetLeft - 20}px`;
          panel.appendChild(vLine);
        }
      }

      container.appendChild(panel);
    });

  } catch (err) {
    console.error('Failed to load brackets:', err);
    document.getElementById('bracketContainer').innerText = '⚠ Failed to load brackets';
  }
}

loadBrackets();
