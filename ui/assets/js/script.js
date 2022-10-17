//Load the keys to textareas from the text files, containing PGP keys as text.
var filename, as_base64, as_binary;
var openFile = function(event, id, as_base64) {
  var input = event.target;
  var reader = new FileReader();
  reader.onload = function() {
    var text = reader.result;
    if (text.indexOf(String.fromCharCode(65533)) !== -1) {
      as_base64 = 'as_base64';
      openFile(event, id, as_base64);
      document.getElementById(id).setAttribute('readonly', true);
      document.getElementById(id).setAttribute('title',
                                               'Unsigned character was been found in the source code.\n' +
                                               'Now this content was been uploaded as base64.\n' +
                                               'You can decode original source of this - from base64.\n\n' +
                                               'Double-click here to discard readonly attribute.'
                                              );
    }
    var node = document.getElementById(id);
    if (as_base64 === 'as_base64') {
      node.value = text.split(';base64,')[1];
    } else {
      node.value = text;
    } //console.log(reader.result.substring(0, 200));
  };

  if (input.files[0] === undefined) {
    document.getElementById('filename_temp').innerHTML = 'filename.txt';
  } else {
    //set file name as temporary text in invisible div
    document.getElementById('filename_temp').innerHTML = input.files[0].name;
  }

  if (as_base64 === 'as_base64') {
    reader.readAsDataURL(input.files[0]);
    document.getElementById("filename_temp").innerHTML += '.base64.txt'
  } else {
    reader.readAsText(input.files[0]);
  }
};

function isBase64(str) {
  try {
    return btoa(atob(str)) == str;
  } catch (err) {
    return false;
  }
}

function set_file_name(link, action, as_binary) {

}

//funtion to show and hide download link (button) for empty or filled readonly textarea's
function linkText(input, link, action, as_binary) { //IDs and filename
  link.style.display = 'none' ? 'block' : 'block';
  updateLink(input, link);

  var filename = document.getElementById("filename_temp");
  if (filename === null) {
    console.log('no element with ID ' + filename_temp);
  } else {
    filename_temp = filename.innerHTML;
  }
  if (link === null) {
    console.log('no element with ID ' + link);
  }

  if (as_binary === undefined) {
    if (isBase64(input.value)) {
      if (filename_temp.indexOf('.base64.txt') == -1) {
        filename_temp = filename_temp + '.base64.txt';
      }
    }
  } else {
    if (isBase64(input.value) && filename_temp.indexOf('.base64.txt') != -1) {
      filename_temp = filename_temp.replace('.base64.txt', '');
    }
  }

  function onInput(as_binary, action) {
    updateLink(input, link, as_binary, action);
  }

  input.addEventListener("input", onInput(as_binary, action));
  return onInput;
}

