const ampqlib = require('amqplib');

const {v4 : uuid4} = require('uuid');


let ampqlibConnection = null;


const getChannel = async() => {
  if(ampqlibConnection === null) {
    ampqlibConnection = await   ampqlib.connect("amqp://localhost:5672")
  }

  return await ampqlibConnection.createChannel();
}

const expensiveDBFunc = async(payload , fakeRes) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
           resolve({fakeRes});
        } , 3000)
    })
  
}

const RpcObserver = async(RPC_QUEUE_NAME , fakeResponse) => {
     const channel = await getChannel();

     await channel.assertQueue(RPC_QUEUE_NAME, {
        durable : false,
     });

     channel.prefetch(1);
     channel.consume(RPC_QUEUE_NAME ,async(msg)=> {
       if(msg.content){
        const payload = JSON.parse(msg.content.toString());

        const response = await expensiveDBFunc(payload , fakeResponse) //Call fake db response

        channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
                correlationId : msg.properties.correlationId
            }
        )
        channel.ack(msg);
       }
     }
     ,
     {
        noAck : false,
     }
     
     );
}
const requestData = async  (RPC_QUEUE_NAME , requestPayload , uuid) => {
  const channel = await getChannel();

  const q = await channel.assertQueue("" , {exclusive : true});

  channel.sendToQueue(RPC_QUEUE_NAME , Buffer.from(JSON.stringify(requestPayload)) , {
    replyTo :q.queue ,
    correlationId : uuid
  })

  return new Promise((resolve , reject) => {
    const timeout = setTimeout(() => {
        resolve("API could not fufil request");
       channel.close();
    }, 10000)
    channel.consume(
        q.queue, 
        (msg) => {
            if(msg.properties.correlationId === uuid) {
                resolve(msg.content.toString());
                clearTimeout(timeout);
            }else{
                reject("Data not found");
            }
        } ,
        {
            noAck : true
        }
    )
  })
}
const RpcRequest = async(  RPC_QUEUE_NAME , requestPayload) => {
    const uuid = uuid4(); //corelationId

    return await requestData(RPC_QUEUE_NAME , requestPayload , uuid);
  
}

module.exports = {
    getChannel,
    RpcObserver,
    RpcRequest
}