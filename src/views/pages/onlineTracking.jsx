import config from '../../config.json';
import { Button, Input, notification } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import * as vehicleService from '../../services/vehicleService';
import _ from 'lodash';

const OnlineTrackingPage = () => {


  // const [seconds, setSeconds] = useState(0);
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     setSeconds(seconds => seconds + 1);
  //   }, 1000);
  //   return () => clearTimeout(timeout);
  // }, [seconds]);

  function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

  const [counter, setCounter] = useState(0);
  // if counter is changed, than fn will be updated with new counter value
  const fn = useCallback(() => {
    setTimeout(async () => {
      var DateTo = new Date();
      var DateFrom = new Date(DateTo - 1000 * 60);

      console.log(DateTo.toISOString(), DateFrom.toISOString());
      try {

        await timeout(3000);
        // const data = await vehicleService.GetVehicleGpsLocationHistory({ from: DateFrom.toISOString(), to: DateTo.toISOString(), vehicleId: 18 });
        // let { result, success } = data;
        // if (success) {
        //   const tempList = result.map(c => {
        //     return ([c.lat, c.lon]);
        //   });
        //   //console.log(result);
        //   if (tempList.length > 1) {
        //     const temp = _(tempList).head();
        //     // //console.log(temp);
        //     //center = temp;
        //   }
        //   //this.setState({ trackingList: tempList, trackingListInfo: result })
        // }
        // console.log(data)

      } catch (error) {

      }

      setCounter(previousCount => previousCount + 1);

  }, 1000);
});


useEffect(() => {
  fn();
}, [fn]);

return (
  <div className="App">
    <header className="App-header">
      {counter} seconds have elapsed since mounting.
      </header>
  </div>
);
};

export default OnlineTrackingPage;