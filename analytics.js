// Analytics Dashboard Module
class AnalyticsDashboard {
  constructor() {
    this.chart = null;
    this.successRateChart = null;
  }

  // Aggregate data from localStorage
  getAnalyticsData() {
    const historico = JSON.parse(localStorage.getItem('historicoRecomendacoes') || '[]');
    const locais = {};
    const criterios = {};
    const feedbacks = { sim: 0, nao: 0, nenhum: 0 };
    const successRates = {};

    historico.forEach(item => {
      // Count locations
      locais[item.local] = (locais[item.local] || 0) + 1;

      // Count criteria combinations
      const criterioKey = item.criterios.join(' + ');
      criterios[criterioKey] = (criterios[criterioKey] || 0) + 1;

      // Count feedbacks
      const feedback = item.feedback ? item.feedback.toLowerCase() : 'nenhum';
      feedbacks[feedback]++;

      // Calculate success rates per location
      if (!successRates[item.local]) {
        successRates[item.local] = { total: 0, positive: 0 };
      }
      successRates[item.local].total++;
      if (feedback === 'sim') {
        successRates[item.local].positive++;
      }
    });

    return { locais, criterios, feedbacks, successRates };
  }

  // Render analytics dashboard
  renderDashboard() {
    const data = this.getAnalyticsData();
    const container = document.getElementById('analyticsContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h5>Recomendações por Local</h5>
          <canvas id="locationsChart"></canvas>
        </div>
        <div class="col-md-6">
          <h5>Taxas de Sucesso por Local</h5>
          <canvas id="successRateChart"></canvas>
        </div>
      </div>
      <div class="row mt-4">
        <div class="col-md-6">
          <h5>Combinações de Critérios Mais Comuns</h5>
          <canvas id="criteriaChart"></canvas>
        </div>
        <div class="col-md-6">
          <h5>Distribuição de Feedback</h5>
          <canvas id="feedbackChart"></canvas>
        </div>
      </div>
    `;

    this.renderLocationsChart(data.locais);
    this.renderSuccessRateChart(data.successRates);
    this.renderCriteriaChart(data.criterios);
    this.renderFeedbackChart(data.feedbacks);
  }

  renderLocationsChart(locais) {
    const ctx = document.getElementById('locationsChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(locais),
        datasets: [{
          label: 'Número de Recomendações',
          data: Object.values(locais),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderSuccessRateChart(successRates) {
    const ctx = document.getElementById('successRateChart').getContext('2d');
    const labels = Object.keys(successRates);
    const rates = labels.map(local => (successRates[local].positive / successRates[local].total) * 100);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          label: 'Taxa de Sucesso (%)',
          data: rates,
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  renderCriteriaChart(criterios) {
    const ctx = document.getElementById('criteriaChart').getContext('2d');
    const topCriteria = Object.entries(criterios)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: topCriteria.map(([key]) => key),
        datasets: [{
          label: 'Frequência',
          data: topCriteria.map(([,value]) => value),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true
          }
        }
      }
    });
  }

  renderFeedbackChart(feedbacks) {
    const ctx = document.getElementById('feedbackChart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Positivo', 'Negativo', 'Nenhum'],
        datasets: [{
          label: 'Feedback',
          data: [feedbacks.sim, feedbacks.nao, feedbacks.nenhum],
          backgroundColor: [
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 205, 86, 0.5)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 205, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true
      }
    });
  }
}

// Initialize analytics when page loads
document.addEventListener('DOMContentLoaded', function() {
  const analytics = new AnalyticsDashboard();
  // Expose for global access
  window.analyticsDashboard = analytics;
  // Render dashboard if container exists
  if (document.getElementById('analyticsContainer')) {
    analytics.renderDashboard();
  }
});
