
function calculatePrice(documentDetails) {
    // documentDetails 
    // {
    //     language: "en", 
    //     mimetype: "doc|docx|rtf|other",
    //     count: 10000
    // }
    let charPrice, minimumPrice, priceMultiplier = 1, price;
    if (documentDetails.language == "en") {
        charPrice = 0.12;
        minimumPrice = 120;
    }
    else if (documentDetails.language == "uk" || documentDetails.language == "ru") {
        charPrice = 0.05;
        minimumPrice = 50;
    }
    else {
        throw new InvalidLanguage(`invalid language was specified, language: ${documentDetails.language}`);
    }

    if (!documentDetails.mimetype.match(/doc|docx|rtf/)) {
        priceMultiplier = 1.2;
    }

    price = documentDetails.count * charPrice * priceMultiplier;
    price = price < minimumPrice ? minimumPrice : price;
    return Math.round(price * 100) / 100;
}

function calculateWorkTime(documentDetails) {
    // documentDetails 
    // {
    //     language: "en", 
    //     mimetype: "doc|docx|rtf|other",
    //     count: 10000
    // }

    let workTimeMultiplier = 1, charsPerHour, minimumWorkTime = 1, workTime;

    if (documentDetails.language == "en") {
        charsPerHour = 333;
    }
    else if (documentDetails.language == "uk" || documentDetails.language == "ru") {
        charsPerHour = 1333;
    }
    else {
        throw new InvalidLanguage(`invalid language was specified, language: ${documentDetails.language}`);
    }

    if (!documentDetails.mimetype.match(/doc|docx|rtf/)) {
        workTimeMultiplier = 1.2;
    }

    workTime = (0.5 + (documentDetails.count / charsPerHour)) * workTimeMultiplier;
    workTime = workTime < minimumWorkTime ? minimumWorkTime : workTime;
    return Math.round(workTime * 100) / 100;
}


function addHours(date, hours) {
    date.setTime(date.getTime() + hours * 60 * 60 * 1000);
    return date;
}

function addMinutes(date, minutes) {
    date.setTime(date.getTime() + minutes * 60 * 1000);
    return date;
}


function calculateDeadline(documentDetails, now = new Date()) {
    // workTime in hours
    const workTime = calculateWorkTime(documentDetails);
    let workHours = Math.floor(workTime), workMinutes = Math.round((workTime - workHours) * 60);

    // console.log(workTime, workHours, workMinutes);

    // Monday = 1, Friday = 5;
    const hoursLowerBound = 10, hoursUpperBound = 19,
        dayLowerBound = 1, dayUpperBound = 5;

    let deadline = now;
    // let deadline = new Date();
    // let deadline = new Date(2023, 8, 17, 9, 30, 0, 0);
    // console.log(`now: ${deadline / 1000}`);

    let deadlineDay, deadlineHours, deadlineMinutes, deltaHours, deltaMinutes;

    while (workHours != 0 || workMinutes != 0) {
        deadlineDay = deadline.getDay(), deadlineHours = deadline.getHours(), deadlineMinutes = deadline.getMinutes();

        if (deadlineDay >= dayLowerBound && deadlineDay <= dayUpperBound) {

            if (deadlineHours >= hoursLowerBound && deadlineHours < hoursUpperBound) {

                deltaMinutes = 60 - deadlineMinutes;
                deltaHours = deltaMinutes == 60 ? hoursUpperBound - deadlineHours : hoursUpperBound - deadlineHours - 1;
                deltaMinutes = deltaMinutes == 60 ? 0 : deltaMinutes;

                if ((deltaHours * 60 + deltaMinutes) >= (workHours * 60 + workMinutes)) {
                    deadline = addHours(deadline, workHours);
                    workHours = 0;

                    deadline = addMinutes(deadline, workMinutes);
                    workMinutes = 0;
                }
                else {
                    deadline = addHours(deadline, deltaHours);
                    workHours = workHours - deltaHours;

                    deadline = addMinutes(deadline, deltaMinutes);
                    workMinutes = workMinutes - deltaMinutes;

                    // deadline go to next day hoursLowerBound
                    deadline = addHours(deadline, 24 - (hoursUpperBound - hoursLowerBound))
                }

            }
            else if (deadlineHours < hoursLowerBound) {
                deltaMinutes = 60 - deadlineMinutes;
                deltaHours = deltaMinutes == 60 ? hoursLowerBound - deadlineHours : hoursLowerBound - deadlineHours - 1;
                deltaMinutes = deltaMinutes == 60 ? 0 : deltaMinutes;

                // deadline go to this day hoursLowerBound
                deadline = addHours(deadline, deltaHours);
                deadline = addMinutes(deadline, deltaMinutes);
            }
            else if (deadlineHours >= hoursUpperBound) {
                deltaHours = deadlineHours - hoursUpperBound;
                deltaMinutes = deadlineMinutes;

                // deadline go to next day hoursLowerBound
                deadline = addMinutes(deadline, 24 * 60 - ((hoursUpperBound - hoursLowerBound) * 60 + deltaHours * 60 + deltaMinutes));
            }
        }
        else {
            deltaMinutes = 60 - deadlineMinutes;
            deltaHours = deltaMinutes == 60 ? hoursLowerBound - deadlineHours : hoursLowerBound - deadlineHours - 1;
            deltaMinutes = deltaMinutes == 60 ? 0 : deltaMinutes;

            deadline = addHours(deadline, 24 + deltaHours);
            deadline = addMinutes(deadline, deltaMinutes);
        }
    }


    // console.log(`deadline: ${deadline}`);
    const deadlineStr = deadline.toLocaleString("en-US", {
        hour12: false,
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
    deadline = new Date(Date.parse(deadlineStr));

    return deadline;

    // const dateStr = new Date().toLocaleString("en-US", {timeZone: "Europe/Kyiv", hour12: false});
    // console.log(dateStr);

}

function generateResponse(documentDetails, now = new Date()) {
    const price = calculatePrice(documentDetails), time = calculateWorkTime(documentDetails);
    const deadlineDate = calculateDeadline(documentDetails, now);
    const deadlineDateStr = deadlineDate.toLocaleString("en-US", {
        hour12: false,
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    const deadlineUnixTimestamp = Math.floor(Date.parse(deadlineDateStr) / 1000);

    const response = {
        "price": price,
        "time": time,
        "deadline": deadlineUnixTimestamp,
        "deadline_date": deadlineDateStr
    }

    return response;
}


let documentDetails = {
    language: "en",
    mimetype: "pdf",
    count: 9990
};

class InvalidLanguage extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}

export { calculatePrice, calculateWorkTime, calculateDeadline, generateResponse, InvalidLanguage };
// console.log(generateResponse(documentDetails, new Date(2023, 8, 20, 15, 30, 0, 0)));
// console.log(calculatePrice(documentDetails));
// console.log(calculateWorkTime(documentDetails));
// console.log(calculateDeadline(documentDetails, new Date(2023, 8, 20, 15, 30, 0, 0)).toString());

