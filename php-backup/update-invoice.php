<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include_once 'credentials.php';

$formData = [];
foreach ($_POST as $key => $value) {
    $formData['post'][$key] = $value;
}
// echo '<pre>';
// print_r($formData);
// die();


$connectionData = [
    'db_host' => DB_HOST,
    'db_username' => DB_USERNAME,
    'db_password' => DB_PASSWORD,
    'db_name' => DB_NAME
];
$formData = [];
foreach ($_POST as $key => $value) {
    $formData['post'][$key] = $value;
}
//echo '<pre>';
//print_r($formData);
//die();
try {
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
    // Prepare and bind
    $updateQuery = "UPDATE invoice_items SET gstin=?, clientContact=?,productName=?,hsn=?,rateValue=?,quantity=?,per=?,total=?,sub_total=?,total_amount=?,discount=?,grand_total=?,gst=?,paid_amount=?,dues=?,payment_type=?,pay_status=? WHERE id=?";
    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param("ssssssssiiiiiiiiii", $gstin, $clientContact, $prod_name, $hsn_code, $rate_value, $quantity, $per_value, $total, $sub_total, $total_amount, $discount, $grand_total, $gst, $paid_amount, $dues, $payment_type, $pay_status, $invoiceId);

    // Begin transaction 
    $conn->begin_transaction();
    // Bind parameters to the prepared statement




    $gstin = $formData['post']['gstin'];
    $clientContact = $formData['post']['clientContact'];
    $prod_name = json_encode($formData['post']['productName']);
    $hsn_code = json_encode($formData['post']['hsn']);
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
    $invoiceId = $formData['post']['invoiceId'];
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    $conn->commit();
} catch (Exception $e) {
    // Rollback transaction if an error occurred 
    if ($conn->errno === 0) {
        // Checking if there is no connection error 
        $conn->rollback();
    }
    echo "Error: " . $e->getMessage();
} finally {
    // Close statement and connection 
    if (isset($stmt)) {
        $stmt->close();
        header("Location: /invoice-app/Order.php");
    }
    if (isset($conn)) {
        $conn->close();
    }
}
