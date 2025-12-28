<?php
include('./constant/connect.php');
$invoiceId = $_REQUEST['id'] ?? '';

$sql = "SELECT * FROM invoice_items  
    WHERE id = {$invoiceId}";
//echo $sql;
$result = $connect->query($sql);
$invoiceItems = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        array_push($invoiceItems, $row);
    }

    $productName = json_decode($invoiceItems[0]['productName']);
    $rateValue = json_decode($invoiceItems[0]['rateValue']);
    $hsn = json_decode($invoiceItems[0]['hsn']);
    $quantity = json_decode($invoiceItems[0]['quantity']);
    $per = json_decode($invoiceItems[0]['per']);
    $total = json_decode($invoiceItems[0]['total']);
}
function numberToWords($number)
{
    $words = [
        0 => '',
        1 => 'One',
        2 => 'Two',
        3 => 'Three',
        4 => 'Four',
        5 => 'Five',
        6 => 'Six',
        7 => 'Seven',
        8 => 'Eight',
        9 => 'Nine',
        10 => 'Ten',
        11 => 'Eleven',
        12 => 'Twelve',
        13 => 'Thirteen',
        14 => 'Fourteen',
        15 => 'Fifteen',
        16 => 'Sixteen',
        17 => 'Seventeen',
        18 => 'Eighteen',
        19 => 'Nineteen',
        20 => 'Twenty',
        30 => 'Thirty',
        40 => 'Forty',
        50 => 'Fifty',
        60 => 'Sixty',
        70 => 'Seventy',
        80 => 'Eighty',
        90 => 'Ninety'
    ];

    if ($number == 0) {
        return 'Zero';
    }

    if ($number < 21) {
        return $words[$number];
    }

    if ($number < 100) {
        return $words[10 * floor($number / 10)] . ' ' . $words[$number % 10];
    }

    if ($number < 1000) {
        return $words[floor($number / 100)] . ' Hundred ' . numberToWords($number % 100);
    }

    if ($number < 100000) {
        return numberToWords(floor($number / 1000)) . ' Thousand ' . numberToWords($number % 1000);
    }

    if ($number < 10000000) {
        return numberToWords(floor($number / 100000)) . ' Lakh ' . numberToWords($number % 100000);
    }

    return numberToWords(floor($number / 10000000)) . ' Crore ' . numberToWords($number % 10000000);
}

function amountToWords($amount)
{
    $paise = round($amount * 100) % 100;
    $rupees = floor($amount);

    $rupeesInWords = numberToWords($rupees);
    $paiseInWords = numberToWords($paise);

    if ($paise > 0) {
        return $rupeesInWords . ' Rupees and ' . $paiseInWords . ' Paise';
    } else {
        return $rupeesInWords . ' Rupees';
    }
}

$i = 1;
// echo '<pre>';
// print_r($invoiceItems);
// die();
?>

