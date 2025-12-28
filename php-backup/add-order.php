<?php
include('./constant/layout/head.php');
include('./constant/layout/header.php');
include('./constant/layout/sidebar.php');
include('./constant/connect.php');
?>
<style>
	.shippingAddress {
		text-align: left;
		height: 75px;
	}
</style>

<div class="page-wrapper">

	<div class="row page-titles">
		<div class="col-md-5 align-self-center">
			<h3 class="text-primary">Invoice Management</h3>
		</div>
		<div class="col-md-7 align-self-center">
			<ol class="breadcrumb">
				<li class="breadcrumb-item"><a href="javascript:void(0)">Home</a></li>
				<li class="breadcrumb-item active">Invoice Management</li>
			</ol>
		</div>
	</div>


	<div class="container-fluid">
		<div class="row">
			<div class="col-lg-11" style="margin-left: 5%;">
				<div class="card">
					<div class="card-title">
					</div>
					<div id="add-brand-messages"></div>
					<div class="card-body">
						<div class="input-states">
							<form class="form-horizontal" method="POST" action="add-invoice.php" id="createOrderForm">
								<div class="form-group">
									<div class="row">

										<label class="col-sm-2 control-label">Client GST/IN/UN</label>
										<div class="col-sm-4">
											<input type="text" class="form-control" name="gstin" placeholder="GST/IN/UN" autocomplete="off" required />
										</div>
										<label class="col-sm-2 control-label">Invoice Date</label>
										<div class="col-sm-4">
											<input type="date" class="form-control" id="orderDate" name="orderDate" autocomplete="off" />
										</div>
									</div>
								</div>
								<div class="form-group">
									<div class="row">
										<label class="col-sm-2 control-label">Client Name:</label>
										<div class="col-sm-4">
											<input type="text" class="form-control" id="clientName" name="clientName" placeholder="Client Name" autocomplete="off" required />

										</div>

										<label class="col-sm-2 control-label">Client Contact No.</label>
										<div class="col-sm-4">
											<input type="text" class="form-control" id="clientContact" name="clientContact" placeholder="Contact Number No." autocomplete="off" pattern="^[0][1-9]\d{9}$|^[1-9]\d{9}$" />
										</div>
									</div>
								</div>
								<div class="form-group">
									<div class="row">
										<label class="col-sm-2 control-label">Consignee(Ship To)</label>
										<div class="col-sm-4">
											<textarea rows="4" cols="50" class="form-control shippingAddress" placeholder="Shipping Address.." id="shipAddress" name="shipAddress" required></textarea>
										</div>
									</div>

								</div>


								<table class="table" id="productTable">
									<thead>
										<tr>
											<th style="width:40%;">Description of Goods</th>
											<th style="width:10%;">HSN/SAC</th>
											<th style="width:10%;">Rate</th>
											<th style="width:15%;">Quantity</th>
											<th style="width:10%;">Per</th>
											<th style="width:25%;">Amount</th>
											<th style="width:10%;">Action</th>
										</tr>
									</thead>
									<tbody>
										<?php
										$arrayNumber = 0;
										for ($x = 1; $x < 2; $x++) { ?>
											<tr id="row<?php echo $x; ?>" class="<?php echo $arrayNumber; ?>">
												<td style="margin-left:5px;">
													<div class="form-group">

														<input type="text" class="form-control" name="productName[]" id="productName<?php echo $x; ?>" placeholder="Description of Goods" />

													</div>
												</td>
												<td style="padding-left:5px;">
													<input type="text" name="hsn[]" id="hsn<?php echo $x; ?>" autocomplete="off" class="form-control" placeholder="HSN/SAC" />
												</td>

												<td style="padding-left:5px;">
													<input type="text" name="rateValue[]" id="rateValue<?php echo $x; ?>" autocomplete="off" class="form-control" placeholder="Rate" />
												</td>
												<td style="padding-left:5px;">
													<div class="form-group">
														<input type="number" name="quantity[]" id="quantity<?php echo $x; ?>" autocomplete="off" class="form-control" min="1" placeholder="Quantity" onkeyup="getTotal(<?php echo $x ?>)" />
													</div>
												</td>
												<td style="padding-left:5px;">
													<input type="text" name="perValue[]" id="perValue<?php echo $x; ?>" autocomplete="off" class="form-control" placeholder="per" />
												</td>

												<td>
													<input type="text" name="total[]" id="total<?php echo $x; ?>" autocomplete="off" class="form-control" disabled="true" />
													<input type="hidden" name="totalValue[]" id="totalValue<?php echo $x; ?>" autocomplete="off" class="form-control" />
												</td>
												<td>

													<button type="button" class="btn btn-primary btn-flat " onclick="addRow()" id="addRowBtn" data-loading-text="Loading..."> <i class="fa fa-plus"></i></button>


						</div>
						</td>

						<td>



							<button type="button" class="btn btn-danger  removeProductRowBtn" type="button" id="removeProductRowBtn" onclick="removeProductRow(<?php echo $x; ?>)"><i class="fa fa-trash"></i></button>
					</div>
					</td>


					</tr>
				<?php
											$arrayNumber++;
										} // /for
				?>
				</tbody>
				</table>


				<div class="form-group">
					<div class="row">
						<label class="col-sm-2 control-label">Sub Amount</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="subTotal" name="subTotal" disabled="true" />
							<input type="hidden" class="form-control" id="subTotalValue" name="subTotalValue" />
						</div>

						<label for="totalAmount" class="col-sm-2 control-label">Total Amount</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="totalAmount" name="totalAmount" disabled="true" />
							<input type="hidden" class="form-control" id="totalAmountValue" name="totalAmountValue" />
						</div>

					</div>
				</div>

				<div class="form-group">
					<div class="row">
						<label for="discount" class="col-sm-2 control-label">Discount</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="discount" name="discount" onkeyup="discountFunc()" autocomplete="off" pattern="^[0-9]+$" />
						</div>
						<label for="grandTotal" class="col-sm-2 control-label">Grand Total</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="grandTotal" name="grandTotal" disabled="true" />
							<input type="hidden" class="form-control" id="grandTotalValue" name="grandTotalValue" />
						</div>

					</div>
				</div>
				<div class="form-group">
					<div class="row">

					</div>
				</div>

				<div class="form-group">
					<div class="row">
						<label for="vat" class="col-sm-2 control-label gst">GST 18%</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="vat" name="gstn" readonly="true" />
							<input type="hidden" class="form-control" id="vatValue" name="vatValue" />
						</div>

						<label for="paid" class="col-sm-2 control-label">Paid Amount</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="paid" name="paid" autocomplete="off" onkeyup="paidAmount()" />
						</div>

					</div>
				</div>

				<div class="form-group">
					<div class="row">
						<label for="due" class="col-sm-2 control-label">Due Amount</label>
						<div class="col-sm-4">
							<input type="text" class="form-control" id="due" name="due" disabled="true" />
							<input type="hidden" class="form-control" id="dueValue" name="dueValue" />
						</div>

						<label for="clientContact" class="col-sm-2 control-label">Payment Type</label>
						<div class="col-sm-4">
							<select class="form-control" name="paymentType" id="paymentType">
								<option value="2" selected>Cash</option>
								<option value="4">Phone Pe</option>
								<option value="5">Google Pay</option>
								<option value="6">Amazon Pay</option>
								<option value="1">Cheque</option>
								<option value="3">Credit Card</option>

							</select>
						</div>


					</div>
				</div>

				<div class="form-group">
					<div class="row">
						<label for="clientContact" class="col-sm-2 control-label">Payment Status</label>
						<div class="col-sm-4">
							<select class="form-control" name="paymentStatus" id="paymentStatus">
								<option value="">~~SELECT~~</option>
								<option value="1">Full Payment</option>
								<option value="2">Advance Payment</option>
								<option value="3">No Payment</option>
							</select>
						</div>

						<label for="clientContact" class="col-sm-2 control-label">Payment Place</label>
						<div class="col-sm-4">
							<select class="form-control" name="paymentPlace" id="paymentPlace">
								<option value="1" selected>In India</option>
								<option value="2">Out Of India</option>
							</select>
						</div>
					</div>
				</div>
				<div class="form-group submitButtonFooter text-end">
					<div class="col-sm-offset-2 col-sm-12">
						<button type="submit" id="createOrderBtn" data-loading-text="Loading..." class="btn btn-success btn-flat m-b-30 m-t-30"><i class="glyphicon glyphicon-ok-sign"></i> Submit</button>

						<button type="reset" class="btn btn-danger btn-flat m-b-30 m-t-30" onclick="resetOrderForm()"><i class="glyphicon glyphicon-erase"></i> Reset</button>
					</div>
				</div>

				</form>
				</div>
			</div>
		</div>
	</div>

