class WebhookEvent {

    //to account for time differences, converts all Dates to UTC
    verifyByHourRange(eventTime, timeSmall, timeLarge){
        let pushHour = new Date(parseInt(eventTime)).getUTCHours();
        if (pushHour >= timeSmall && pushHour <= timeLarge){
            return false;
        } else {
            return true;
        }

    }

    verifyByText(eventTextToVerify, restrictedText){
        return !eventTextToVerify.startsWith(restrictedText);
    }

    verifyDeletionMinutes(allowedRange, createTime, deleteTime){
        let createMinutes = new Date(createTime).getUTCMinutes();
        let deletedMinutes = new Date(parseInt(deleteTime)).getUTCMinutes();
        let createdHour = new Date(createTime).getUTCHours();
        let deletedHour = new Date(parseInt(deleteTime)).getUTCHours();
        let hourDifference = deletedHour - createdHour;

        return (deletedMinutes + 60 * hourDifference) - createMinutes > allowedRange;
    }
}

module.exports = {
    WebhookEvent: WebhookEvent
};