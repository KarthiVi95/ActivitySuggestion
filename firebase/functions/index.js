// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const axios=require('axios');  
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
global.parti=0; 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
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
 
  function activityFunctionHandler(agent){
    //agent.add('intent called: ' );
   const participant= agent.parameters.participant;
   //const activitytype= agent.parameters.typeto;
   //agent.add('The activity for participants are'+participant);
   global.parti=participant;    
 
  }
  function noActivityFunctionHandler(agent){
    //agent.add('intent called: ' );
   const participant= agent.parameters.participant;
   global.parti=participant;    
 
  }
  
  function activityYesFunctionHandler(agent){
    //agent.add('intent called: ' );
   const participant= global.parti;
   const activitytype= agent.parameters.typeto;
    // agent.add('The activity for participants are'+participant+activitytype);
   return axios.get('http://www.boredapi.com/api/activity?participants='+participant+'&type='+activitytype)
     .then((result) => {
       	//agent.add(result.data.activity);
         agent.add(result.data.activity);
      });
  }
  function activityNoFunctionHandler(agent){
   // agent.add('intent called: ' );
    const participant= global.parti;
    const activitytype= agent.parameters.notype;   
    //agent.add('The activity for participants are'+participant);
     return axios.get('http://www.boredapi.com/api/activity?participants='+participant+'&type='+activitytype)
     .then((result) => {
       	//agent.add(result.data.activity);
         agent.add(result.data.activity);
      });
  }
  
  
    // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Wait', activityFunctionHandler);
  intentMap.set('Waittype', activityYesFunctionHandler);
  intentMap.set('Custom', noActivityFunctionHandler);
  intentMap.set('Donttype', activityNoFunctionHandler);
  
  // intentMap.set('your intent name here', googleAssistantHandler);
  agent.handleRequest(intentMap);
});