<link href="assets/css/lib/calendar2/semantic.ui.min.css?v=<?= time() ?>" rel="stylesheet">
<link href="custom/css/invoice-print.css?v=<?= time() ?>" rel="stylesheet">
<div class="container invoice">

    <div class="ui segment cards">
        <div class="segment itemscard">
            <div class="invoice-header">
                <div class="ui left aligned grid">
                    <div class="row">
                        <div class="left floated left aligned six wide column">
                            <div class="ui">
                                <small class="ui sub header">GSTIN : 10CEKPP9425G1ZG</small>

                            </div>
                        </div>
                        <div class="right floated right aligned six wide column">
                            <div class="ui">
                                <small class="ui sub header">Original Copy</small>

                            </div>
                        </div>
                    </div>
                </div>
                <center class="company-info">
                    <span>Tax Invoice</span>
                    <h4>Sipahi Jee Metal Works</h4>
                    <p>NEW ATWARPUR KURTHAUL, Parsa Bazar</p>
                    <p>Patna, Bihar, 804453</p>
                </center>
            </div>
        </div>
        <br>
        <div class="ui card customershipcard">
            <div class="content">
                <div class="header">Party Details:- </div>
                <div class="content">
                    <p> <?= $invoiceItems[0]['clientName'] ?></p>
                    <p> <?= $invoiceItems[0]['shipAddress'] ?></p>
                </div>
                <br>
                <div class="content">
                    <p>GSTIN/UN : <span><?= $invoiceItems[0]['gstin'] ?></span></p>
                </div>
            </div>
        </div>
        <div class="ui card customercard">
            <div class="content">
                <div class="content">
                    <p> Invoice No. : <?= $invoiceItems[0]['id'] ?> </p>
                    <p> Dated : <?= $invoiceItems[0]['orderDate'] ?></p>
                    <p> Place of Supply : Bihar (10)</p>
                    <p> Reverse Charge: N</p>
                </div>
            </div>
        </div>

        <div class="ui segment itemscard">
            <div class="content">
                <table class="ui celled table">
                    <thead>
                        <tr>
                            <th class="text-center colfix">Description of Goods</th>
                            <th class="text-center colfix">HSN/SAC</th>
                            <th class="text-center colfix">Rate</th>
                            <th class="text-center colfix">Quantity</th>
                            <th class="text-center colfix">Per</th>
                            <th class="text-center colfix">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($productName as $key => $result) {
                            $totlaQuantity += $quantity[$key];

                        ?>
                            <tr>

                                <td class="text-right">
                                    <span class="mono"><?= $i . ' .' . $productName[$key] ?></span>
                                </td>


                                <td class="text-right">
                                    <span class="mono"><?= $hsn[$key] ?></span>
                                </td>

                                <td class="text-right">
                                    <span class="mono"><?= $rateValue[$key] ?></span>
                                </td>

                                <td class="text-right">
                                    <span class="mono"><?= $quantity[$key] . ' ' . $per[$key] ?></span>
                                </td>

                                <td class="text-right">
                                    <span class="mono"><?= $per[$key] ?></span>
                                </td>

                                <td class="text-right">
                                    <span class="mono"><?= number_format($total[$key], 2); ?></span>
                                </td>

                            </tr>


                        <?php ++$i;
                        } ?>
                        <tr>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td style="border-bottom:1px solid black"><?= number_format($invoiceItems[0]['sub_total'], 2) ?></td>
                        </tr>
                        <tr class="calculation_cgst">
                            <td style="text-align:right;font-weight:bold;">CGST</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?></td>
                        </tr>
                        <tr class="calculation_sgst">
                            <td style="text-align:right;font-weight:bold;">SGST</td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?></td>
                        </tr>
                        <tr class="calculationtd">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>

                    </tbody>
                    <tfoot class="full-width">
                        <tr>
                            <th style="text-align:right;"> Total: </th>
                            <th></th>
                            <th></th>
                            <th style="font-weight:bold;"> <?= $totlaQuantity . ' KGS'; ?> </th>
                            <th> </th>
                            <th style="font-weight:bold;"><?= number_format($invoiceItems[0]['grand_total'], 2) ?> </th>
                        </tr>
                        <tr>

                            <th colspan="6" style="font-weight:bold;">
                                <small class="text-muted">Amount Chargable (in words)</small> <br>
                                <?= amountToWords($invoiceItems[0]['grand_total']) . ' Only' ?>
                            </th>
                        </tr>
                    </tfoot>
                </table>

            </div>
        </div>

        <!-- <div class="ui card">
            <div class="content center aligned text segment">
                <small class="ui sub header"> Amount Due (AUD): </small>
                <p class="bigfont"> </p>
            </div>
        </div> -->
        <div class="ui card gstinfo">
            <div class="content">
                <table class="ui celled table">
                    <thead>
                        <tr>
                            <th rowspan="2">Taxable Amount</th>
                            <th colspan="2">CGST</th>
                            <th colspan="2">SGST/UTGST</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-right">
                                <span class="mono"></span>
                            </td>
                            <td class="text-right">
                                <span class="mono">Rate</span>
                            </td>
                            <td class="text-right">
                                <span class="mono">Amount</span>
                            </td>
                            <td class="text-right">
                                <span class="mono">Rate</span>
                            </td>
                            <td class="text-right">
                                <span class="mono">Amount</span>
                            </td>
                            <td class="text-right">
                                <span class="mono">Tax Amount</span>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot class="full-width">
                        <tr>
                            <th style="text-align:right;"><?= number_format($invoiceItems[0]['sub_total'], 2) ?> </th>
                            <th>9%</th>
                            <th><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?></th>
                            <th>9% </th>
                            <th><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?> </th>
                            <th><?= number_format(($invoiceItems[0]['gst']), 2) ?> </th>
                        </tr>
                        <tr>
                            <th style="text-align:right;">Total: <?= number_format($invoiceItems[0]['sub_total'], 2) ?>
                            </th>
                            <th> </th>
                            <th style="font-weight:bold;"><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?></th>
                            <th> </th>

                            <th style="font-weight:bold;"><?= number_format(($invoiceItems[0]['gst'] / 2), 2) ?> </th>
                            <th style="font-weight:bold;"><?= number_format(($invoiceItems[0]['gst']), 2) ?> </th>
                        </tr>
                        <tr>
                            <th colspan="6" style="font-weight:bold;">
                                <small class="text-muted">Tax Amount (in words)</small>
                                <?= amountToWords($invoiceItems[0]['gst']) . ' Only' ?>
                            </th>
                        </tr>
                    </tfoot>
                </table>
                <div class="invoice-header">

                    <div class="content">
                        <table class="ui celled table">

                            <tbody>
                                <tr>
                                    <td class="text-right" width="60%">
                                        <div class="content">
                                            <div class="header">
                                                <u>Declaration</u>
                                                <p>We declare that this invoice shows the actual price of the goods
                                                    described and that all the particulars are true
                                                    correct.</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div class="content">
                                            <div class="header">
                                                <p style="text-align: right; "> For Sipahi Jee Metal Works </p>
                                                <p style="text-align: right;margin-top:40px"> Authorized Signatory </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>



            </div>
        </div>

    </div>
</div>