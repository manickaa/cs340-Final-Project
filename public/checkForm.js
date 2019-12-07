function checkForm(form)
  {
    var startDate = new Date($('#departure_date').val());
    var endDate = new Date($('#arrival_date').val());
    var todayDate = new Date();
    console.log(todayDate)
    if (startDate > endDate){
    console.log("checking")
    alert("Sometimes we wish we could arrive before we leave. But for reality, the departure date should be before the arrival date. Please check");
    return false;
    }
    if(startDate < todayDate) {
        console.log("checking")
        alert("Haha!! Travelling back in time is not possible! Please update the departure date (must be greater than today's date)");
        return false;
    }
}
