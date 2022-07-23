const { NotificationSender } = require('./notifications/notification-sender');

const webhookEvent = require('./events/webhook-event').WebhookEvent;
const sender = require('./notifications/notification-sender').NotificationSender;

const suspiciousPushTimeMessage = 'Suspicious push detected';
const suspiciousTeamNameMessage = 'Suspicious team created';
const suspiciousRepoDeleteMessage = 'Suspicious repository deletion detected';
const notificationMethods = ['log']
const validPushTimeUTCSmall = 18;
const validPushTimeUTCLarge = 20;
const allowedDeletionRange = 10;
const restrictedText = 'hacker';

let supportedEvents = [
    {
        name: 'push',
        actions: [],
        funcsToExecute: [
            {
                func: webhookEvent.prototype.verifyByHourRange,
                params: [] //params should be filled when receiving an event as it is dynamic
            }
        ] 
    }, 
    {
        name: 'team',
        actions: ['created'],
        funcsToExecute: [
            {
                func: webhookEvent.prototype.verifyByText,
                params: []
            }
        ] 
    },
    {
        name: 'repository',
        actions: ['deleted'],
        funcsToExecute: [
            {
                func: webhookEvent.prototype.verifyDeletionMinutes,
                params: []
            }
        ]  
    }
];

function initVerification(event){
    let eventName = getName(event);
    let action = '';

    if (!isSupportedEvent(eventName)){
        throw new Error('Unsupported type'); //create a custom error to throw
    }

    if (eventName !== 'push'){ //push has no action property
        action = getAction(event);
        if (!isSupportedAction(eventName, action)){
            throw new Error('Unsupported action detected: ' + eventName + ' - ' + action); //create a custom error to throw
        }
    } else {
        action = '';
    }
    executeFunctions(eventName, event);
    
}

function executeFunctions(eventName, event){
    let notificationSender = new NotificationSender(notificationMethods);
    let funcsToExecute = [];
    let timestamp = getEventTimestamp(event);
    let result = true;
    for (const e of supportedEvents){
        if (e.name === eventName){
            funcsToExecute = e.funcsToExecute;
            break;
        }
    }

    switch (eventName) {
        case 'push': 
            for (let i = 0; i < funcsToExecute.length; i++){
                result = funcsToExecute[i].func(timestamp, validPushTimeUTCSmall, validPushTimeUTCLarge);
            }
            if (!result){
                notificationSender.sendNotifications(suspiciousPushTimeMessage);
            }
            break;
        case 'team': 
            for (let i = 0; i < funcsToExecute.length; i++){
                result = funcsToExecute[i].func(event.body.team.name, restrictedText);
            }
            if (!result){
                notificationSender.sendNotifications(suspiciousTeamNameMessage);
            } 
            break;
        case 'repository':
            for (let i = 0; i < funcsToExecute.length; i++){
                result = funcsToExecute[i].func(allowedDeletionRange, event.body.repository.created_at, timestamp);
            }
            if (!result){
                notificationSender.sendNotifications(suspiciousRepoDeleteMessage);
            }
            break;
    }
    
}

function getEventTimestamp(event){
    let timestamp = '';
    Object.getOwnPropertySymbols(event).map((prop) => {
        if (prop.toString() === 'Symbol(kHeaders)'){
            timestamp = event[prop]['timestamp'];
        }
    });

    return timestamp;
}

function getName(event){
    let name = '';
    Object.getOwnPropertySymbols(event).map((prop) => {
        if (prop.toString() === 'Symbol(kHeaders)'){
            name = event[prop]['x-github-event'];
        }
    });
    return name;
}

function getAction(event){
    return event.body.action;
}
function isSupportedEvent(name){
    for (let i = 0; i < supportedEvents.length; i++){
        if (name === supportedEvents[i].name){
            return true;
        }
    }
    return false;
}

function isSupportedAction(eventName, action){
    let actions = [];
    for (let i = 0; i < supportedEvents.length; i++){
        if (eventName === supportedEvents[i].name){
            actions = supportedEvents[i].actions;
            break;
        }
    }

    for (const eAction of actions){
        if (eAction === action){
            return true;
        }
    }
    return false;
}

module.exports = {
    initVerification
}