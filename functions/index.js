const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; 
const Datastore = require('@google-cloud/datastore');
const datastore = new Datastore({ projectId: 'pizzabot-xnastr'});
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
function order_pizza(agent) {
 var pizza_size = agent.parameters.size;
 var pizza_topping = agent.parameters.pizza_topping;
 var time = agent.parameters.time;
 var name = agent.parameters.Name;
 var Pin = agent.parameters.ZipCode;
 const taskKey = datastore.key('order_item');
 const entity = {
   key: taskKey,
   data: {
   item_name: 'pizza',
   topping: pizza_topping,
   time: time,
   name : name,
   pin : Pin,
   order_time: new Date().toLocaleString(),
   size: pizza_size }
  };
 return datastore.save(entity).then(() => {
           console.log(`Saved ${entity.key.name}: ${entity.data.item_name}`);
           agent.add(`Your order for ${pizza_topping} ${pizza_size} pizza has been placed on ${time}! Thank you ${name}. Your ID is ${entity.key.id}.`);
        });
}
let intentMap = new Map();
  intentMap.set('order.pizza', order_pizza);
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);
});
