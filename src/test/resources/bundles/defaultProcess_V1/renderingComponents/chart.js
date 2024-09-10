(function () {
    return {
        handlebarsTemplate: /*html*/ `
                <div class="opfab-border-box" style="width:100%; display:inline-block">
                    <span class="opfab-tooltip"><b>Info on quality degradation of the main server </b>
                        <span class="opfab-tooltip-content">After reading the message, please acknowledge the card.</span>
                 </span>
                    <ul>
                    {{#each card.data.indications }}
                        <li><div title={{keepSpacesAndEndOfLine (json this.tooltip)}}><b>{{this.titre}}</b></div>{{this.information}}</li>
                    {{/each}}
                    </ul>
                </div>

                <br/>
                <br/>
                <hr/>
                <br/>
                <div class="opfab-border-box" style="width:100%; display:inline-block;">
                <label>  Historical evolution of the quality of network snapshot</label>
                
                <div style="position: relative; height:35vh; width:100%;margin:auto">
                    <canvas id="myChart"></canvas>
                </div>

                </div>
                </div>

                <br/>
                <hr/>

                <div class="opfab-border-box" style="width:100%; display:inline-block;">
                <label> History of the number of non-standard deviations</label>
                
                <div style="position: relative; height:35vh; width:100%;margin:auto">
                    <canvas id="myChartEcartsHN" style="display:block;"></canvas>
                </div>
                </div>

                <!-- test for calling business application from a card -->
                <br/>
                <br/>

                <a href="javascript:opfab.navigate.redirectToBusinessMenu('uid_test_0','?search=chart&fulltext=1')"> Want more information about charts ? </a>

        `,
        init: function (document,card) {
            const cardTemplate = {
                initChart: function() {
                    const opfabColor = getComputedStyle(document.getElementById("myChart")).getPropertyValue('--opfab-text-color');
        
        
                    if (this.myChart instanceof Chart) {
                        this.myChart.destroy();
                    }
                    if (this.myChartEcartsHN instanceof Chart) {
                        this.myChartEcartsHN.destroy();
                    }
        
        
                    const chartContext = document.getElementById('myChart').getContext('2d');
                    this.myChart = new Chart(chartContext, {
                        type: 'line',
                        data: {
                            datasets: [{
                                label: 'Quality Main Server',
                                data : card.data.quality,
                                fill : false,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                tension: 0.4,
                                parsing: {
                                xAxisKey: 'hour',
                                yAxisKey: 'Qualite_P'
                                }
                            },
                            {
                                label: 'Quality Secondary Server',
                                data : card.data.quality,
                                fill : false,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 0, 1)',
                                tension: 0.1,
                                parsing: {
                                xAxisKey: 'hour',
                                yAxisKey: 'Qualite_R'
                                }
                            }]
                        },
                        options: {
                            maintainAspectRatio: false,
                            stepped: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: card.data.quality_chart_title
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {color:'rgba(100,100,100,0.2)'},
                                    ticks: {
                                        color: opfabColor
                                    }
                                },
                                x: {
                                    grid: {color:'rgba(100,100,100,0.2)'},
                                    ticks: {
                                        color: opfabColor
                                    }
                                }
                            }
                        }
                    });
        
        
                    const chartHNContext = document.getElementById('myChartEcartsHN').getContext('2d');
                    this.myChartEcartsHN = new Chart(chartHNContext, {
                        type: 'line',
                        data: {
                            datasets: [{
                                label: 'Quality threshold 7',
                                data : card.data.ecartsHN,
                                fill : false,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(195, 14, 5, 0.8)',
                                tension: 0.4,
                                parsing: {
                                xAxisKey: 'hour',
                                yAxisKey: 'Seuil_P'
                                }
                            },
                            {
                                label: 'Non-standard deviations - Main Server',
                                data : card.data.ecartsHN,
                                fill : false,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 235, 1)',
                                tension: 0.1,
                                parsing: {
                                xAxisKey: 'hour',
                                yAxisKey: 'Nb_HN_P'
                                }
                            },
                            {
                                label: 'Non-standard deviations - Secondary Server',
                                data : card.data.ecartsHN,
                                fill : false,
                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                borderColor: 'rgba(54, 162, 0, 1)',
                                tension: 0.1,
                                parsing: {
                                xAxisKey: 'hour',
                                yAxisKey: 'Nb_HN_R'
                                }
                            }]
                        },
                        options: {
                            maintainAspectRatio: false,
                            stepped: true,
                            plugins: {
                                title: {
                                    display: true,
                                    text: "History of non-standard deviations "
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    grid: {color:'rgba(100,100,100,0.2)'},
                                    ticks: {
                                        color: opfabColor
                                    }
                                },
                                x: {
                                    grid: {color:'rgba(100,100,100,0.2)'},
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
        
            opfab.currentCard.listenToStyleChange(() => {
                cardTemplate.initChart()
            });
        }
    };
})();
