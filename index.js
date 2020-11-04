const request = require('request');

const getToken = (url) => {
    return new Promise( (resolve, reject) => {
        request(url, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                resolve(JSON.parse(body).token);
            } else {
                reject(error);
            }
        });
    });
  }

const getUserVisitData = (page, token) => {
    return new Promise( (resolve, reject) => {
        request(`https://motorway-challenge-api.herokuapp.com/api/visits?page=${page}&token=${token}`, (error, res, body) => {
            if (!error && res.statusCode == 200) {
                resolve(JSON.parse(body));
            } else {
                reject(error);
            }
        })
    })
}

const getAllDataToBeProcessed = (promises, dataToBeProcessed) => {
    return new Promise ((resolve, reject) => {
        Promise.all(promises).then((response) => {
            if(!response) {
                reject("Failed");
            }
            response.forEach((pageData) => {
                dataToBeProcessed = [...dataToBeProcessed, ...pageData.data]
            });
            resolve(dataToBeProcessed);
        })
        .catch((err) => {
            console.log("err", err);
        })
    })
}
  
const main = async () => {
    let token = await getToken("https://motorway-challenge-api.herokuapp.com/api/login");
    console.log(token);
    const visitData = await getUserVisitData("1", token);
    const noOfPages = visitData.total / visitData.data.length;
    let dataToBeProcessed = visitData.data;
    if(noOfPages > 1) {
        const promises = [];
        for(let page = 2; page <= noOfPages; page++) {
            promises.push(getUserVisitData(page, token))
        }
        dataToBeProcessed = await getAllDataToBeProcessed(promises, dataToBeProcessed);
    }
    let dataMap = new Map();
    dataToBeProcessed.forEach((data) => {
        if( (Date.parse(data.date) <= (new Date()).getTime()) && data.date.split("T")[0] != (new Date()).toISOString().split("T")[0]) {
            dataMap.has(data.name) ? dataMap.set(data.name, dataMap.get(data.name)+1) : dataMap.set(data.name, 1); 
        }

    });
    console.log("User with no of visits", dataMap);
    console.log("Total no of visits", dataToBeProcessed.length)
}
main();