const jsonString = '{"myLargeNumber": "9826231912286180120828980649989613944510478291528692173128872149148539351640"}';
const parsedObject = JSON.parse(jsonString);
console.log(parsedObject.myLargeNumber);

