class NotificationSender {
    constructor(methods){
        this.methods = methods
    }

    sendNotifications(message){
        for (const method of this.methods){
            switch (method){
                case 'log': this.sendToLog(message);
                break;
            }
        }
        

        //TODO: add more alert methods
    }

    sendToLog(message){
        console.log(message)
    }
}

module.exports = {
    NotificationSender
}