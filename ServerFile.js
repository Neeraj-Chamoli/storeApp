let express = require("express");
let app = express();
app.use(express.json());
const { Client } = require("pg");
const client = new Client({
    user: "qbnpgemnvnlgcq",
password: "e76ef5d9e4f9a8d1967b76bca41facd2765b9b4d7477b2e2250f9bd8a448d0ff",
database: "da0nt4017f0js7",
port: 5432,
host: "ec2-44-205-64-253.compute-1.amazonaws.com",
ssl: { rejectUnauthorized: false },});
client.connect(function (res, error) {
    console.log(`Connected!!`);
});
app.use(function (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header(
"Access-Control-Allow-Methods",
"GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD"
);
res.header(
"Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Accept"
);
next();
});
var port = process.env.PORT || 2410;
app.listen(port, () => console.log(`Node app listening on port ${port}!`));

function insertData(arr,idx){
    let sql2 = idx ==0 ? `INSERT INTO shops VALUES ($1,$2,$3)`:
    idx==1?`INSERT INTO products VALUES ($1,$2,$3,$4)`:`INSERT INTO purchases VALUES ($1,$2,$3,$4,$5)`;
    client.query(sql2,arr, function (err, result) {
        if(err) return err;
        else return result;
});
}
app.get("/svr/insertData",function(req,res,next){
    let { storeData } = require("./storeData.js");
    const { shops,products,purchases }=storeData;
    let msg=false;
            let arr =  shops.map((body) => Object.values(body));
            for(let i=0;i<arr.length;i++){
                msg=insertData(arr[i],0);
            }
            let arr1 =  products.map((body) => Object.values(body));
            for(let i=0;i<arr1.length;i++){
                msg=insertData(arr1[i],1);
            }
            let arr2 =  purchases.map((body) => Object.values(body));
            for(let i=0;i<arr2.length;i++){
                msg=insertData(arr2[i],2);
            }
            res.send("Data Inserted Successful");
        });
        function deleteAllData(idx){
            let sql=idx==0?`DELETE FROM products`:idx==1?`DELETE FROM purchases`:`DELETE FROM shops`;
            client.query(sql,function(err,result){
                if(err) return false;
                else return true;
        });
        }
app.get("/svr/resetData",function(req,res,next){
    let flag=false;
    flag=deleteAllData(1);
    flag=deleteAllData(0);
    flag=deleteAllData(3);
    res.send("Successfully deleted");
});
app.get("/shops",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM shops";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
      else res.send(result.rows);
    });
});
app.get("/products",function(req,res){
    let sql = "SELECT * FROM products";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
      else res.send(result.rows);
    });
});
app.get("/products/:id",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM products WHERE productid=$1";
    client.query(sql,[id], function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
      else res.send(result.rows[0]);
    });
});
app.get("/purchases",function(req,res){
    let shop=req.query.shop;
    let product=req.query.product;
    let sort=req.query.sort;
    let sql = "SELECT * FROM purchases";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
      else{
        let arr=result.rows;
        if(shop) arr=arr.filter(str=>str.shopid==getId(shop));
        if(product){
            let prod=product.split(',');
             arr=arr.filter(str=>prod.findIndex(ele=>getId(ele)==str.productid)>=0);
        }
        if(sort){
            switch(sort){
                case 'QtyAsc': arr=arr.sort((p1,p2)=>p1.quantity-p2.quantity);break;
                case 'QtyDesc': arr=arr.sort((p1,p2)=>p2.quantity-p1.quantity);break;
                case "ValueAsc":arr=arr.sort((p1,p2)=>(p1.quantity*p1.price)-(p2.quantity*p2.price));break;
                case "ValueDesc":arr=arr.sort((p1,p2)=>(p2.quantity*p2.price)-(p1.quantity*p1.price));break;
            }
        }
        res.send(arr);
    }
    });
});

app.get("/purchases/shops/:id",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM purchases WHERE shopId=$1";
    client.query(sql, [id], function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else res.send(result.rows);
    });
});
app.get("/purchases/products/:id",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM purchases WHERE productid=$1";
    client.query(sql, [id], function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else res.send(result.rows);
    });
});

app.get("/totalPurchase/shop/:id",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM purchases WHERE shopId=$1";
    client.query(sql, [id], function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else {
            let arr=result.rows;
            let total=arr.reduce((acc,curr)=>acc=acc+(curr.quantity*curr.price),0);
            res.send('Total Purchase at Shop '+id+' : '+total);
        }
    });
});

app.get("/totalPurchase/product/:id",function(req,res){
    let id=+req.params.id;
    let sql = "SELECT * FROM purchases WHERE productid=$1";
    client.query(sql, [id], function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else {
            let arr=result.rows;
            let total=arr.reduce((acc,curr)=>acc=acc+(curr.quantity*curr.price),0);
            res.send('Total Purchase of Product '+id+' : '+total);
        }
    });
});

app.post("/shops",function(req,res){
    let body=req.body;
    let sql = "SELECT * FROM shops";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else {
            let maxid=result.rows.reduce((acc,curr)=>curr.shopid>acc?curr.shopid:acc,0);
            let values=[(maxid+1),...Object.values(body)];
            let sql=`INSERT INTO shops VALUES ($1,$2,$3)`;
                client.query(sql,values, function (err, result) {
                    if(err) res.status(404).send(err);
                    else res.send("Data Inserted Successful, "+result.rowCount);
            });
        }
});
});

app.post("/products",function(req,res){
    let body=req.body;
    let sql = "SELECT * FROM products";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else {
            let maxid=result.rows.reduce((acc,curr)=>curr.productid>acc?curr.productid:acc,0);
            let values=[(maxid+1),...Object.values(body)];
            let sql=`INSERT INTO products VALUES ($1,$2,$3,$4)`;
                client.query(sql,values, function (err, result) {
                    if(err) res.status(404).send(err);
                    else res.send("Data Inserted Successful, "+result.rowCount);
            });
        }
});
});

app.post("/purchases",function(req,res){
    let body=req.body;
    let sql = "SELECT * FROM purchases";
    client.query(sql, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else {
            let maxid=result.rows.reduce((acc,curr)=>curr.purchaseid>acc?curr.purchaseid:acc,0);
            let values=[(maxid+1),...Object.values(body)];
            let sql=`INSERT INTO purchases VALUES ($1,$2,$3,$4,$5)`;
                client.query(sql,values, function (err, result) {
                    if(err) res.status(404).send(err);
                    else res.send("Data Inserted Successful, "+result.rowCount);
            });
        }
});
});

app.put("/products/:id",function(req,res){
    let id=+req.params.id;
    let body=req.body;
    let values=[body.category,body.description,id];
    let sql = "UPDATE products SET category=$1, description=$2 WHERE productid=$3";
    client.query(sql,values, function (err, result) {
      if (err) res.send("Error in Database: "+err.message);
        else res.send("Data Updated Successful, "+result.rowCount);
    });
});

function getId(str){
    let id='';
                for(let i=0;i<str.length;i++){
                    if(str[i]>=0 || str[i]<=9){
                        id+=str[i];
                    }
                }
                return id;
}