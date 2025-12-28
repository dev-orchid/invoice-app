<style>
  .footer {
    position: fixed;
    left: 0;
    bottom: -15px;
    width: 100%;
    background-color: #ffffff;
    color: white;
    text-align: center;
  }
</style>
<?php
include('./constant/connect.php');
include './social_link.php';
?>
<footer class="footer"><b style="color:black">&copy; 2024 Invoice System | Developed by : <a href="javascript:void(0)">Orchid Software </a></b>

</footer>

</div>

</div>


<script src="assets/js/lib/jquery/jquery.min.js"></script>
<script src="assets/js/lib/bootstrap/js/popper.min.js"></script>
<script src="assets/js/lib/bootstrap/js/bootstrap.min.js"></script>

<script src="assets/js/jquery.slimscroll.js"></script>

<script src="assets/js/sidebarmenu.js"></script>

<script src="assets/js/lib/sticky-kit-master/dist/sticky-kit.min.js"></script>
<script src="assets/js/lib/owl-carousel/owl.carousel.min.js"></script>
<script src="assets/js/lib/owl-carousel/owl.carousel-init.js"></script>




<script src="assets/js/custom.min.js"></script>


<script src="assets/js/lib/datatables/datatables.min.js"></script>
<script src="assets/js/lib/datatables/cdn.datatables.net/buttons/1.2.2/js/dataTables.buttons.min.js"></script>
<script src="assets/js/lib/datatables/cdn.datatables.net/buttons/1.2.2/js/buttons.flash.min.js"></script>
<script src="assets/js/lib/datatables/cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js"></script>
<script src="assets/js/lib/datatables/cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/pdfmake.min.js"></script>
<script src="assets/js/lib/datatables/cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/vfs_fonts.js"></script>
<script src="assets/js/lib/datatables/cdn.datatables.net/buttons/1.2.2/js/buttons.html5.min.js"></script>
<script src="assets/js/lib/datatables/cdn.datatables.net/buttons/1.2.2/js/buttons.print.min.js"></script>
<script src="assets/js/lib/datatables/datatables-init.js"></script>

<script src="assets/js/lib/calendar-2/moment.latest.min.js"></script>

<script src="assets/js/lib/calendar-2/semantic.ui.min.js"></script>

<script src="assets/js/lib/calendar-2/pignose.calendar.min.js"></script>

<script src="assets/js/lib/calendar-2/pignose.init.js"></script>

<script src="assets/js/lib/sticky-kit-master/dist/sticky-kit.min.js"></script>
</body>

</html>
<script>
  function alphaOnly(event) {
    var key = event.keyCode;
    return ((key >= 65 && key <= 90) || key == 8);
  };
</script>
<script>
  // WRITE THE VALIDATION SCRIPT.
  function isNumber(evt) {
    var iKeyCode = (evt.which) ? evt.which : evt.keyCode
    if (iKeyCode != 46 && iKeyCode > 31 && (iKeyCode < 48 || iKeyCode > 57))
      return false;

    return true;
  }
</script>