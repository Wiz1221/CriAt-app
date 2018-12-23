import axios from 'axios';

const storeData = (data) => {
    return {
        type: 'STORE_DATA',
        data
    }
}

// called when app is first loaded
export const getData = () => {
    return (dispatch) => {
        axios.get('/api/data').then((response) => {
            dispatch(storeData(response.data))
        })
        // .catch( (error) =>{
        //   console.error(error)
        // })
    }
}

export const changeDataset = (datasetId) => {
    return {
        type: 'CHANGE_DATASET',
        datasetId
    }
}
