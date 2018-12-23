// exports.getData = (req, res) => {
//     // const id = req.params.id;
//     // res.json(allData[id]);
// }

exports.getAllData = (req, res) => {
    let allData = Object.assign({}, config);
    for (let key in allData.datasetLabels) {
        allData[key] = createDataset();
    }
    res.json(allData);
}

const createDataset = () => {
    let months = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4];
    let days = [1, 7, 13, 19, 25];
    let keys = ['date', 'EDF9', 'MV', 'AV'];
    let range = [
        [],
        // [0.09, 0.15],
        // [12500, 25000],
        // [7.05, 7.95]
        [0.095, 0.145],
        [13000, 24500],
        [7.05, 7.95]
    ];
    let precision = [0, 4, 0, 2];
    let getRandom = (min, max) => Math.random() * (max - min) + min;
    let data = [];
    months.forEach(mth => {
        days.forEach(day => {
            let obj = {};
            keys.forEach((key, i) => {
                if (key === 'date') {
                    let year = mth < 5 ? 2015 : 2014
                    obj[key] = new Date(year, mth -1 , day + 1);
                } else {
                    obj[key] = getRandom(range[i][0], range[i][1]).toFixed(precision[i]);
                }
            })
            data.push(obj);
        })
    })
    return data;
}

const config = {
    y: {
        keys: ['EDF9', 'MV', 'AV'],
        labels: ['1-Yr EDF9', 'Market Value of Assets (EDF9)(M USD)', 'Asset Vloatility (EDF9)'],
        config: [
            { format: '{y}%', style: {color: 'blue'} },
            { format: '{y}', style: {color: 'green'}  },
            { format: '{y}%', placement: 'right', curveType: 'step', style: {color: 'orange'}  }
        ]
    },
    datasetLabels: {
        'datasetOne': 'EDF9 vs Drivers',
        'datasetTwo': 'EDF9 vs Tax',
    },
}