//function to generate download links for buttons.
function updateLink(input, link, as_binary, action) { //
  link.hidden = !input.value;
  if (as_binary === 'as_binary') {
    if (isBase64(input.value)) {
      link.href = "data:application/octet-stream;base64," + encodeURI(input.value); //<-- base64 as binary
    } else {
      link.href = "data:application/octet-stream;charset=utf-8," + encodeURI(input.value); //<-- base64 as binary
    }
  } else {
    link.href = "data:text/plain;charset=UTF-8," + encodeURI(input.value); //<-- data in href
  }
  link.onclick = '';
  link.style.display = (input.value === '') ? 'none' : 'block';

  if (action === 'sign') {
    var suffix = 'signed';
    link.download = filename_temp + '.' + suffix + '.txt';
  } else if (action === 'verify') {
    var suffix = 'verified';

    link.download = //multistring ternary operator
      (filename_temp.indexOf('.signed') === -1) //if true
      ?
      (as_binary === 'as_binary') //check this
      ?
      (isBase64(input.value)) //then check this
      ?
      "raw-message" + '.txt' //if true
    :
    "raw-message" + '.bin.txt' //if false
    :
    (isBase64(input.value)) //if previous false, check this
      ?
      "raw-message" + '.base64.txt' //if true
    :
    "raw-message" + '.txt' //if false
    :
    filename_temp.split('.signed', 1)[0]; //if first - false, do this

  } else if (action === 'encrypt') {
    var suffix = 'encryted';
    link.download = filename_temp + '.encrypted.txt';
  } else if (action === 'decrypt') {
    var suffix = 'decrypted';

    link.download =
      (filename_temp.indexOf('.encrypted') === -1) ?
      (as_binary === 'as_binary') ?
      (isBase64(input.value)) ?
      "Raw_code" + '.txt' :
    "Raw_code" + '.bin.txt' :
    (isBase64(input.value)) ?
      "Raw_code" + '.base64.txt' :
    "Raw_code" + '.txt' :
    filename_temp.split('.encrypted', 1)[0];

  } else if (action === 'sign+encrypt') {
    var suffix = 'signed and encrypted';
    link.download = filename_temp + '.encrypted_and_signed.txt';
  } else if (action === 'decrypt+verify') {
    var suffix = 'decrypted and verified';

    link.download =
      (filename_temp.indexOf('.encrypted_and_signed') === -1) ?
      (filename_temp.indexOf('.signed') === -1) ?
      (as_binary === 'as_binary') ?
      (isBase64(input.value)) ?
      "Raw_code" + '.txt' :
    "Raw_code" + '.bin.txt' :
    (isBase64(input.value)) ?
      "Raw_code" + '.base64.txt' :
    "Raw_code" + '.txt' :
    filename_temp.split('.signed', 1)[0] :
    filename_temp.split('.encrypted_and_signed.txt', 1)[0];
  }

  var filename_notify = 'Filename is: ' + link.getAttribute("download");

  if (as_binary === undefined) {
    link.setAttribute('title', 'Download ' + suffix + ' message as text. \n' +
                      filename_notify
                     );
  } else {
    link.setAttribute('title', 'Download ' + suffix + ' message as binary. \n' +
                      'If in textarea base64 encoded file content - you can download this as binary RAW-data.\n' +
                      filename_notify
                     );
  }
}