</div>




<?php include('./constant/layout/footer.php'); ?>
<script>
	//$(document).ready(function() {
	function addRow() {
		$("#addRowBtn").button("loading");

		var tableLength = $("#productTable tbody tr").length;

		var tableRow;
		var arrayNumber;
		var count;

		if (tableLength > 0) {
			tableRow = $("#productTable tbody tr:last").attr('id');
			arrayNumber = $("#productTable tbody tr:last").attr('class');
			count = tableRow.substring(3);
			count = Number(count) + 1;
			arrayNumber = Number(arrayNumber) + 1;
		} else {
			// no table row
			count = 1;
			arrayNumber = 0;
		}

		$("#addRowBtn").button("reset");

		var tr = '<tr id="row' + count + '" class="' + arrayNumber + '">' +
			'<td>' +
			'<div class="form-group">' +

			'<input type="text" class="form-control" name="productName[]" id="productName' + count + '" placeholder="Description of Goods"/>';
		tr +=
			'</div>' +
			'</td>' +
			'<td style="padding-left:5px;"">' +
			'<input type="text" name="hsn[]" id="hsn' + count + '" autocomplete="off" class="form-control" placeholder="HSN/SAC"/>' +
			'</td>' +

			'<td style="padding-left:5px;">' +
			'<div class="form-group">' +
			'<input type="text" name="rateValue[]" id="rateValue' + count + '" autocomplete="off" class="form-control"placeholder="Rate"/>' +
			'</div>' +
			'</td>' +
			'<td style="padding-left:5px;">' +
			'<div class="form-group">' +
			'<input type="number" name="quantity[]" id="quantity' + count + '" autocomplete="off" class="form-control" placeholder="Quantity" onkeyup="getTotal(' + count + ')" />' +
			'</div>' +
			'</td>' +
			'<td style="padding-left:5px;">' +
			'<div class="form-group">' +
			'<input type="text" name="perValue[]" id="perValue' + count + '" autocomplete="off" class="form-control"placeholder="per"/>' +
			'</div>' +
			'</td>' +
			'<td style="padding-left:5px;">' +
			'<input type="text" name="total[]" id="total' + count + '" autocomplete="off" class="form-control" disabled="true" />' +
			'<input type="hidden" name="totalValue[]" id="totalValue' + count + '" autocomplete="off" class="form-control"  />' +
			'</td>' +
			'<td>' +
			'<button class="btn btn-primary removeProductRowBtn" type="button" onclick="addRow(' + count + ')"><i class="fa fa-plus"></i></button>' +
			'</td>' +
			'<td>' +
			'<button class="btn btn-danger removeProductRowBtn" type="button" onclick="removeProductRow(' + count + ')"><i class="fa fa-trash"></i></i></button>' +
			'</td>' +

			'</tr>';
		if (tableLength > 0) {
			$("#productTable tbody tr:last").after(tr);
		} else {
			$("#productTable tbody").append(tr);
		}

	} // /add row

	function removeProductRow(row = null) {
		if (row) {
			$("#row" + row).remove();
			subAmount();
		} else {
			alert('error! Refresh the page again');
		}
	}
	// table total
	function getTotal(row = null) {
		if (row) {
			var total = Number($("#rateValue" + row).val()) * Number($("#quantity" + row).val());
			console.log($("#rateValue" + row).val())
			total = total.toFixed(2);
			$("#total" + row).val(total);
			$("#totalValue" + row).val(total);

			subAmount();

		} else {
			alert('no row !! please refresh the page');
		}
	}

	function subAmount() {
		var tableProductLength = $("#productTable tbody tr").length;
		var totalSubAmount = 0;
		for (x = 0; x < tableProductLength; x++) {
			var tr = $("#productTable tbody tr")[x];
			var count = $(tr).attr('id');
			count = count.substring(3);

			totalSubAmount = Number(totalSubAmount) + Number($("#total" + count).val());
		} // /for

		totalSubAmount = totalSubAmount.toFixed(2);

		// sub total
		$("#subTotal").val(totalSubAmount);
		$("#subTotalValue").val(totalSubAmount);

		// vat
		var vat = (Number($("#subTotal").val()) / 100) * 18;
		vat = vat.toFixed(2);
		$("#vat").val(vat);
		$("#vatValue").val(vat);

		// total amount
		var totalAmount = (Number($("#subTotal").val()) + Number($("#vat").val()));
		totalAmount = totalAmount.toFixed(2);
		$("#totalAmount").val(totalAmount);
		$("#totalAmountValue").val(totalAmount);

		var discount = $("#discount").val();
		if (discount) {
			var grandTotal = Number($("#totalAmount").val()) - Number(discount);
			grandTotal = grandTotal.toFixed(2);
			$("#grandTotal").val(grandTotal);
			$("#grandTotalValue").val(grandTotal);
		} else {
			$("#grandTotal").val(totalAmount);
			$("#grandTotalValue").val(totalAmount);
		} // /else discount 

		var paidAmount = $("#paid").val();
		if (paidAmount) {
			paidAmount = Number($("#grandTotal").val()) - Number(paidAmount);
			paidAmount = paidAmount.toFixed(2);
			$("#due").val(paidAmount);
			$("#dueValue").val(paidAmount);
		} else {
			$("#due").val($("#grandTotal").val());
			$("#dueValue").val($("#grandTotal").val());
		} // else

	} // /sub total amount

	function discountFunc() {
		var discount = $("#discount").val();
		var totalAmount = Number($("#totalAmount").val());
		totalAmount = totalAmount.toFixed(2);

		var grandTotal;
		if (totalAmount) {
			grandTotal = Number($("#totalAmount").val()) - Number($("#discount").val());
			grandTotal = grandTotal.toFixed(2);

			$("#grandTotal").val(grandTotal);
			$("#grandTotalValue").val(grandTotal);
		} else {}

		var paid = $("#paid").val();

		var dueAmount;
		if (paid) {
			dueAmount = Number($("#grandTotal").val()) - Number($("#paid").val());
			dueAmount = dueAmount.toFixed(2);

			$("#due").val(dueAmount);
			$("#dueValue").val(dueAmount);
		} else {
			$("#due").val($("#grandTotal").val());
			$("#dueValue").val($("#grandTotal").val());
		}

	} // /discount function

	function paidAmount() {
		var grandTotal = $("#grandTotal").val();

		if (grandTotal) {
			var dueAmount = Number($("#grandTotal").val()) - Number($("#paid").val());
			dueAmount = dueAmount.toFixed(2);
			$("#due").val(dueAmount);
			$("#dueValue").val(dueAmount);
		} // /if
	} //paid amoutn function
	// /reset order form
	function resetOrderForm() {
		// reset the input field
		$("#createOrderForm")[0].reset();
		// remove remove text danger
		$(".text-danger").remove();
		// remove form group error 
		$(".form-group").removeClass('has-success').removeClass('has-error');
	}
</script>