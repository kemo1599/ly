/* Maintainer:  Dionisis Nikolopoulos - dionisis.nikolopoulos@gugroup.com
   Description: JQuery for Web Optin on the subscribe pages*/

// Helper function to avoid writing getElementById too many times
function gid(sel) {
  return document.getElementById(sel);
}

$(function () {
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  /* GENERAL - MENU */
  if ($("body").length) {
    // Get the URL
    var pathname = window.location.pathname;
    var url      = window.location.href;
    // Make the current menu item active
    $('.navbar.navbar-default.navbar-custom a[href$="' + pathname + '"]').addClass('nav-item-selected');
    /* GENERAL - POPUP LOGIN */
    // Parse MSISDN
    function parseMsisdn(signinMsisdn) {
      // Strip spaces
      signinMsisdn = signinMsisdn.replace(/ /g, '');
      // If MSISDN is more than 9 characters
      if (signinMsisdn.length > 9) {
        // Strip out prefixes
        signinMsisdn = signinMsisdn.replace(/^260+/, "");   //   260123456789
        signinMsisdn = signinMsisdn.replace(/^00260+/, ""); // 00260123456789
        signinMsisdn = signinMsisdn.replace(/^\+260+/, ""); //  +260123456789
        signinMsisdn = signinMsisdn.replace(/^0+/, "");     //     0123456789
        //console.log(signinMsisdn);
      }
      return "260" + signinMsisdn;
    }
    // Parse PIN
    function parsePin(signinPin) {
      // Strip spaces
      signinPin = signinPin.replace(/ /g, '');
      return signinPin;
    }
    // When clicking out of the input field
    $('#signin-msisdn').blur(function () {
      // Get the MSISDN
      var signinMsisdn = $('#signin-msisdn').val();
      // Parse it
      signinMsisdn = parseMsisdn(signinMsisdn);
      // Validate MSISDN
      if (signinMsisdn.length !== 12
       || signinMsisdn.match(/^\d+$/) === false) {
        // Message
        $('#signin-message').html(invalidMsisdn);
      } else {
        // Message
        $('#signin-message').html('');
      }
      // Put it back
      $('#signin-msisdn').val(signinMsisdn);
    });
    // When clicking out of the input field
    $('#signin-pin').blur(function () {
      // Get the PIN
      var signinPin = $('#signin-pin').val();
      // Parse it
      signinPin = parsePin(signinPin);
      // Validate PIN
      if (( signinPin.length !== 4
         && signinPin.length !== 6)
         || signinPin.match(/^\d+$/) === false) {
        // Message
        $('#signin-message').html(invalidPin);
      } else {
        // Message
        $('#signin-message').html('');
      }
      // Put it back
      $('#signin-pin').val(signinPin);
    });
    // When submitting the form
    $('#signin-submit').click(function (event) {
      // Prevent submission of the form
      event.preventDefault();
      // Get form data
      var signinMsisdn = $('#signin-msisdn').val();
      var signinPin    = $('#signin-pin').val();
      var signinTerms  = $('#signin-terms').is(':checked'); // gid('signin-terms').checked;
      // Parse MSISDN
      signinMsisdn = parseMsisdn(signinMsisdn);
      // Parse PIN
      signinPin = parsePin(signinPin);
      // Validate MSISDN
      if (signinMsisdn.length !== 12 || signinMsisdn.match(/^\d+$/) === false) {
        // Error Message
        $('#signin-message').html(invalidMsisdn);
      } else {
        // Validate PIN
        if ((signinPin.length !== 4 && signinPin.length !== 6) || signinPin.match(/^\d+$/) === false) {
          // Error Message
          $('#signin-message').html(invalidPin);
        } else {
          // Validate Terms
          if (signinTerms === false) {
            // Error Message
            $('#signin-message').html(invalidTerms);
          } else {
            // Success Message
            $('#signin-message').html('<span class="small text-success"><i class="fa fa-spinner fa-spin fa-fw"></i> loading...</span>');
            // Prepare data for the form
            var data = {
              pin      : signinPin,
              msisdn   : signinMsisdn,
              terms    : signinTerms,
            };
            // Post data
            $.post(window.location.origin + '/signinajax', data, function (data, status) {
              if (status === 'success') {
                // Push info that a login was made to dataLayer
                window.dataLayer.push({ 'event' : 'User_Login_Success'})
                // Redirect to account
                window.location = '/account';
              } else {
                return '';
              }
            }).fail(function (jqXHR, textStatus, errorThrown) {
              if (jqXHR.responseText) {
                var errorMessage = jQuery.parseJSON(jqXHR.responseText).errorMessage;
                $('#signin-message').html('<span class="small text-warning"><i class="fa fa-exclamation-triangle fa-fw"></i> ' + errorMessage + '</span>');
              } else {
                return 'Sorry No data found';
              }
            });
          }
        }
      }
    });
    // Show login modal
    //$('#loginModal').modal('show');
  }
  /* ACCOUNT */
  if ($("#body-account").length) {
    $('#rundate').select2({
      language:    "en",
      placeholder: "Select a date...",
    });
    $('#rundate').on('select2:select', function (event) {
      // Define targetWrapper
      var targetWrapper = $('#account-drawdate-wrapper');
      // Show a loader
      targetWrapper.html('<div class="text-center" style="margin-top:100px;"><i class="fa fa-spinner fa-spin fa-fw fa-5x"></i></div>');
      // Get drawdate_id
      var drawdate_id = event.params.data.id; // console.log(drawdate_id);
      // Prepare URL
      var url = window.location.origin + '/account/drawdate/' + drawdate_id;
      // Get HTML fragment
      $.get(url, function (data, status) {
        if (status === 'success') {
          targetWrapper.html(data);
        } else {
          targetWrapper.html(data);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.responseText) {
          var errorMessage = jQuery.parseJSON(jqXHR.responseText).errorMessage;
          targetWrapper.html('<span class="small text-warning"><i class="fa fa-exclamation-triangle fa-fw"></i> ' + errorMessage + '</span>');
        } else {
          return 'Sorry No data found';
        }
      });
    });
  }
  /* STATISTICS */
  if ($("#body-statistics").length) {
    Morris.Bar({
      element:      'statistics-bar',
      data:         totals,
      //  data:         [
      //      {y: 01, times: 55, lasttime: 90},
      //      ... ... ...
      //      {y: 49, times: 41, lasttime: 90}
      //  ],
      //  xkey:         'y',
      //  ykeys:        ['times'],       // ['a', 'b'],
      //  labels:       ['Times: '],    // ['Series A', 'Series B'],
      xkey:         'number',
      ykeys:        ['total'],       // ['a', 'b'],
      labels:       ['Times: '],    // ['Series A', 'Series B'],
      resize:       true,
      redraw:       true,
      barColors:    ['#F8CD31'], //['#9b0404'],
      xLabelMargin: 1,
      yLabelMargin: 1,
      onlyIntegers: true,
      pointSize:    0,
    });
  }
  /* SOCIAL */
  if ($("#body-social").length) {
    $('button.btn-generate').on('click', function (event) {
      // Define targetWrapper
      var targetWrapper = $('.generated-number');
      // Show a loader
      targetWrapper.html('<div class="text-center" style="margin-top:0;"><i class="fa fa-spinner fa-spin fa-fw"></i></div>');
      // Prepare URL
      var url = window.location.origin + '/social/generate/';
      // Get HTML fragment
      $.get(url, function (data, status) {
        if (status === 'success') {
          targetWrapper.html(data);
        } else {
          targetWrapper.html(data);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.responseText) {
          var errorMessage = jQuery.parseJSON(jqXHR.responseText).errorMessage;
          targetWrapper.html('<span class="small text-warning"><i class="fa fa-exclamation-triangle fa-fw"></i> ' + errorMessage + '</span>');
        } else {
          return 'Sorry No data found';
        }
      });
    });
  }
  //Web optin
  $('#prefixes li').click(function(e)
    {
      $('#prefixes-button').html( '<span class="caret"></span>  '+ $(this).text() );
    });
  let top = $('.home').height()*0.18;
  let size = $('.home').width()*0.38;
  $('#join-button').css({'margin-top': top+'px'});
  $('#join-button img').css({'width': size+'px','max-width':'260px'});
  $('#join-button').unbind().on('click touch', function () {
    $('#optintModal').modal('show');
  });
});
//Optout
function getPin() {
  var data            = null;
  var xhr             = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      if (this.responseText == "300 NOTOK") {
        //Need the dataLayer push in order to get google analytics.
        window.dataLayer.push({ 'status' : 'msisdn_error', 'event' : 'User_Attempt_MSISDN_Unsub'});
        gid("action-message").innerHTML = "Invalid mobile number";
        gid("msisdn").focus();
      } else if (this.responseText == "200 OK") {
        window.dataLayer.push({ 'event' : 'User_Enter_MSISDN_Unsub'});
        gid("action-message").style.display = "none";
        gid("msisdn").disabled              = true;
        gid("label-pin").style.display      = "block";
        gid("pin").style.display            = "block";
        gid("pin").focus();
        gid("button-pin").style.display    = "none";
        gid("button-optout").style.display = "block";
      } else {
        window.dataLayer.push({ 'status' : 'unknown_error', 'event' : 'User_Attempt_MSISDN_Unsub'});
        gid("action-message").innerHTML = "An error has occured, please try again.";
      }
    }
  });
  xhr.open("GET", window.location.origin + "/participation/unsubscribe/260" + gid('msisdn').value, true);
  xhr.send(data);
}
function cancelSubscription() {
  var data            = null;
  var xhr             = new XMLHttpRequest();
  xhr.withCredentials = true;
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
      gid("action-message").style.display = "block";
      if (this.responseText == "300 NOTOK") {
        window.dataLayer.push({ 'status' : 'pin_error', 'event' : 'User_Attempt_PIN_Unsub'});
        gid("action-message").innerHTML = "Wrong PIN, please try again.";
        gid("pin").focus();
      } else if (this.responseText == "200 OK") {
        window.dataLayer.push({ 'event' : 'User_Unsubbed'});
        gid("action-message").innerHTML = "Thanks, you will receive a confirmation SMS as soon as your subscription is cancelled.";
      } else {
        window.dataLayer.push({ 'status' : 'unknown_error', 'event' : 'User_Attempt_PIN_Unsub'});
        gid("action-message").innerHTML = "An error has occured, please try again.";
      }
    }
  });
  xhr.open("GET", window.location.origin + "/participation/cancel/260" + gid('msisdn').value + "&pin=" + gid('pin').value, true);
  xhr.send(data);
}
// Forgot Password - send event to dataLayer (Google Tag Manager)
function forgotPass () {
  window.dataLayer.push({ 'event' : 'User_Forgot_Password'});
}

