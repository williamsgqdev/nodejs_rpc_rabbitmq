const express = require('express');
const { RpcObserver, RpcRequest } = require('./rpc');
const PORT = 9000;

const app = express();

app.use(express.json());
const fakeRes = {
    id : '3783288923893298923',
    name : "Killua Gon" ,
    country : "Japan"
};

RpcObserver("CUSTOMER_QUEUE_NAME" , fakeRes )

app.get('/wishlist', async(req, res) => {
    const requestPayload = {
      productId : "1234" ,
      customerId : "3783288923893298923"
    };
    try {
        const responseData = await RpcRequest("PRODUCT_QUEUE_NAME" , requestPayload);
        console.log({responseData});
        return res.status(200).json(responseData);
    } catch (error) {
         console.log(error);
         return res.status(500).json(error)
    }
})
app.get('/', (req, res) => {
  return res.json("Customer Service")
})

app.listen(PORT , ()=> {
    console.log("Customer is listening on port " + PORT);
    console.clear();
})