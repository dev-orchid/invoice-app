<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once 'credentials.php';


// echo '<pre>';
// print_r($formData);
// die();


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
$valid['success'] = array('success' => false, 'messages' => array());

//$orderId = $_POST['orderId'];
$orderId = $_GET['id'];
if ($orderId) {

    // Prepare the DELETE query 
    $sql = "DELETE FROM invoice_items WHERE id = ?"; // Prepare statement 
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $orderId); // Execute the query 
    if ($stmt->execute()) {
        $valid['success'] = true;
        $valid['messages'] = "Successfully Removed";
        header("Location: /invoice-app/Order.php");
    } else {
        $valid['success'] = false;
        $valid['messages'] = "Error while remove the brand";
    }
    // Close the statement and connection 
    $stmt->close();
    $conn->close();

    echo json_encode($valid);
} // /if $_POST