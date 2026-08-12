(() => {
  const root = document.getElementById('lessonContent');
  if (!root) return;

  const visualLength = value => Array.from((value || '').trim()).reduce((sum, ch) => {
    if (/\s/.test(ch)) return sum + 0.35;
    return sum + (/[^\x00-\x7F]/.test(ch) ? 1.45 : 1);
  }, 0);

  const median = values => {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const profileColumn = values => {
    if (!values.length) return { score: 1, max: 1, avg: 1, median: 1 };
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    const med = median(values);
    const max = Math.max(...values);
    return {
      avg,
      median: med,
      max,
      score: Math.max(1, med * 0.55 + avg * 0.30 + Math.min(max, 48) * 0.15)
    };
  };

  const distributeWidths = profiles => {
    const count = profiles.length;
    if (!count) return [];

    const minByCount = { 2: 27, 3: 17, 4: 14, 5: 11 };
    const maxByCount = { 2: 73, 3: 50, 4: 42, 5: 34 };
    const minWidth = minByCount[count] || 10;
    const maxWidth = maxByCount[count] || 38;

    let weights = profiles.map(profile => Math.pow(profile.score, 0.72));

    if (count >= 3) {
      const restAvg = profiles.slice(1).reduce((sum, profile) => sum + profile.score, 0) / (count - 1);
      if (profiles[0].score < restAvg * 0.62) weights[0] *= 0.58;
      else if (profiles[0].score < restAvg * 0.78) weights[0] *= 0.76;
    }

    profiles.forEach((profile, index) => {
      if (profile.max <= 14 && count >= 3) weights[index] *= 0.72;
    });

    const normalize = values => {
      const total = values.reduce((sum, value) => sum + value, 0) || 1;
      return values.map(value => value / total * 100);
    };

    let widths = normalize(weights);
    for (let pass = 0; pass < 3; pass += 1) {
      widths = widths.map(value => Math.max(minWidth, Math.min(maxWidth, value)));
      widths = normalize(widths);
    }
    return widths;
  };

  const fitTableColumns = table => {
    if (table.dataset.widthFitted === 'true') return;

    const rows = [...table.rows];
    if (!rows.length) return;

    const columnCount = rows.reduce((max, row) => Math.max(max, row.cells.length), 0);
    if (!columnCount) return;

    const columnValues = Array.from({ length: columnCount }, () => []);
    rows.slice(rows.length > 1 ? 1 : 0).forEach(row => {
      [...row.cells].forEach((cell, index) => {
        columnValues[index].push(visualLength(cell.textContent));
      });
    });

    if (rows[0]) {
      [...rows[0].cells].forEach((cell, index) => {
        if (!columnValues[index].length) columnValues[index].push(visualLength(cell.textContent));
      });
    }

    const profiles = columnValues.map(profileColumn);
    const widths = distributeWidths(profiles);

    let colgroup = table.querySelector(':scope > colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      table.prepend(colgroup);
    }
    colgroup.innerHTML = '';

    widths.forEach(width => {
      const col = document.createElement('col');
      col.style.width = `${width.toFixed(1)}%`;
      colgroup.appendChild(col);
    });

    table.removeAttribute('width');
    table.style.width = '100%';
    table.style.maxWidth = '100%';
    table.style.minWidth = '0';
    table.style.tableLayout = 'fixed';

    table.querySelectorAll('th, td').forEach(cell => {
      cell.style.width = '';
      cell.style.minWidth = '0';
      cell.style.wordBreak = 'keep-all';
      cell.style.overflowWrap = 'break-word';
    });

    table.dataset.widthFitted = 'true';
  };

  const applyLayout = () => {
    const periods = [...root.querySelectorAll('.lesson-period')];
    periods.forEach((section, index) => {
      section.dataset.majorSection = String(index + 1);
    });
    root.querySelectorAll('table').forEach(fitTableColumns);
  };

  const contentReady = () => root.querySelector('.lesson-period, table, .load-error');

  if (contentReady()) {
    applyLayout();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!contentReady()) return;
    observer.disconnect();
    applyLayout();
  });

  observer.observe(root, { childList: true, subtree: true });
})();