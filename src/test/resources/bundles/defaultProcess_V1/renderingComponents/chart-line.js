(function () {
    return {
        handlebarsTemplate: /*html*/ `
            <h4 style="text-align:center" id="title">
                Daily electrical consumption forecast
            </h4>
            <div style="position: relative; height:80%; width:65%;margin:auto">
                <canvas id="myChart"></canvas>
            </div>
        `,
        init: function (document,card) {
            const cardTemplate = {
                initChart: function() {
                    const ctx = document.getElementById('myChart').getContext('2d');
                    const opfabColor = getComputedStyle(document.getElementById('myChart')).getPropertyValue('--opfab-text-color');
        
                    if (this.myChart instanceof Chart) {
                        this.myChart.destroy();
                    }
                    const day = new Date(card.startDate);
                    const dateLabels = [];
        
                    for (let i = 0; i < 6; i++) {
                        const labelDate = new Date(day.getTime());
                        labelDate.setHours(4 * i);
                        labelDate.setMinutes(0);
                        labelDate.setSeconds(0);
                        dateLabels.push(labelDate);
                    }
                    const nextDay = new Date(day.getTime());
                    nextDay.setDate(day.getDate() + 1)
                    nextDay.setHours(0);
                    nextDay.setMinutes(0);
                    nextDay.setSeconds(0);
                    dateLabels.push(nextDay);
        
                    this.myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: dateLabels,
                            datasets: [{
                                label: 'Daily Electrical consumption',
                                data: card.data.values,
                            fill: false,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            tension: 0.4
                            }]
                        },
                        options: {
                            maintainAspectRatio: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {color: 'rgba(100,100,100,0.2)'},
                                    ticks: {
                                        color: opfabColor
                                    }
                                },
                                x: {
                                    type: 'time',
                                    time: {stepSize: 4},
                                    grid: {color: 'rgba(100,100,100,0.2)'},
                                    ticks: {
                                        color: opfabColor
                                    }
                                }
                            }
                        }
                    });
                }
            }
            cardTemplate.initChart();
        
            opfab.currentCard.listenToStyleChange( ()  => {
                cardTemplate.initChart();
            });
        }
    };
})();
