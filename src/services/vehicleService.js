import http from "./httpService";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/services/app/Vehicle/";


export const GetAllVehicles = () => {
    return http.get(apiEndpoint + 'GetVehicles');
}

export const GetVehicleDetails = () => {
    return http.get(apiEndpoint + 'GetVehicleDetails');
}

export const GetMyVehicles = () => {
    return http.get(apiEndpoint + 'GetMyVehicles');
}

export const GetMyAndAssignVehicles = () => {
    return http.get(apiEndpoint + 'GetMyAndAssignVehicles');
}

export const GetVehicles = (userId) => {
    return http.get(apiEndpoint + 'GetVehicles' + `?UserId=${userId}`);
}

export const GetVehicleGpsLocationHistory = (data) => {
    //console.log(data);
    return http.post(apiEndpoint + 'GetVehicleGpsLocationHistory', data);
}

export const GetLastLocation = (vehicleId) => {
    return http.get(apiEndpoint + 'GetLastLocation' + `?Id=${vehicleId}`);
}


export const CreateVehicle = (data) => {
    return http.post(apiEndpoint + 'Create', data);
}

export const CreateByAdmin = (data) => {
    return http.post(apiEndpoint + 'CreateByAdmin', data);
}

export const UpdateVehicle = (data) => {
    return http.put(apiEndpoint + 'Update', data);
}

export const DeleteVehicle = (vehicleId) => {
    //console.log(vehicleId)
    return http.delete(apiEndpoint + 'Delete' + `?Id=${vehicleId}`);
}

export const EnableVehicleTurnOnAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleTurnOnAlarm', vehicleId);
}

export const DisableVehicleTurnOnAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleTurnOnAlarm', vehicleId);
}

export const EnableVehicleDoorAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleDoorAlarm', vehicleId);
}

export const DisableVehicleDoorAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleDoorAlarm', vehicleId);
}

export const EnableVehicleShockAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleShockAlarm', vehicleId);
}

export const DisableVehicleShockAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleShockAlarm', vehicleId);
}

export const EnableVehicleOverSpeed = (data) => {
    return http.put(apiEndpoint + 'EnableVehicleOverSpeed', data);
}

export const DisableVehicleOverSpeed = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleOverSpeed', vehicleId);
}

export const EnableVehicleOverDistanceAlarm = (data) => {
    return http.put(apiEndpoint + 'EnableVehicleOverDistanceAlarm', data);
}

export const DisableVehicleOverDistanceAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleOverDistanceAlarm', vehicleId);
}

export const EnableVehicleBatteryCutOffAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleBatteryCutOffAlarm', vehicleId);
}

export const DisableVehicleBatteryCutOffAlarm = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicleBatteryCutOffAlarm', vehicleId);
}

export const StopVehicle = (vehicleId) => {
    return http.put(apiEndpoint + 'StopVehicle', vehicleId);
}

export const ResumeVehicle = (vehicleId) => {
    return http.put(apiEndpoint + 'ResumeVehicle', vehicleId);
}

export const EnableVehicleMonitorMode = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleMonitorMode', vehicleId);
}

export const EnableVehicleTrackerMode = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicleTrackerMode', vehicleId);
}

export const EnableVehicle = (vehicleId) => {
    return http.put(apiEndpoint + 'EnableVehicle', vehicleId);
}

export const DisableVehicle = (vehicleId) => {
    return http.put(apiEndpoint + 'DisableVehicle', vehicleId);
}

export const GetCompanyType = () => {
    return http.get(apiEndpoint + 'GetCompanyType');
}

export const GetVehicleAssignUser = (vehicleId) => {
    //console.log(vehicleId)
    return http.get(apiEndpoint + 'GetVehicleAssignUser' + `?Id=${encodeURIComponent(vehicleId)}`);
}

export const GetVehicleModelReport = () => {
    return http.get(apiEndpoint + 'GetVehicleModelReport');
}

export const SwitchOnVehicle = (data) => {
    return http.post(apiEndpoint + 'SwitchOnVehicle', data);
}

export const SwitchOffVehicle = (data) => {
    return http.post(apiEndpoint + 'SwitchOffVehicle', data);
}

export const EnableVehicleAccAlarm = (vehicleId) => {
    return http.post(apiEndpoint + 'EnableVehicleAccAlarm', vehicleId);
}

export const DisableVehicleAccAlarm = (vehicleId) => {
    return http.post(apiEndpoint + 'DisableVehicleAccAlarm', vehicleId);
}


