import "./App.css";
import { useEffect, useState } from "react";
import Papa from "papaparse";
import { CSVLink, CSVDownload } from "react-csv";

function App() {
  // State to store parsed data
  const [parsedData, setParsedData] = useState([]);

  //State to store table Column name
  const [tableRows, setTableRows] = useState([]);

  //State to store the values
  const [values, setValues] = useState([]);

  // State to store the data to display on table
  const [data, setData] = useState([]);

  const [keyword, setKeyword] = useState('');

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [searchCount, setSearchCount] = useState(10)

  const changeHandler = (event) => {
    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(event.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const rowsArray = [];
        const valuesArray = [];

        // Iterating data to get column name and their values
        results.data.map((d) => {
          rowsArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        localStorage.setItem('result', JSON.stringify(values));

        // // Parsed Data Response in array format
        setParsedData(results.data);

        // Filtered Column Names
        setTableRows(rowsArray[0]);

        // Filtered Values
        setValues(valuesArray);

        setData(valuesArray)
      },
    });
  };

  const revert = () => {
    let storeData = [];
    let temp = localStorage.getItem('result');
    if (temp) {
      storeData = JSON.parse(temp);
    }

    setValues(storeData)
  }

  useEffect(() => {
      let filteredValue = [];

      filteredValue = values.filter(value => ((value.indexOf(keyword) > -1) || !keyword))

      
      setData(filteredValue)
      setParsedData(filteredValue)
  }, [keyword])

  const searchNear = () => {
    var searchResult = [];

    var radlat1 = Math.PI * latitude/180

    searchResult = values.map(value => {
      var lat2 = value[1]
      var lon2 = value[2]

      var radlat2 = Math.PI * lat2/180
      var theta = longitude-lon2
      var radtheta = Math.PI * theta/180
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist)
      dist = dist * 180/Math.PI
      dist = dist * 60 * 1.1515

      dist = dist * 1.609344

      return {...value, dist: dist}
    })


    const compare = ( a, b ) => {
      if ( a.dist < b.dist ) {
        return -1;
      }
      if ( a.dist > b.dist ) {
        return 1;
      }
      return 0;
    }
    
    searchResult.sort( compare );

    var result = searchResult.slice(0, searchCount)
    setData(result.map(item => {delete item.dist; return Object.values(item)}))
    setParsedData(result.map(item => Object.values(item)))
  }

  return (
    <div>
      {/* File Uploader */}
      <input
        type="file"
        name="file"
        className="form-control w-50"
        onChange={changeHandler}
        accept=".csv"
        style={{ display: "block", margin: "10px auto" }}
      />
      <br />
      <br />
      {/* search bar */}

      <input type="text" className="form form-control" placeholder="Enter search keyword here." value={keyword} onChange={(e) => setKeyword(e.target.value)} style={{ marginBottom: 10, marginRight: 10, width: 400, float: "right" }}></input>
      <button type="button" className="btn btn-primary" onClick={() => revert()} style={{ float: "right", marginRight: 10 }}>Revert</button>
      <CSVLink data={parsedData} style={{ float: "right", marginRight: 20, marginTop: 10 }}>Download me</CSVLink>

      <input type="text" className="form form-control" placeholder="latitude" value={latitude} onChange={e => setLatitude(e.target.value)} style={{ marginLeft: 10, marginBottom: 10, marginRight: 10, width: 100, float: "left" }}/>
      <input type="text" className="form form-control" placeholder="longitude" value={longitude} onChange={e => setLongitude(e.target.value)} style={{ marginBottom: 10, marginRight: 10, width: 100, float: "left" }}/>
      <select name="" id="" className="form form-control" style={{ marginBottom: 10, marginRight: 10, width: 100, float: "left" }} value={searchCount} onChange={e => setSearchCount(e.target.value)}>
        <option value={10} key='10'>10</option>
        <option value={20} key='20'>20</option>
        <option value={100} key='100'>100</option>
      </select>
      <button type="button" className="btn btn-danger" onClick={() => searchNear()} style={{ float: "left", marginRight: 10 }}>Search Near</button>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>{"STORE_ID"}</th>
            <th>{"LATITUDE"}</th>
            <th>{"LONGITUDE"}</th>
            <th>{"DAYS_OPEN"}</th>
            <th>{"ITEM_AVAILABILITY"}</th>
            <th>{"ZONE"}</th>
            <th>{"BOOKMARK"}</th>
          </tr>
        </thead>
        <tbody>
          {
            data.length ?
              data.map((value, index) => {
                return (<tr key={index} title={"LATITUDE : " + value[1] + ", LONGITUDE : " + value[2]}>
                  {value.map((val, i) => {
                    return <td key={i}>{val}</td>;
                  })}
                  <td>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked" />
                    </div>
                  </td>
                </tr>)
              }) : (<tr>
                <td colSpan={7} className="text-center">No Data</td>
              </tr>)
          }
        </tbody>
      </table>
    </div>
  );
}

export default App;