<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once 'credentials.php';
$connectionData = [
    'db_host' => DB_HOST,
    'db_username' => DB_USERNAME,
    'db_password' => DB_PASSWORD,
    'db_name' => DB_NAME
];
$conn = new mysqli(
    $connectionData['db_host'],
    $connectionData['db_username'],
    $connectionData['db_password'],
    $connectionData['db_name']
);
if ($conn->connect_error) {
    echo 'Something went wrong try again!';
    die();
    //die("Connection failed: " . $conn->connect_error);
}
$formData = [];
foreach ($_POST as $key => $value) {
    $formData['post'][$key] = $value;
}
// echo '<pre>';
// print_r($formData);
// die();
$gstin = $formData['post']['gstin'];
$orderDate = $formData['post']['orderDate'];
$clientName = $formData['post']['clientName'];
$shipAddress = $formData['post']['shipAddress'];
$clientContact = $formData['post']['clientContact'];
$hsn_code = json_encode($formData['post']['hsn']);
$prod_name = json_encode($formData['post']['productName']);
$rate_value = json_encode($formData['post']['rateValue']);
$quantity = json_encode($formData['post']['quantity']);
$per_value = json_encode($formData['post']['perValue']);
$total = json_encode($formData['post']['totalValue']);
$sub_total = $formData['post']['subTotalValue'];
$total_amount = $formData['post']['totalAmountValue'];
$discount = $formData['post']['discount'];
$grand_total = $formData['post']['grandTotalValue'];
$gst = $formData['post']['gstn'];
$paid_amount = $formData['post']['paid'];
$dues = $formData['post']['dueValue'];
$payment_type = $formData['post']['paymentType'];
$pay_status = $formData['post']['paymentStatus'];



$insertQuery = "INSERT INTO invoice_items (gstin,orderDate,clientName,shipAddress,clientContact,productName,hsn,rateValue,quantity,per,total,sub_total,total_amount,discount,grand_total,gst,paid_amount,dues,payment_type,pay_status)
    VALUES('$gstin','$orderDate','$clientName','$shipAddress','$clientContact','$prod_name','$hsn_code','$rate_value','$quantity','$per_value','$total','$sub_total','$total_amount','$discount','$grand_total','$gst','$paid_amount','$dues','$payment_type','$pay_status')";
echo $insertQuery;
if ($conn->query($insertQuery) === TRUE) {
    //echo 'inserted';
    header("Location: /invoice-app/Order.php");
} else {
    //echo "Error: " . $query . "<br>" . $conn->error;
}
