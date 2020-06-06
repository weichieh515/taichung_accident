const center = { lat: 24.188996, lng: 120.747022 };
var map;
var opened_infowindow
var latlng_data = [];
var accidents = null;
var markers = [];
var marker_toggle = true;
var heatmap;
var heatmap_data = [];
var geoJSON;
var district_value = []

function map_loaded_handler () {

    $.get('/accidents', accidents => { 
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: center
        });

        geoJSON = new google.maps.Data();
        geoJSON.loadGeoJson('tw.json');

        accidents.forEach(acc => {
            marker = new google.maps.Marker({
                position: { lat: Number(acc.lat), lng: Number(acc.lng) },
                map,
            });

            const index = district_value.findIndex(d => d.name === acc.district)
            if (index !== -1) district_value[index].value++
            else district_value.push({
                name: acc.district,
                value: 1
            })

            var death = Number(acc.result.split(';')[0].slice(-1))
            var injury = Number(acc.result.split(';')[1].slice(-1))

            heatmap_data.push({ location: new google.maps.LatLng(Number(acc.lat), Number(acc.lng)) })

            var infowindow = new google.maps.InfoWindow({
                content:
                    `<div>
                    <h1>${acc.type.includes('小客車') ? '🚗' : ''} 
                    ${acc.type.includes('大客車') ? '🚌' : ''}
                    ${acc.type.includes('小貨車') ? '🚚' : ''} 
                    ${acc.type.includes('大貨車') ? '🚛' : ''}
                    ${acc.type.includes('半聯結車') ? '🚛' : ''}
                    ${acc.type.includes('曳引車') ? '🚛' : ''}
                    ${acc.type.includes('機車') ? '🛵' : ''}
                    ${acc.type.includes('慢車') ? '🚲' : ''}
                    ${acc.type.includes('行人') ? '🚶' : ''}
                    
                    </h1>
                    <h5>${acc.type}</h5>
                    <h2>☠️: ${death} ♿: ${injury}</h2 >
                    <h3>⌚: ${acc.datetime} </h3>
                    <h3>📍: ${acc.address} </h3>
                </div > `
            });


            marker.addListener('click', () => {
                if (opened_infowindow) opened_infowindow.close()
                infowindow.open(map, marker);
                opened_infowindow = infowindow
            });

            markers.push(marker)

            map.addListener('click', () => {
                if (opened_infowindow) opened_infowindow.close()
            })
        });

        heatmap = new google.maps.visualization.HeatmapLayer({
            data: heatmap_data
        });

        heatmap.set('radius', heatmap.get('radius') ? null : 20);
    });

}

function loadGeoChart () {
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.showLoading();
    $.get('/taichung.json', geoJson => {
        myChart.hideLoading();

        echarts.registerMap('Taichung', geoJson);

        option = {
            title: {
                text: '台中車禍行政區統計',
                left: 'right'
            },
            tooltip: {
                trigger: 'item',
                showDelay: 0,
                transitionDuration: 0.2
            },
            visualMap: {
                left: 'right',
                min: 0,
                max: 11,
                inRange: {
                    color: ['lightgreen', 'yellow', '#ff3333']
                },
                calculable: true
            },
            toolbox: {
                show: true,
                left: 'left',
                top: 'top',
                feature: {
                    saveAsImage: {}
                }
            },
            series: [
                {
                    name: '台中車禍行政區統計',
                    type: 'map',
                    map: 'Taichung',
                    emphasis: {
                        label: {
                            show: true
                        }
                    },
                    data: district_value
                }
            ]
        };

        myChart.setOption(option);
    });

}

function heatmapMode () {
    $("#map").show();
    $("#chart").hide();
    heatmap.setMap(map);
    markers.forEach(marker => marker.setMap(null));
}

function markerMode () {
    $("#map").show();
    $("#chart").hide();
    heatmap.setMap(null);
    markers.forEach(marker => marker.setMap(map));
}

function geoJsonMode () {
    $("#map").hide();
    $("#chart").show();
}