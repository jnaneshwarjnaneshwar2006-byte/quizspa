/**
 * Leaderboard & Results Export JavaScript Module
 * fahh Live Quiz Application
 */

document.addEventListener('DOMContentLoaded', () => {
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      exportResultsToCsv();
    });
  }

  function exportResultsToCsv() {
    const table = document.querySelector('.data-table');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
      let row = [], cols = rows[i].querySelectorAll('td, th');

      for (let j = 0; j < cols.length; j++) {
        // Clean text from badges or buttons
        let text = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, ' ').replace(/"/g, '""').trim();
        row.push('"' + text + '"');
      }

      csv.push(row.join(','));
    }

    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = `quizspark_results_${Date.now()}.csv`;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    downloadLink.remove();
  }
});
