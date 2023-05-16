const express = require('express');
const { RpcObserver, RpcRequest } = require('./rpc');
const PORT = 9001;
const app = express();

app.use(express.json());
const fakeRes = {
    id : '3783288923893298923',
    title : "Iphone" ,
    price : 700
}

RpcObserver("PRODUCT_QUEUE_NAME" , fakeRes )
app.get('/products', async (req, res) => {
    const requestPayload = {
        productId : "1234" ,
        customerId : "3783288923893298923"
      };
      try {
          const responseData = await RpcRequest("CUSTOMER_QUEUE_NAME" , requestPayload);
          console.log({responseData});
          return res.status(200).json(responseData);
      } catch (error) {
           console.log(error);
           return res.status(500).json(error)
      }
})
app.get('/', (req, res) => {
  return res.json("Product Service")
})

app.listen(PORT , ()=> {
    console.log("Product is listening on port " + PORT);
    console.clear();
})