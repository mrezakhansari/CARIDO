import * as moment from 'jalali-moment'
export const SetValueLabel = (collection, value, label) => {
    return collection.map(m => {
        return {
            label: m[label],
            value: m[value]
        }
    })
}

export const FormatNumber = (number) => {
    return number ? number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : number;
}

export const ToPersianDate = (date) => {
   // return  moment.from(date,'en','YYYY/MM/DD hh:mm:ss').locale('fa').format('YYYY/MM/DD hh:mm:ss')
   return moment(date, 'YYYY-M-D HH:mm:ss').endOf('s').format('jYYYY/jM/jD HH:mm:ss')
}