// Optin
function getOptinPin() {
  var data            = null;
  var xhr             = new XMLHttpRequest();
  xhr.withCredentials = true;
  var pin_class = gid('pin').className;
  var msisdn_class = gid('msisdn').className;
  var msisdn = gid('msisdn').value;
  var pin = gid('pin').value;
  var prefix = gid('signup_prefix').innerHTML;
  prefix =prefix.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

    if(msisdn[0] == '0'){
      msisdn =msisdn.replace('0','');
    }
    msisdn = prefix.concat(msisdn);
    if(pin_class == 'hidden') {
      if (msisdn == null || msisdn === '' || isNaN(msisdn)==true) {
        //Need the data layer push in order to get google analytics.
        //If the msisdn field is empty
        window.dataLayer.push({ 'status' : 'no_msisdn', 'event' : 'User_Attempt_MSISDN'})
        gid("signup_nomsisdn_warning").className = ' signup_wrongmsisdn_warning';
        gid("msisdn").focus();
      }
      else if (msisdn.length != 12){
        //If the msisdn is not 12 characters long then in UAE it is not correct
        window.dataLayer.push({ 'status' : 'msisdn_error_length', 'event' : 'User_Attempt_MSISDN'})
        gid("signup_nomsisdn_warning").className = ' signup_wrongmsisdn_warning';
        gid("msisdn").focus();
      }
      else if(msisdn.includes('21892') == false && msisdn.includes('21894') == false){
        //Checks if the msisdn has Libyana as the provider
        window.dataLayer.push({ 'status' : 'msisdn_error_prefix', 'event' : 'User_Attempt_MSISDN'})
        gid("signup_nomsisdn_warning").className = ' signup_wrongmsisdn_warning';
        gid("msisdn").focus();
      }
      else{
        gid("signup_nomsisdn_warning").className = 'hidden';
        if(gid("action-message").innerHTML !== ''){
          gid("action-message").innerHTML = ''
        }
        xhr.open("POST", window.location.origin + "/signup_pin/" + msisdn, false);
        xhr.send(data);
        var pin_request_check = xhr.responseText;
        if(pin_request_check == 'false'){
          //Need the data layer push in order to get google analytics.
          window.dataLayer.push({ 'status' : 'msisdn_already_subcribed', 'event' : 'User_Attempt_MSISDN'})
          gid("signup_wrongmsisdn_warning").className = ' signup_wrongmsisdn_warning';
          gid('pin').className = 'hidden';
        } else{
          window.dataLayer.push({ 'event' : 'User_Enter_MSISDN'})
          gid('pin').className = 'sign_in_input';
          gid('msisdn').className = 'hidden';
          gid('sign_in_input-group').className = 'hidden';
          gid('button-optin-pin').className = 'hidden';
          gid('button-optin-verify').className = 'btn btn_subscribe';
          gid("signup_page_header").className = 'hidden';
          gid("signup_page_header_pin").className = 'signup_subscribe';
          gid("signup_terms_warning").className = 'signup_terms_warning';
          gid("signup_wrongmsisdn_warning").className ='hidden';
        }
      }
    }
}
/*pin verification*/
function getVerifyPin() {
  var data            = null;
  var xhr             = new XMLHttpRequest();
  xhr.withCredentials = true;
  var pin_class = gid('pin').className;
  var msisdn_class = gid('msisdn').className;
  var msisdn = gid('msisdn').value;
  var pin = gid('pin').value;
  var prefix = gid('signup_prefix').innerHTML;
  prefix =prefix.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    if(msisdn[0] == '0'){
      msisdn =msisdn.replace('0','');
    }
    msisdn = prefix.concat(msisdn);
    if (pin_class == 'sign_in_input'){
      //The if is for when the pin flow has started. Checking pin for errors
      if (pin == null || pin === '' || isNaN(pin)==true || pin.length != 4) {
        //Need the dataLayer push for google analytics
        window.dataLayer.push({ 'status' : 'pin_error', 'event' : 'User_Attempt_PIN'})
        /*gid("action-message").innerHTML = "Please enter Pin";*/
        gid("signup_wrongpin_warning").className ='hidden';
        gid("signup_nopin_warning").className = ' signup_wrongmsisdn_warning';
        gid("pin").focus();
      } else {
        window.dataLayer.push({ 'status' : 'pin_correct', 'event' : 'User_Attempt_PIN'})
        gid("signup_nopin_warning").className = 'hidden';
        if(gid("action-message").innerHTML !== ''){
          gid("action-message").innerHTML = ''
        }
        xhr.open("POST",
          window.location.origin
          + "/signup_pin_validation/"
          + gid('pin').value+"/"
          + msisdn,
        false);
        xhr.send(data);
        var pin_verification_check = xhr.responseText;
        console.log(pin_verification_check.length);
        var true_val = pin_verification_check.match(/true/g);
        var false_val = pin_verification_check.match(/false/g);
        console.log(true_val);
        if( true_val == 'true'){
          //Need the dataLayer push for google analytics
          window.dataLayer.push({'event' : 'User_Subscribed'})
          gid("login_page").className = 'hidden';
          gid("success_page").className = '';
        }
        else{
          //Need the dataLayer push for google analytics
          window.dataLayer.push({ 'status' : 'pin_error', 'event' : 'User_Attempt_PIN'})
          gid("signup_wrongpin_warning").className = 'signup_wrongmsisdn_warning';
          gid('pin').value = '';
          gid("pin").focus();
        }
      }
    }
}
function opensmsapp() {
  var ua = navigator.userAgent.toLowerCase();
  console.log(ua)
  var url = "sms:";
  if (ua.indexOf("iphone") > -1 || ua.indexOf("ipad") > -1){
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      if (/OS [1-4](.*) like Mac OS X/i.test(navigator.userAgent)) {
        url = "sms:22022&body=22";
      } else {
        url = "sms:22022;body=22";
      }
    }
  }
  else {
    url = "sms:22022?body=22";
  }
  location.href = url;
}
$( document ).ready(function() {
  $('.myaccount_top').css({"height" : window.innerHeight*0.16+"px"});
  $('.msisdn_tab').css({"height" : window.innerHeight*0.25+"px"});
  $('.draw_info').css({"height" : window.innerHeight*0.25+"px"});
  $('#winners_container').css({"height" : window.innerHeight*0.40+"px"});
  $('#service_number').css({"height" : 32+"px"});
  $('#account_video_date').css({"height" : 32+"px"});
});
