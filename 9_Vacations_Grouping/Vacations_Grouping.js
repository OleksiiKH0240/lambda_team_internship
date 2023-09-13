import fs from 'fs'

const data = fs.readFileSync("vacations.json");
const vacations = JSON.parse(data);
// console.log(vacations);
const groupedVacations = {};

for (let vacation of vacations) {
    // targetField is userId in our case
    let targetField = vacation.user._id;
    let vacationEl = { startDate: vacation.startDate, endDate: vacation.endDate };
    if (groupedVacations[targetField] == undefined) {
        groupedVacations[targetField] = {
            userId: targetField,
            name: vacation.user.name,
            weekendDates: [vacationEl]
        };
    } else {
        groupedVacations[targetField].weekendDates.push(vacationEl);
    }

}

const result = [];
for (let key of Object.keys(groupedVacations)){
    result.push(groupedVacations[key]);
}
console.log(result);

fs.writeFileSync("vacations_grouped.json", JSON.stringify(result, null, 2));
