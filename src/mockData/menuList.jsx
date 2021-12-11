import React from "react";
import { Home, Monitor, LogOut, DollarSign, MapPin, Calendar } from "react-feather";
import urls from '../urls.json';

const MenuList = [
    {
        name: "پروفایل شما", key: "userProfile", url: urls.UserProfile, icon: () => <Home size={18} />, child: []
    },
    {
        name: "ردیابی", key: "mapTracking", url: urls.MapTracking, icon: () => <MapPin size={18} />, child: []
    },
    {
        name: "امور مالی", key: "finance", url: urls.Finance, icon: () => <DollarSign size={18} />, child: []
    },
    {
        name: "پنل ادمین",
        key: "ADMIN",
        icon: () => <Monitor size={18} />,
        child: [
          //  { name: "مدیریت کاربران", key: "ADMIN-USERS", url: urls.Admin.Users, child: [] },
            { name: "مدیریت وسیله ها", key: "ADMIN-VEHICLES", url: urls.Admin.Vehicles, child: [] },
            { name: "مدیریت محصولات", key: "ADMIN-PRODUCTS", url: urls.Admin.Products, child: [] },
            { name: "گزارش", key: "ADMIN-REPORT", url: urls.Admin.Report, child: [] }
        ]
    },
    {
        name: "خروج", key: "LOGOUT", url: urls.Auth.Logout, icon: () => <LogOut size={18} />, child: []
    },
];

export default MenuList;