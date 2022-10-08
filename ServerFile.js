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
        else return true;
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
            msg ? res.send(msg):res.send("Something Went Wrong");
        });

app.get("/svr/resetData",function(req,res,next){
    let sql="DELETE FROM products";
    client.query(sql,function(err,result){
        if(err) res.status(400).send(err);
        else {
            res.send("Successfully deleted");  
}
});
});
