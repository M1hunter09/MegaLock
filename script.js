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
    if (!res.ok) throw new Error('Failed to fetch brackets.json');
    const data = await res.json();

    const container = document.getElementById('bracketContainer');
    container.innerHTML = '';

    data.brackets.forEach((bracket, bracketIndex) => {
      const panel = document.createElement('div');
      panel.className = 'bracket-panel';

      // title
      const title = document.createElement('div');
      title.className = 'bracket-title';
      title.textContent = bracket.name || `Bracket ${bracketIndex + 1}`;
      panel.appendChild(title);

      // prepare teams and results
      const teamsOrig = Array.isArray(bracket.teams) ? bracket.teams.slice() : [];
      const results = bracket.results || {};
      const totalTeams = Math.max(2, teamsOrig.length);
      const size = Math.pow(2, Math.ceil(Math.log2(totalTeams)));
      const teams = teamsOrig.slice(0);
      while (teams.length < size) teams.push('BYE');

      const roundsCount = Math.log2(size);
      const matchesByRound = [];

      // Build rounds structure teams -> matches
      let currentTeams = teams.map(t => ({ name: t }));
      for (let r = 0; r < roundsCount; r++) {
        const matches = [];
        for (let i = 0; i < currentTeams.length; i += 2) {
          const a = currentTeams[i] ? currentTeams[i].name : 'TBD';
          const b = currentTeams[i + 1] ? currentTeams[i + 1].name : 'BYE';

          const key1 = `${a}-${b}`;
          const key2 = `${b}-${a}`;
          const winner = results[key1] || results[key2] || null;

          matches.push({ team1: a, team2: b, winner });
        }

        matchesByRound.push(matches);

        // compute next round teams placeholders
        const nextTeams = matches.map(m => ({
          name:
            m.winner ||
            (m.team1 === 'BYE' ? m.team2 : (m.team2 === 'BYE' ? m.team1 : 'TBD'))
        }));
        currentTeams = nextTeams;
      }

      // Create DOM for rounds
      const roundNodes = [];
      const BASE_VERTICAL_GAP = 12;

      matchesByRound.forEach((matches, rIdx) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        roundDiv.dataset.round = String(rIdx + 1);

        const roundTitle = document.createElement('h4');
        roundTitle.textContent = rIdx === 0 ? 'Round 1' : `Round ${rIdx + 1}`;
        roundDiv.appendChild(roundTitle);

        const roundGap = BASE_VERTICAL_GAP * Math.pow(2, rIdx);
        const createdMatches = [];

        matches.forEach(m => {
          const matchDiv = document.createElement('div');
          matchDiv.className = 'bracket-match';
          if (m.winner) matchDiv.classList.add('has-winner');
          matchDiv.style.margin = `${roundGap}px 0`;

          matchDiv.innerHTML = `
            <span class="team team-a" title="${m.team1}">${m.team1}</span>
            <span class="vs">vs</span>
            <span class="team team-b" title="${m.team2}">${m.team2}</span>
            <span class="winner">${m.winner ? `Winner: ${m.winner}` : ''}</span>
          `;

          roundDiv.appendChild(matchDiv);
          createdMatches.push(matchDiv);
        });

        roundNodes.push(createdMatches);
        panel.appendChild(roundDiv);
      });

      container.appendChild(panel);

      // Connector drawing helpers
      function clearConnectors() {
        panel.querySelectorAll('.bracket-connector').forEach(el => el.remove());
      }
      function addHLine(x, y, width) {
        const el = document.createElement('div');
        el.className = 'bracket-connector hline';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        el.style.width = `${Math.max(0, width)}px`;
        panel.appendChild(el);
        return el;
      }
      function addVLine(x, top, height) {
        const el = document.createElement('div');
        el.className = 'bracket-connector vline';
        el.style.left = `${x}px`;
        el.style.top = `${top}px`;
        el.style.height = `${Math.max(2, height)}px`;
        panel.appendChild(el);
        return el;
      }

      // Main draw function
      function drawConnectors() {
        clearConnectors();

        requestAnimationFrame(() => {
          const panelRect = panel.getBoundingClientRect();
          const MIN_HORIZONTAL_GAP = 8;
          const H_OFFSET = 12;

          for (let r = 0; r < roundNodes.length - 1; r++) {
            const thisRound = roundNodes[r];
            const nextRound = roundNodes[r + 1];

            for (let j = 0; j < nextRound.length; j++) {
              const topMatch = thisRound[j * 2];
              const bottomMatch = thisRound[j * 2 + 1];
              const nextMatch = nextRound[j];

              if (!topMatch || !nextMatch) continue;

              const topRect = topMatch.getBoundingClientRect();
              const botRect = bottomMatch ? bottomMatch.getBoundingClientRect() : topRect;
              const nextRect = nextMatch.getBoundingClientRect();

              const startXTop = topRect.right - panelRect.left;
              const startYTop = topRect.top + topRect.height / 2 - panelRect.top;

              const startXBot = botRect.right - panelRect.left;
              const startYBot = botRect.top + botRect.height / 2 - panelRect.top;

              const endX = nextRect.left - panelRect.left;

              const maxStartX = Math.max(startXTop, startXBot);
              const midX = maxStartX + Math.max(MIN_HORIZONTAL_GAP, (endX - maxStartX) / 2);
              const clampedMidX = Math.min(midX, endX - H_OFFSET);

              if (clampedMidX - startXTop > 2) addHLine(startXTop, startYTop - 1, clampedMidX - startXTop);
              if (clampedMidX - startXBot > 2) addHLine(startXBot, startYBot - 1, clampedMidX - startXBot);

              const vTop = Math.min(startYTop, startYBot);
              const vBottom = Math.max(startYTop, startYBot);
              const vHeight = Math.max(2, vBottom - vTop);
              addVLine(clampedMidX - 1, vTop - 1, vHeight);
            }
          }
        });
      }

      // initial draw
      drawConnectors();

      // redraw on resize and scroll
      window.addEventListener('resize', () => {
        clearTimeout(window.__bracketResizeTimer);
        window.__bracketResizeTimer = setTimeout(drawConnectors, 120);
      });
      panel.addEventListener('scroll', () => requestAnimationFrame(drawConnectors));
    });

  } catch (err) {
    console.error('Failed to load brackets:', err);
    const container = document.getElementById('bracketContainer');
    if (container) container.innerText = 'Failed to load brackets';
  }
}

// Initialize brackets on page load
loadBrackets();
