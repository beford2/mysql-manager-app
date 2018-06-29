var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "127.0.0.1",

  // Your port; if not 3306
  port: 8889,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect(function(err){
    if(err) throw err;
    console.log("connected as id " + connection.threadId);
    console.log("\n===============================\n");
    showItems();
    
});

function showItems(){
    console.log("These items are for sale:\n");
    connection.query("SELECT * FROM products", function(error, result){
        if(error) throw error;
        // console.log(result);
        for(var i = 0; i < result.length; i++){
            console.log(result[i].item_id + ". A " + result[i].product_name + " for only $" + result[i].price + ".");
        }
        console.log("\n------------------------------\n");
        askCustomer();
    });
    
    
}

function askCustomer() {

    inquirer.prompt([
        {
            name: "productID",
            type: "input",
            message: "Which item do you want to purchase?",
            validate: function(input){
                if(isNaN(input) === false && parseInt(input) > 0 && parseInt(input) <= 10){
                    return true;
                }
                return false;
            }
        }
    ]).then(function(answer){
        // console.log(answer.productID);

        var itemNum = answer.productID;

        // grabs the item by id in the server
        connection.query("SELECT * FROM products WHERE item_id =?", [itemNum], function(error, result){

            if(error) throw error;

            // console.log(result);

            var itemName = result[0].product_name;
            var itemQuantity = result[0].stock_quantity;
            var itemPrice = result[0].price;
            // checks to see if item is out of stock
            if(itemQuantity === 0){
                console.log("Sorry for the inconvienence but that item seems to be out of stock. Please select a differnt item.");
                askCustomer();
            }

            // promt the user how much the want to buy
            inquirer.prompt([
                {
                    name: "quantity",
                    type: "input",
                    message: "How many " + itemName + "(e)s do you want?",
                    validate: function(input){
                        if(isNaN(input) === false && parseInt(input) > 0 && parseInt(input) <= itemQuantity){
                            return true;
                        }
                        return false;
                    }
                }
            ]).then(function(answer){
                // console.log(answer.quantity);
                var quantity = answer.quantity;

                // console.log(itemNum);
                // console.log(itemName);
                // console.log(itemQuantity);

                var cost = itemPrice * quantity;
                var newStoreQuantity = itemQuantity - quantity;
                if(quantity > 1){
                    console.log("You are about to purchase " + quantity + " " + itemName + "(e)s. This will cost $" + cost + ".");
                }else{
                    console.log("You are about to purchase " + quantity + " " + itemName + "(e)s. This will cost $" + cost + ".");                    
                }
                
                connection.query("UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newStoreQuantity
                    },
                    {
                        item_id: itemNum
                    }
                ],
                function(error, result){
                    if(error) throw error;

                    // console.log(result);
                    console.log("Thank you for your purchase!");
                    connection.end();
                });

                
            });

        });
        
        
    });
    ;
}