$(document).ready(function() {
  /* Dynamic key size menus */
  $('#algorithm').change(function() {
    populateKeysizeDropdown();
    $('#bitlength').removeAttr('disabled');
  });

  /* Set event handlers */
  $('form#keygen').submit(function(e) {
    e.preventDefault();
    genKeyPair();
  });

  $('form#gotogithub').submit(function(e) {
    e.preventDefault();
    goToGithub();
  });

  $('#download_priv_key').on('click', downloadPrivKey);
  $('#download_pub_key').on('click', downloadPubKey);

  $('#name, #email, #comments, #algorithm, #bitlength, #expire, #passphrase').tooltip({
    trigger: 'hover',
    placement: 'top'
  });

  $('[data-toggle="popover"]').popover({
    placement: 'top'
  });

  //discard readonly attribute by double-click on textarea
  //readonly attribute using for protect base64 encoded binary data from any changes.
  $("#sign-plain-text").dblclick(function() {
    $(this).removeAttr("title");
    $(this).removeAttr("readonly");
  });

  $("#Unverified-plain-text").dblclick(function() {
    $(this).removeAttr("title");
    $(this).removeAttr("readonly");
  });

  $("#signencrypt-plain-text").dblclick(function() {
    $(this).removeAttr("title");
    $(this).removeAttr("readonly");
  });

  $("#decryption-encrypted-text").dblclick(function() {
    $(this).removeAttr("title");
    $(this).removeAttr("readonly");
  });

  function goToGithub() {
    var name = $('#togithub_name').val();
    var email = $('#togithub_email').val();
    var signature = $("#signed-text").val();
    var title = encodeURIComponent("Add my signature");
    signature = "```SIGNATURE\n" + signature + "\n```";
    var signatureUriEncoded = encodeURIComponent(signature);

    const issuesURL = "https://github.com/nahankhah/nahankhah.github.io/issues/new?labels=add-signature&template=signature.yaml"

    const url = `${issuesURL}&title=${title}&name=${name}&email=${email}&signature=${signatureUriEncoded}`
    
    window.open(url, "_blank").focus()
  }

  // Function to read the JSON from a file - returns a promise containing the parsed JSON
  async function readRemoteFile(remoteFilePath) {
    return await fetch(remoteFilePath, {mode: 'no-cors'});
  }

  // SIGN
  const statementChecksums = {
    "statement-1": `9d7ff0adad9df7b8e2dfdd067de8f1d4ba999db8b9cbe38254cf939c36c4bd2a  TEST.cleaned.pdf`
  }
  var signButton = $("#sign-button");

  signButton.click(function() {
    var selectedStatement = $("#opt-statements").val();
    // var signPlainText = $("#" + selectedStatement);
    var docChecksum = statementChecksums[selectedStatement];

    var SignedText = $("#signed-text");
    var signPrivateKey = $("#sign-private-key").val();
    var signPassphrase = $("#sign-passphrase").val();

    $('#vrAlert_signed').empty();
    (async () => {
      try {
        const privateKey = await openpgp.readPrivateKey({armoredKey: signPrivateKey})
        const decryptedPrivateKey = await openpgp.decryptKey({privateKey: privateKey, passphrase: signPassphrase});
        
        const message = await openpgp.createMessage({text: docChecksum});
        const detachedSignature = await openpgp.sign({
          message: message,
          signingKeys: decryptedPrivateKey,
          detached: true,
        })
  
        SignedText.val(detachedSignature);
        linkText(document.getElementById('signed-text'), document.getElementById('download-signed-text'), 'sign');

        var clone = $('#vrSuccess').clone();
        clone.find('#vrAddrLabel').html("امضاء با موفقیت تولید شد.");
        clone.appendTo($('#vrAlert_signed'));
      } catch (err) {
        console.log(err)
        var clone = $('#vrError').clone();
        clone.find('#vrAddrLabel').html("کلید یا رمز کلید معتبر نمی باشند.");
        clone.appendTo($('#vrAlert_signed'));
      }
    })();

  });
  //end Sign

  // Verify signature
  var VerifyButton = $("#verify-signature");

  VerifyButton.click(function() {
    var UnverifiedPlainText = $("#Unverified-plain-text");
    var PureText = $("#pure-text");
    var SignerPublicKey = $("#Signer-public-key");

    $('#vrAlert').empty();
    var clone = $('#vrError').clone();

    // import receiver's public key
    var receiver = kbpgp.KeyManager.import_from_armored_pgp({
      armored: SignerPublicKey.val()
    }, function(err, receiver) {
      if (!err) {
        console.log("receiver's public key is loaded");

        // encrypt the message
        var params = {
          msg: UnverifiedPlainText.val(),
          encrypt_for: receiver
        };
        var ring = new kbpgp.keyring.KeyRing;
        ring.add_key_manager(receiver);

        console.log('verify function, key-ring...', ring); //<-- "key is found here."

        kbpgp.unbox({
          keyfetch: ring,
          armored: UnverifiedPlainText.val()
        }, function(err, literals) {
          if (err != null) {
            //here is error if message was been encrypted by RSA public key,
            //but signed by ECC private key.

            //this message means, that "key is found here." not found.
            //this means keyfetch: ring not working correctly.
            //Also, this means that maybe, signing is not doing by ECC private key, and doing by RSA pub, or both...

            clone.find('#vrAddrLabel').html("Message failed to verify! See console.log (F12-button)" + err);
            clone.appendTo($('#vrAlert'));
            return console.log("Problem: " + err);
          } else {
            var text = literals[0].toString();
            console.log("Clear-sig, message without signature: " + text);

            PureText.val(text);
            linkText(document.getElementById('pure-text'), document.getElementById('download-pure-text'), 'verify');
            linkText(document.getElementById('pure-text'), document.getElementById('download_verified_as_binary'), 'verify', 'as_binary');

            var ds = km = null;
            ds = literals[0].get_data_signer();
            if (ds) {
              km = ds.get_key_manager();
            }
            if (km) {
              console.log("Signed by PGP fingerprint");
              var pub_f = receiver.get_pgp_fingerprint().toString('hex');
              var text_f = km.get_pgp_fingerprint().toString('hex');
              console.log(text_f, (pub_f === text_f) ? 'and verified.' : 'and failed to verify.');
              //console.log('fingerprint of public key from private:\n'+pub_f);

              //-> switch alert message
              clone = (pub_f === text_f) ? $('#vrSuccess').clone() : $('#vrWarning').clone();
              clone.find('#vrAddrLabel').html("Message signature is verified with fingerprint: " + pub_f);
            }
            clone.appendTo($('#vrAlert')); //display alert message
          }
        });

      } else {
        console.log("Error!");
        clone.find('#vrAddrLabel').html("Message failed to verify!");
        clone.appendTo($('#vrAlert'));
      }
    });
  });
  //end Verify signature

  // SIGN+Encrypt
  var signencryptButton = $("#signencrypt-button");

  signencryptButton.click(function() {
    //encrypt by pub, then sign by priv
    var signencryptPlainText = $("#signencrypt-plain-text");
    var signencryptText = $("#signencrypt-text");
    var signencryptPrivateKey = $("#signencrypt-private-key");
    var signencryptPassphrase = $("#signencrypt-passphrase");
    var signencryptReceiversPublicKey = $("#signencrypt-receivers-public-key");

    $('#vrAlert3').empty();
    var clone = $('#vrError').clone();

    openpgp.readPrivateKey(signencryptPrivateKey.val()).then((res) => {
      console.log(res, "aoaoao");
    }).catch((err) => {
      console.log("eee", err)
    })
    // var privateKey = openpgp.key.readArmored(signencryptPrivateKey.val()).keys[0];
    // privateKey.decrypt(signencryptPassphrase.val());
    // console.log("YO", privateKey, passphrase)


    // var currUser = kbpgp.KeyManager.import_from_armored_pgp({
    //   armored: signencryptPrivateKey.val()
    // }, function(err, currUser) {
    //   if (!err) {
    //     if (currUser.is_pgp_locked()) {
    //       currUser.unlock_pgp({
    //         passphrase: signencryptPassphrase.val()
    //       }, function(err) {
    //         if (!err) {
    //           console.log("Loaded private key with passphrase");
    //         } else {
    //           clone = $('#vrError').clone();
    //           clone.find('#vrAddrLabel').html("Signing error: Incorrect password for private key.");
    //           clone.appendTo($('#vrAlert3'));
    //         }
    //       });
    //     }
    //   }
    //   // import receiver's public key
    //   var receiver = kbpgp.KeyManager.import_from_armored_pgp({
    //     armored: signencryptReceiversPublicKey.val()
    //   }, function(err, receiver) {
    //     if (!err) {
    //       console.log("receiver's public key is loaded");
    //       console.log(receiver);

    //       var params = {
    //         msg: signencryptPlainText.val(),
    //         sign_with: currUser,
    //         encrypt_for: receiver
    //       };

    //       kbpgp.box(params, function(err, result_string, result_buffer) {
    //         console.log(err, result_string, result_buffer);
    //         signencryptText.val(result_string);
    //         if (currUser === null) {
    //           linkText(document.getElementById('signencrypt-text'), document.getElementById('download-signencrypt-text'), 'encrypt');
    //           clone = $('#vrWarning').clone();
    //           clone.find('#vrAddrLabel').html("Message successfully encrypted, but not signed. Private key not loaded.");
    //         } else {
    //           linkText(document.getElementById('signencrypt-text'), document.getElementById('download-signencrypt-text'), 'sign+encrypt');
    //           clone = $('#vrSuccess').clone();
    //           clone.find('#vrAddrLabel').html("Message successfully encrypted and signed.");
    //         }
    //         clone.appendTo($('#vrAlert3'));
    //       });
    //     } else {
    //       console.log("Error!");
    //       clone = $('#vrError').clone();
    //       clone.find('#vrAddrLabel').html("Encryption error. Incorrect public key.");
    //       clone.appendTo($('#vrAlert3'));
    //     }
    //   });
    // });
  });
  //end SIGN+ENCRYPT

});