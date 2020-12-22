const weeks = {
  '20201222': 1,
  '20201228': 2,
  '20210104': 3,
  '20210111': 4,
  '20210118': 5,
  '20210125': 6,
  '20210201': 7,
  '20210208': 8,
  '20210215': 9,
  '20210222': 10,
  '20210301': 11,
  '20210315': 12,
  '20210322': 13,
  '20210329': 14,
  '20210405': 15,
  '20210412': 16,
};

// todo
const defaultCurrentWeek = 1;

// api uses slightly different name conventions than ESPN
const teamCodeTranslation = {
  'GS': 'GSW',
  'NY': 'NYK',
  'WSH': 'WAS',
  'UTAH': 'UTA',
  'SA': 'SAS',
  'NO': 'NOP',
  // todo there are probably more, this is just what i have on my team
};

// shoutout https://github.com/jasonroman/nba-api. really nice project.
fetch('http://data.nba.net/prod/v1/2020/schedule.json')
  .then(response => response.json())
  .then(data => processSchedule(data))
  .catch(e => console.log(e));

processSchedule = (data) => {
  actualGames = data.league.standard.filter(i => i.seasonStageId === 2);

  let byWeek = {};
  Object.keys(weeks).forEach(w => {
    byWeek[weeks[w]] = {};
  });

  actualGames.forEach(g => {
    let re = /(\d{8})\/([A-Z]{3})([A-Z]{3})/;
    let [ full, date, homeCode, awayCode ] = g.gameUrlCode.match(re);
    let correctWeek;
    for (let w of Object.keys(weeks)) {
      if (w > date) {
        // we've gone one too far
        correctWeek = weeks[w] - 1;
        break;
      }
    }

    for (code of [homeCode, awayCode]) {
      if (!(code in byWeek[correctWeek])) {
        byWeek[correctWeek][code] = 0;
      }
      byWeek[correctWeek][code] += 1;
    }
  });

  dealWithData = () => {
    let currentWeek;
    try {
      currentWeek = parseInt(document.querySelector('.custom--week.is-current').querySelector('.week').textContent.match(/NBA Week (\d+)/)[1]);
    } catch(e) {
      currentWeek = defaultCurrentWeek;
    }

    // clear anything we've made so far
    // see: https://stackoverflow.com/a/57547187
    document.querySelectorAll('.numGames').forEach(e => e.remove());
    document.querySelectorAll('.avgForWeek').forEach(e => e.remove());

    // we need to keep track of order so we can apply to points, which is in separate table, but ordered the same
    numGamesByRow = [];

    document.querySelectorAll('.player-column-table2').forEach(a => {
      team = a.querySelector('.playerinfo__playerteam').textContent;
      correctedTeam = team.toUpperCase();
      if (correctedTeam in teamCodeTranslation) {
        correctedTeam = teamCodeTranslation[correctedTeam];
      }
      let numGames = byWeek[currentWeek][correctedTeam];

      div = document.createElement('div');
      div.classList.add('numGames');
      div.textContent = `# games: ${numGames}`;
      a.appendChild(div);

      numGamesByRow.push(numGames);
    });

    // annoying, but we need to keep track of how many empty rows there are so we can match up to left side appropriately.
    let numSkipped = 0;
    document.querySelectorAll('.table--cell.avg:not(.header)').forEach((a, i) => {
      let avg = a.querySelector('span').textContent;
      if (avg === '--') {
        numSkipped += 1;
        return;
      }
      avg = parseFloat(avg);
      avgForWeek = (avg * numGamesByRow[i - numSkipped]).toFixed(1);
      span = document.createElement('span');
      span.classList.add('avgForWeek');
      span.textContent = `(${avgForWeek})`;
      a.appendChild(span);
    });
  }

  window.addEventListener('load', dealWithData);
  window.addEventListener('click', dealWithData);
}


console.log('extension ran');

